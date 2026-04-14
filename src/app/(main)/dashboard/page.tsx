import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import DashBoardSummary from '@/features/dashboard/components/DashboardSummary';
import DashboardDetail from '@/features/dashboard/components/DashboardDetail';

import { todoQueries, userQueries, goalQueries } from '@/shared/lib/query/queryKeys';

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
  ]);

  const goals = await queryClient.fetchQuery(goalQueries.list());

  await Promise.all(
    (goals.goals ?? [])
      .filter((goal) => goal.id != null)
      .flatMap((goal) => [
        queryClient.prefetchQuery(goalQueries.detail(goal.id!)),
        queryClient.prefetchInfiniteQuery({ ...todoQueries.infiniteList({ goalId: goal.id!, done: false, limit: 10 }), pages: 1 }),
        queryClient.prefetchInfiniteQuery({ ...todoQueries.infiniteList({ goalId: goal.id!, done: true, limit: 10 }), pages: 1 }),
      ]),
  );

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="flex w-full flex-col">
        <DashBoardSummary />
        <DashboardDetail />
      </div>
    </HydrationBoundary>
  );
}
