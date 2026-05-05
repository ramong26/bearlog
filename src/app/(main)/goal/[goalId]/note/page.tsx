import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { noteQueries, goalQueries } from '@/shared/lib/query/queryKeys';
import NoteListContainer from '@/features/note/components/NoteListContainer';
import { DataBoundary } from '@/shared/components/ErrorSuspenseBoundary';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(goalQueries.detail(Number(goalId))),
    queryClient.prefetchQuery(noteQueries.list({ goalId: Number(goalId), page: 0, search: '', sort: 'LATEST' })),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="mx-auto flex h-full w-full max-w-[1312px] flex-col">
        <DataBoundary>
          <NoteListContainer goalId={Number(goalId)} />
        </DataBoundary>
      </div>
    </HydrationBoundary>
  );
}
