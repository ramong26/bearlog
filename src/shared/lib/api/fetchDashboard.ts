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
}

const fetchDashboard = new FetchDashboard();
export { fetchDashboard };
