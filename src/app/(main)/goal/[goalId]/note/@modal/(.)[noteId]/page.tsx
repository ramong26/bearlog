import { dehydrate, QueryClient, HydrationBoundary } from '@tanstack/react-query';
import { noteQueries, goalQueries } from '@/shared/lib/query/queryKeys';
import NoteDetailClient from '@/features/note/components/NoteDetailClient';
import { notFound } from 'next/navigation';
import NoteDetailModal from '@/features/note/components/NoteDetailModal';

export const dynamic = 'force-dynamic';

interface NoteDetailPageProps {
  params: Promise<{ goalId: string; noteId: string }>;
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { goalId, noteId } = await params;

  if (noteId === 'create') {
    return null;
  }

  const queryClient = new QueryClient();

  const [note] = await Promise.all([
    queryClient.fetchQuery(noteQueries.detail(Number(noteId))).catch((error) => {
      console.error(`[NoteDetailPage] noteId=${noteId} fetch failed:`, error);
      return null;
    }),
    queryClient.prefetchQuery(goalQueries.detail(Number(goalId))),
  ]);

  if (!note) notFound();

  const dehydratedState = dehydrate(queryClient);

  return (
    <NoteDetailModal>
      <HydrationBoundary state={dehydratedState}>
        <NoteDetailClient noteId={Number(noteId)} goalId={Number(goalId)} />
      </HydrationBoundary>
    </NoteDetailModal>
  );
}
