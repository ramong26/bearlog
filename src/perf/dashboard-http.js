import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const TARGET_MODE = (__ENV.TARGET_MODE || 'proxy').toLowerCase();
const DASHBOARD_MODE = (__ENV.DASHBOARD_MODE || 'MANUAL').toUpperCase();
const APPLY_MODE_FILTER = (__ENV.APPLY_MODE_FILTER || 'false').toLowerCase() === 'true';
const SUMMARY_FETCH_MODE = (__ENV.SUMMARY_FETCH_MODE || 'legacy').toLowerCase();
const AUTH_COOKIE = __ENV.AUTH_COOKIE || '';
const ACCESS_TOKEN = __ENV.ACCESS_TOKEN || '';
const REFRESH_TOKEN = __ENV.REFRESH_TOKEN || '';

const GOAL_LIST_LIMIT = toPositiveInt(__ENV.GOAL_LIST_LIMIT, 10);
const MAX_GOALS = toPositiveInt(__ENV.MAX_GOALS, GOAL_LIST_LIMIT);
const RECENT_TODO_LIMIT = toPositiveInt(__ENV.RECENT_TODO_LIMIT, 4);
const TODO_LIMIT = toPositiveInt(__ENV.TODO_LIMIT, 10);
const TODO_DETAIL_LIMIT_PER_GOAL = toPositiveInt(__ENV.TODO_DETAIL_LIMIT_PER_GOAL, TODO_LIMIT * 2);
const SLEEP_SECONDS = toFloat(__ENV.SLEEP_SECONDS, 1);

const DASHBOARD_PAGE_PATH = __ENV.DASHBOARD_PAGE_PATH || '/dashboard';
const PAGE_SCENARIO_ENABLED = (__ENV.PAGE_SCENARIO_ENABLED || 'true').toLowerCase() === 'true';

const goalIdFilter = (__ENV.GOAL_IDS || '')
  .split(',')
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isFinite(value) && value > 0);

