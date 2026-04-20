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
}

const fetchDashboard = new FetchDashboard();
export { fetchDashboard };
