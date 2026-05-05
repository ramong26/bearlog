<<<<<<< HEAD
import { fetchTodos } from './fetchTodos';
import { fetchUsers } from './fetchUsers';
import type { DashboardSummaryResponse } from '@/shared/types/api/schemas/api.process';

const TODO_RECENT_LIMIT = 4;

export interface DashboardSummaryErrors {
  user?: 'failed';
  progress?: 'failed';
  todos?: 'failed';
}

export interface DashboardSummaryResult {
  data: DashboardSummaryResponse;
  errors: DashboardSummaryErrors;
  hasAnySuccess: boolean;
}

class FetchDashboard {
  getDashboardSummaryResult = async (): Promise<DashboardSummaryResult> => {
    const [userRes, progressRes, todoRecentRes] = await Promise.allSettled([
      fetchUsers.getCurrentUser(),
      fetchUsers.getUserProgress(),
      fetchTodos.getTodos({
        sort: 'LATEST',
        search: '',
        limit: TODO_RECENT_LIMIT,
      }),
    ]);

    const user = userRes.status === 'fulfilled' ? userRes.value : null;
    const progress = progressRes.status === 'fulfilled' ? progressRes.value : null;
    const todos = todoRecentRes.status === 'fulfilled' ? todoRecentRes.value : null;

    const errors: DashboardSummaryErrors = {
      user: userRes.status === 'rejected' ? 'failed' : undefined,
      progress: progressRes.status === 'rejected' ? 'failed' : undefined,
      todos: todoRecentRes.status === 'rejected' ? 'failed' : undefined,
    };

    return {
      data: {
        user: user ? { id: user.id, nickname: user.nickname, githubConnected: user.githubConnected } : null,
        progress: progress ? { totalProgress: progress.totalProgress } : null,
        todos: todos?.todos ?? [],
      },
      errors,
      hasAnySuccess: Boolean(user || progress || todos),
    };
  };

  getDashboardSummary = async (): Promise<DashboardSummaryResponse> => {
    if (typeof window === 'undefined') {
      const { data } = await this.getDashboardSummaryResult();
=======
import type { DashboardSummaryResponse } from '@/shared/types/api/schemas/api.process';
import type { DashboardDetailTodosResponse } from '@/shared/types/api/schemas/api.process';
import { DashboardSummaryResult } from '../customApi/getDashboardSummaryResult';
import { getDashboardSummaryResult } from '../customApi/getDashboardSummaryResult';

interface DashboardDetailTodosApiResult {
  data: { items: DashboardDetailTodosResponse[] };
  errors?: {
    goal?: 'failed';
    todos?: 'failed';
  };
  hasAnySuccess?: boolean;
}

class FetchDashboard {
  getDashboardSummary = async (): Promise<DashboardSummaryResponse> => {
    if (typeof window === 'undefined') {
      const { data } = await getDashboardSummaryResult();
>>>>>>> 97ec23b9b02894d7b559c607539a8f29546a813a
      return data;
    }

    const response = await fetch('/api/dashboard/summary', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Dashboard summary request failed: ${response.status}`);
    }

    const payload = (await response.json()) as DashboardSummaryResult;
    return payload.data;
  };
<<<<<<< HEAD
=======

  getDashboardDetailTodos = async (goalIds?: number[]): Promise<{ items: DashboardDetailTodosResponse[] }> => {
    const params = new URLSearchParams();
    const normalizedGoalIds = (goalIds ?? []).filter((id) => Number.isInteger(id) && id > 0);
    if (normalizedGoalIds.length > 0) {
      params.set('goalIds', normalizedGoalIds.join(','));
    }

    const requestUrl = params.size > 0 ? `/api/dashboard/detail?${params.toString()}` : '/api/dashboard/detail';
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Dashboard detail todos request failed: ${response.status}`);
    }

    const payload = (await response.json()) as DashboardDetailTodosApiResult;
    return payload.data;
  };
>>>>>>> 97ec23b9b02894d7b559c607539a8f29546a813a
}

const fetchDashboard = new FetchDashboard();
export { fetchDashboard };
