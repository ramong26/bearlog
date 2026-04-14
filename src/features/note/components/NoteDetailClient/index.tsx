'use client';

import { useQuery } from '@tanstack/react-query';
import { noteQueries, goalQueries, todoQueries } from '@/shared/lib/query/queryKeys';
import EditorTitle from '@/features/note/components/NoteEditor/EditorTitle';
import EditorMeta from '@/features/note/components/NoteEditor/EditorMeta';
import EditorContent from '@/features/note/components/NoteEditor/EditorContent';
import { mapNoteTagsFromSource } from '@/features/note/utils/utils';
import { useLanguage } from '@/shared/contexts/LanguageContext';

interface NoteDetailClientProps {
  noteId: number;
  goalId: number;
}

export default function NoteDetailClient({ noteId, goalId }: NoteDetailClientProps) {
  const { t } = useLanguage();
  const { data: note, isLoading: isNoteLoading, isError: isNoteError } = useQuery(noteQueries.detail(noteId));
  const { data: goal } = useQuery(goalQueries.detail(goalId));
  const { data: todo } = useQuery({
    ...todoQueries.detail(note?.todoId ?? 0),
    enabled: note?.todoId != null,
  });

  if (isNoteLoading) {
    return <p className="p-10 text-center text-sm text-gray-500">{t.note.loading}</p>;
  }

  if (isNoteError || !note) {
    return <p className="p-10 text-center text-sm text-gray-500">{t.note.loadFail}</p>;
  }

  const tags = mapNoteTagsFromSource({
    source: note.source,
    tags: todo?.tags,
    sourceItemId: note.sourceItemId,
    status: note.status,
  });

  return (
    <div className="p-5 md:p-10">
      <div className="flex items-center justify-between">
        <EditorTitle title={note.title ?? ''} readOnly />
      </div>
      <EditorMeta
        goal={{ title: goal?.title ?? '' }}
        todos={{ title: note.todo?.title ?? '', done: note.todo?.done ?? false }}
        tags={tags}
        createdAt={note.createdAt ?? ''}
      />
      <hr className="mt-4 mb-5 border-[#DDD] md:mt-6" />
      <EditorContent content={note.content ?? ''} linkUrl={note.linkUrl} readOnly />
    </div>
  );
}
