import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import DashBoardSummary from '@/features/dashboard/components/DashboardSummary';
import DashboardDetail from '@/features/dashboard/components/DashboardDetail';
import DashboardDetailSkeleton from '@/features/dashboard/components/DashboardDetailSkeleton';

import { dashboardKeys } from '@/shared/lib/query/keyFactory';
import { getDashboardSummary } from '@/features/dashboard/lib/getDashboardSummary';
import { DataBoundary } from '@/shared/components/ErrorSuspenseBoundary';

export const dynamic = 'force-dynamic';

/**
 * @description 해당 페이지는 서버 컴포넌트입니다. 클라이언트 컴포넌트로 변경하지 말아주세요
 * 'use client'로 변경 x
 */

export default async function DashboardPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: async () => (await getDashboardSummary()).data,
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <div className="flex w-full flex-col">
      <HydrationBoundary state={dehydratedState}>
        <DashBoardSummary />
      </HydrationBoundary>

      <DataBoundary suspenseFallback={<DashboardDetailSkeleton />}>
        <DashboardDetail />
      </DataBoundary>
    </div>
  );
}
