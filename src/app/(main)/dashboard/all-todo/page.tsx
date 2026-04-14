import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import AllTodoContent from '@/features/dashboard/allTodo/components/AllTodoContent';

import { todoQueries } from '@/shared/lib/query/queryKeys';

export const dynamic = 'force-dynamic';

/**
 * @description 해당 페이지는 서버 컴포넌트입니다. 클라이언트 컴포넌트로 변경하지 말아주세요
 * 'use client'로 변경 x
 */
export default async function AllTodoPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    ...todoQueries.infiniteList(),
    pages: 1,
  });
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <AllTodoContent />
    </HydrationBoundary>
  );
}
