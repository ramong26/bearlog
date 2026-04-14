'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import NoteListHeader from '@/features/note/components/NoteListHeader';
import NoteListClient from '@/features/note/components/NoteListClient';
import { useModalStore } from '@/shared/stores/useModalStore';

import NoteCreateModal from '../NoteCreateModal';

interface NoteListContainerProps {
  goalId: number;
}

export default function NoteListContainer({ goalId }: NoteListContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openModal } = useModalStore();

  const [searchInput, setSearchInput] = useState('');

  const submittedSearch = searchParams.get('search') ?? '';
  const sort = (searchParams.get('sort') as 'LATEST' | 'OLDEST') ?? 'LATEST';
  const page = Number(searchParams.get('page') ?? '1') || 1;

  const updateParams = (params: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => next.set(key, value));
    router.replace(`?${next.toString()}`);
  };

  const handleCreateButtonClick = () => {
    openModal(
      <NoteCreateModal
        goalId={goalId}
        onConfirm={(todoId) => router.push(`/goal/${goalId}/note/create?todoId=${todoId}`)}
      />,
    );
  };

  return (
    <>
      <NoteListHeader
        search={searchInput}
        onSearchChange={setSearchInput}
        onSearch={() => updateParams({ search: searchInput, page: '1' })}
        sort={sort}
        onSortChange={(v) => {
          if (v === 'LATEST' || v === 'OLDEST') {
            updateParams({ sort: v, page: '1' });
          }
        }}
        onCreateNote={handleCreateButtonClick}
      />
      <NoteListClient
        goalId={goalId}
        search={submittedSearch}
        sort={sort}
        page={page}
        onPageChange={(p) => updateParams({ page: String(p) })}
      />
    </>
  );
}
