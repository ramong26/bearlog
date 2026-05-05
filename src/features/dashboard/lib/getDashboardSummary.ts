import { fetchDashboard, type DashboardSummaryResult } from '@/shared/lib/api/fetchDashboard';

export async function getDashboardSummary(): Promise<DashboardSummaryResult> {
  return fetchDashboard.getDashboardSummaryResult();
}
