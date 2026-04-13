import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import DashBoardSummary from '@/features/dashboard/components/DashboardSummary';
import DashboardDetail from '@/features/dashboard/components/DashboardDetail';

import { goalQueries, todoQueries, userQueries } from '@/shared/lib/query/queryKeys';
import { DataBoundary } from '@/shared/components/ErrorSuspenseBoundary';
import DashboardDetailSkeleton from '@/features/dashboard/components/DashboardDetailSkeleton';

export const dynamic = 'force-dynamic';

/**
 * @description 해당 페이지는 서버 컴포넌트입니다. 클라이언트 컴포넌트로 변경하지 말아주세요
 * 'use client'로 변경 x
 */

export default async function DashboardPage() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(userQueries.current()),
    queryClient.prefetchQuery(userQueries.progress()),
    queryClient.prefetchQuery(todoQueries.list({ sort: 'LATEST', search: '', limit: 4 })),
    queryClient.prefetchQuery(goalQueries.list()),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <div className="flex w-full flex-col">
      <HydrationBoundary state={dehydratedState}>
        <DashBoardSummary />

        <DataBoundary suspenseFallback={<DashboardDetailSkeleton />}>
          <DashboardDetail />
        </DataBoundary>
      </HydrationBoundary>
    </div>
  );
}
