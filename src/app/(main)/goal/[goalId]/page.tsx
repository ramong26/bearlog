import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import GoalSummary from '@/features/goal/components/GoalSummary';
import GoalDetail from '@/features/goal/components/GoalDetail';

import { userQueries, goalQueries } from '@/shared/lib/query/queryKeys';

/**
 * @description 해당 페이지는 서버 컴포넌트입니다. 클라이언트 컴포넌트로 변경하지 말아주세요
 * 'use client'로 변경 x
 */
interface GoalDetailPageProps {
  params: Promise<{ goalId: string }>;
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { goalId } = await params;
  const numericGoalId = Number(goalId);

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(userQueries.current()),
    queryClient.prefetchQuery(goalQueries.detail(numericGoalId)),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="flex flex-col gap-16">
        <GoalSummary goalId={numericGoalId} />
        <GoalDetail goalId={numericGoalId} />
      </div>
    </HydrationBoundary>
  );
}
