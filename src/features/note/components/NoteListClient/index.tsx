'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { noteQueries, goalQueries } from '@/shared/lib/query/queryKeys';
import NoteItem from '@/features/note/components/NoteItem';
import GoalItem from '@/features/note/components/GoalItem';
import Pagination from '@/features/note/components/Pagination';
import Empty from '@/shared/components/Empty';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import clsx from 'clsx';

interface NoteListClientProps {
  goalId: number;
  search?: string;
  sort: 'LATEST' | 'OLDEST';
  page: number;
  onPageChange: (page: number) => void;
}

export default function NoteListClient({ goalId, search, sort, page, onPageChange }: NoteListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const { data: goal } = useQuery(goalQueries.detail(goalId));
  const { data: noteList } = useQuery({
    ...noteQueries.list({ goalId, page: page - 1, search, sort }),
    placeholderData: keepPreviousData,
  });

  const notes = (noteList?.notes ?? []).filter((note) => note.id != null);
  const currentPage = (noteList?.pageInfo?.page ?? 0) + 1;
  const totalPages = noteList?.pageInfo?.totalPages ?? 1;

  useEffect(() => {
    if (notes.length === 0 && page > 1 && noteList !== undefined) {
      const next = new URLSearchParams(searchParams.toString());
      next.set('page', String(page - 1));
      router.replace(`?${next.toString()}`);
    }
  }, [notes.length, page, noteList, router, searchParams]);

  return (
    <>
      <section className="mb-3 md:mb-4 lg:mb-5">
        <GoalItem title={goal?.title ?? ''} />
      </section>

      {notes.length === 0 ? (
        <Empty>{t.note.empty}</Empty>
      ) : (
        <section className={clsx('flex flex-col gap-3', 'md:gap-4', 'lg:grid lg:grid-cols-2 lg:gap-5')}>
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={{
                id: note.id!,
                title: note.title ?? '',
                todoId: note.todoId ?? 0,
                createdAt: note.createdAt ?? '',
              }}
              goalId={String(goalId)}
            />
          ))}
        </section>
      )}

      {notes.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </>
  );
}
