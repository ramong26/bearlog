import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { noteQueries, goalQueries, todoQueries } from '@/shared/lib/query/queryKeys';
import NoteEditClient from '@/features/note/components/NoteEditClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function NoteEditPage({ params }: { params: Promise<{ goalId: string; noteId: string }> }) {
  const { goalId, noteId } = await params;

  const queryClient = new QueryClient();

  const note = await queryClient.fetchQuery(noteQueries.detail(Number(noteId))).catch((error) => {
    console.error(`[NoteEditPage] noteId=${noteId} fetch failed:`, error);
    return null;
  });
  if (!note) notFound();

  await Promise.all([
    queryClient.prefetchQuery(goalQueries.detail(Number(goalId))),
    note.todoId ? queryClient.prefetchQuery(todoQueries.detail(note.todoId)) : Promise.resolve(),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteEditClient noteId={Number(noteId)} goalId={Number(goalId)} />
    </HydrationBoundary>
  );
}