export const options = {
  scenarios: {
    // API fan-out 테스트 (실제 데이터 호출 구조 테스트)
    dashboard_api_heavy_load: {
      executor: 'ramping-vus',
      exec: 'dashboardApiLoad',
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
    // 실제 페이지 SSR 요청 테스트
    dashboard_page_ssr_load: {
      executor: 'ramping-arrival-rate',
      exec: 'dashboardPageLoad',
      startRate: PAGE_SCENARIO_ENABLED ? 5 : 0,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 300,
      stages: PAGE_SCENARIO_ENABLED
        ? [
            { duration: '30s', target: 20 },
            { duration: '30s', target: 50 },
            { duration: '30s', target: 80 },
            { duration: '30s', target: 100 },
            { duration: '60s', target: 0 },
          ]
        : [{ duration: '10s', target: 0 }],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
    checks: ['rate>0.95'],
    'http_req_duration{scenario:dashboard_page_ssr_load}': ['p(95)<3000'],
  },
};

export function dashboardApiLoad() {
  const headers = buildHeaders();
  const useSummaryApi = SUMMARY_FETCH_MODE === 'summary-api' && TARGET_MODE === 'proxy';
  let goalsRes = null;
  let recentTodos = [];

  if (useSummaryApi) {
    // 개선된 구조 (BFF)
    // 하나의 API에서 데이터 묶어서 가져옴
    const [summaryRes, goalsResponse] = http.batch([
      ['GET', buildAppUrl('/api/dashboard/summary'), null, requestParams(headers, 'dashboard-summary-api')],
      ['GET', buildUrl('/api/v1/goals', { limit: GOAL_LIST_LIMIT }), null, requestParams(headers, 'dashboard-goals')],
    ]);

    goalsRes = goalsResponse;

    check(summaryRes, {
      'dashboard summary api status is 200': (response) => response.status === 200,
    });
    check(goalsRes, {
      'goals status is 200': (response) => response.status === 200,
    });

    if (summaryRes.status === 200) {
      recentTodos = parseJson(summaryRes)?.data?.todos ?? [];
    }
  } else {
    // 기존 구조 (문제)
    // user / progress / todos 각각 따로 호출
    const [currentUserRes, progressRes, goalsResponse, recentTodosRes] = http.batch([
      ['GET', buildUrl('/api/v1/users/me'), null, requestParams(headers, 'dashboard-current-user')],
      ['GET', buildUrl('/api/v1/users/me/progress'), null, requestParams(headers, 'dashboard-progress')],
      ['GET', buildUrl('/api/v1/goals', { limit: GOAL_LIST_LIMIT }), null, requestParams(headers, 'dashboard-goals')],
      [
        'GET',
        buildUrl('/api/v1/todos', { sort: 'LATEST', search: '', limit: RECENT_TODO_LIMIT }),
        null,
        requestParams(headers, 'dashboard-recent-todos'),
      ],
    ]);

    goalsRes = goalsResponse;

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

    if (recentTodosRes.status === 200) {
      recentTodos = parseJson(recentTodosRes)?.todos ?? [];
    }
  }

  if (goalsRes.status !== 200 && recentTodos.length === 0) {
    sleep(SLEEP_SECONDS);
    return;
  }

  const goalsBody = goalsRes.status === 200 ? parseJson(goalsRes) : null;
  const selectedGoalIds = selectGoalIds(goalsBody?.goals ?? []);

  // goal마다 detail + todos 요청
  const detailAndTodoRequests =
    selectedGoalIds.length > 0
      ? selectedGoalIds.flatMap((goalId) => [
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
        ])
      : [];

  const detailAndTodoResponses = detailAndTodoRequests.length > 0 ? http.batch(detailAndTodoRequests) : [];

  for (const response of detailAndTodoResponses) {
    check(response, {
      'fan-out request status is 200': (res) => res.status === 200,
    });
  }

  const todoDetailIds = new Set();

  // todo마다 또 detail 호출
  for (let i = 0; i < detailAndTodoResponses.length; i += 3) {
    const todoOpenRes = detailAndTodoResponses[i + 1];
    const todoDoneRes = detailAndTodoResponses[i + 2];

    const openTodos = todoOpenRes?.status === 200 ? (parseJson(todoOpenRes)?.todos ?? []) : [];
    const doneTodos = todoDoneRes?.status === 200 ? (parseJson(todoDoneRes)?.todos ?? []) : [];

    const todoIds = [...openTodos, ...doneTodos]
      .map((todo) => todo?.id)
      .filter((id) => Number.isFinite(id) && id > 0)
      .slice(0, TODO_DETAIL_LIMIT_PER_GOAL);

    for (const todoId of todoIds) {
      todoDetailIds.add(todoId);
    }
  }

  for (const todoId of recentTodos.map((todo) => todo?.id).filter((id) => Number.isFinite(id) && id > 0)) {
    todoDetailIds.add(todoId);
  }

  const todoDetailRequests = Array.from(todoDetailIds).map((todoId) => [
    'GET',
    buildUrl(`/api/v1/todos/${todoId}`),
    null,
    requestParams(headers, 'dashboard-todo-detail'),
  ]);

  if (todoDetailRequests.length > 0) {
    const todoDetailResponses = http.batch(todoDetailRequests);

    for (const response of todoDetailResponses) {
      check(response, {
        'todo detail request status is 200': (res) => res.status === 200,
      });
    }
  }

  sleep(SLEEP_SECONDS);
}

export function dashboardPageLoad() {
  if (!PAGE_SCENARIO_ENABLED) {
    sleep(1);
    return;
  }

  const res = http.get(`${BASE_URL}${DASHBOARD_PAGE_PATH}`, requestParams(buildHeaders(), 'dashboard-page-ssr'));

  check(res, {
    'dashboard page status is 200': (response) => response.status === 200,
    'dashboard page ttfb < 1500ms': (response) => response.timings.waiting < 1500,
  });
}

export default function dashboardLoad() {
  dashboardApiLoad();
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

function buildAppUrl(pathname, params) {
  const queryString = toQueryString(params);
  return queryString ? `${BASE_URL}${pathname}?${queryString}` : `${BASE_URL}${pathname}`;
}

function toProxyPath(pathname) {
  // /api/v1/* -> /api/proxy/* mapping for Next.js BFF route.
  return pathname.replace(/^\/api\/v1\/?/, '/api/proxy/');
}

function requestParams(headers, name) {
  return {
    headers,
    tags: {
      name,
      dashboard_mode: DASHBOARD_MODE,
      target_mode: TARGET_MODE,
      summary_fetch_mode: SUMMARY_FETCH_MODE,
    },
  };
}

function selectGoalIds(goals) {
  const goalsWithId = goals.filter((goal) => goal?.id);

  const modeFilteredGoals =
    APPLY_MODE_FILTER && (DASHBOARD_MODE === 'MANUAL' || DASHBOARD_MODE === 'GITHUB')
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
