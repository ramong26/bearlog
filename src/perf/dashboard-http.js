import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const TARGET_MODE = (__ENV.TARGET_MODE || 'proxy').toLowerCase();
const DASHBOARD_MODE = (__ENV.DASHBOARD_MODE || 'ALL').toUpperCase();
const AUTH_COOKIE = __ENV.AUTH_COOKIE || '';
const ACCESS_TOKEN = __ENV.ACCESS_TOKEN || '';
const REFRESH_TOKEN = __ENV.REFRESH_TOKEN || '';

const GOAL_LIST_LIMIT = toPositiveInt(__ENV.GOAL_LIST_LIMIT, 10);
const MAX_GOALS = toPositiveInt(__ENV.MAX_GOALS, GOAL_LIST_LIMIT);
const TODO_LIMIT = toPositiveInt(__ENV.TODO_LIMIT, 10);
const SLEEP_SECONDS = toFloat(__ENV.SLEEP_SECONDS, 1);

const goalIdFilter = (__ENV.GOAL_IDS || '')
  .split(',')
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isFinite(value) && value > 0);

/**
 * @description
 * 실제 대시보드의 요청을 흉내 내는 k6 스크립트입니다.
 *
 * 1) /users/me
 * 2) /users/me/progress
 * 3) /goals
 * 4) /todos?sort=LATEST
 * 5) goal 수만큼 /goals/{id}, /todos?goalId={id}&done=false, /todos?goalId={id}&done=true
 *
 * 기본값은 현재 대시보드 코드와 비슷하게 맞추고,
 * env 를 올리면 goal 이 많고 goal 별 todo 가 많을 때 API 가 버티는지 보는 용도로 쓸 수 있습니다.
 *
 * 예시:
 * k6 run perf/dashboard-http.js
 * k6 run -e BASE_URL=http://localhost:3000 -e AUTH_COOKIE="accessToken=...; refreshToken=..." perf/dashboard-http.js
 * k6 run -e GOAL_LIST_LIMIT=50 -e MAX_GOALS=50 -e TODO_LIMIT=200 -e DASHBOARD_MODE=ALL perf/dashboard-http.js
 * k6 run -e TARGET_MODE=api -e BASE_URL=https://api.example.com -e ACCESS_TOKEN=... perf/dashboard-http.js
 */
export const options = {
  scenarios: {
    dashboard_heavy_load: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '30s', target: 200 },
        { duration: '30s', target: 300 },
        { duration: '30s', target: 400 },
        { duration: '30s', target: 500 },
        { duration: '60s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
    checks: ['rate>0.95'],
  },
};

export default function dashboardLoad() {
  const headers = buildHeaders();

  const bootstrapResponses = http.batch([
    ['GET', buildUrl('/api/v1/users/me'), null, requestParams(headers, 'dashboard-current-user')],
    ['GET', buildUrl('/api/v1/users/me/progress'), null, requestParams(headers, 'dashboard-progress')],
    ['GET', buildUrl('/api/v1/goals', { limit: GOAL_LIST_LIMIT }), null, requestParams(headers, 'dashboard-goals')],
    ['GET', buildUrl('/api/v1/todos', { sort: 'LATEST' }), null, requestParams(headers, 'dashboard-recent-todos')],
  ]);

  const [currentUserRes, progressRes, goalsRes, recentTodosRes] = bootstrapResponses;

  console.log(`Users/me: ${currentUserRes.status}`);
  console.log(`Users/me/progress: ${progressRes.status}`);
  console.log(`Goals: ${goalsRes.status}`);
  console.log(`Recent todos: ${recentTodosRes.status}`);

  check(currentUserRes, {
    'current user status is 200': (response) => response.status === 200,
  });
  check(progressRes, {
    'progress status is 200': (response) => response.status === 200,
  });
  check(goalsRes, {
    'goals status is 200': (response) => response.status === 200,
  });
  check(recentTodosRes, {
    'recent todos status is 200': (response) => response.status === 200,
  });

  if (goalsRes.status !== 200) {
    sleep(SLEEP_SECONDS);
    return;
  }

  const body = parseJson(goalsRes);
  const selectedGoalIds = selectGoalIds(body?.goals ?? []);

  if (selectedGoalIds.length === 0) {
    sleep(SLEEP_SECONDS);
    return;
  }

  const detailAndTodoRequests = selectedGoalIds.flatMap((goalId) => [
    ['GET', buildUrl(`/api/v1/goals/${goalId}`), null, requestParams(headers, 'dashboard-goal-detail')],
    [
      'GET',
      buildUrl('/api/v1/todos', { goalId, done: false, limit: TODO_LIMIT, sort: 'LATEST' }),
      null,
      requestParams(headers, 'dashboard-goal-todos-open'),
    ],
    [
      'GET',
      buildUrl('/api/v1/todos', { goalId, done: true, limit: TODO_LIMIT, sort: 'LATEST' }),
      null,
      requestParams(headers, 'dashboard-goal-todos-done'),
    ],
  ]);

  const detailAndTodoResponses = http.batch(detailAndTodoRequests);

  for (const response of detailAndTodoResponses) {
    check(response, {
      'fan-out request status is 200': (res) => res.status === 200,
    });
  }

  sleep(SLEEP_SECONDS);
}

function buildHeaders() {
  const headers = {
    Accept: 'application/json',
  };

  if (TARGET_MODE === 'api' && ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  }

  if (TARGET_MODE === 'proxy') {
    const cookies = [];
    if (ACCESS_TOKEN) cookies.push(`accessToken=${ACCESS_TOKEN}`);
    if (REFRESH_TOKEN) cookies.push(`refreshToken=${REFRESH_TOKEN}`);
    if (AUTH_COOKIE) cookies.push(AUTH_COOKIE);

    if (cookies.length > 0) {
      headers.Cookie = cookies.join('; ');
    }
  }

  return headers;
}

function buildUrl(pathname, params) {
  const normalizedPath = TARGET_MODE === 'api' ? pathname : toProxyPath(pathname);
  const queryString = toQueryString(params);

  return queryString ? `${BASE_URL}${normalizedPath}?${queryString}` : `${BASE_URL}${normalizedPath}`;
}

function toProxyPath(pathname) {
  return pathname.replace(/^\/api\/v1\/?/, '/api/proxy/');
}

function requestParams(headers, name) {
  return {
    headers,
    tags: {
      name,
      dashboard_mode: DASHBOARD_MODE,
      target_mode: TARGET_MODE,
    },
  };
}

function selectGoalIds(goals) {
  const goalsWithId = goals.filter((goal) => goal?.id);
  const modeFilteredGoals =
    DASHBOARD_MODE === 'MANUAL' || DASHBOARD_MODE === 'GITHUB'
      ? goalsWithId.filter((goal) => goal.source === DASHBOARD_MODE)
      : goalsWithId;
  const filteredGoals =
    goalIdFilter.length > 0 ? modeFilteredGoals.filter((goal) => goalIdFilter.includes(goal.id)) : modeFilteredGoals;
  const limitedGoals = MAX_GOALS > 0 ? filteredGoals.slice(0, MAX_GOALS) : filteredGoals;

  return limitedGoals.map((goal) => goal.id);
}

function parseJson(response) {
  try {
    return response.json();
  } catch {
    return null;
  }
}

function toQueryString(params) {
  if (!params) {
    return '';
  }

  const queryParts = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }

  return queryParts.join('&');
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toFloat(value, fallback) {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}
