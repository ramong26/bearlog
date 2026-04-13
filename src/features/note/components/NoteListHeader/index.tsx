'use client';

import clsx from 'clsx';
import { PlusIcon } from 'lucide-react';

import Button from '@/shared/components/Button';
import FilterButton from '@/shared/components/Button/FilterButton';
import PageHeader from '@/shared/components/PageHeader';
import SearchInput from '@/shared/components/SearchInput';

import { useBreakpoint } from '@/shared/hooks/useBreakPoint';
import { DropdownItemType } from '@/shared/types/types';
import { useLanguage } from '@/shared/contexts/LanguageContext';

interface NoteListHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  sort: string;
  onSortChange: (value: string) => void;
  onCreateNote: () => void;
}

export default function NoteListHeader({
  search,
  onSearchChange,
  onSearch,
  sort,
  onSortChange,
  onCreateNote,
}: NoteListHeaderProps) {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const { t } = useLanguage();

  const items: DropdownItemType[] = [
    { label: t.note.sortLatest, value: 'LATEST' },
    { label: t.note.sortOldest, value: 'OLDEST' },
  ];

  return (
    <section className={clsx('mb-6 flex items-center justify-between md:mb-8 md:gap-4 lg:mb-12')}>
      {!isMobile && <PageHeader title={t.goal.noteCollection} className='shrink-0'/>}
      <div className="flex w-full flex-1 justify-between gap-0 md:justify-end md:gap-2 lg:gap-4">
        <SearchInput
          placeholder={t.note.searchPlaceholder}
          className="max-w-[248px] flex-1 border-gray-300 px-5 py-3 md:px-[17px] md:py-[10px] lg:w-[320px] lg:px-5 lg:py-3"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onIconClick={onSearch}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
        <div className="flex items-center gap-4">
          <Button
            variant="primary"
            onClick={onCreateNote}
            className="ml-2 flex shrink-0 gap-[6px] px-5 py-3 md:ml-0 md:px-[17px] md:py-[10px] lg:px-[18px] lg:py-[10px]"
          >
            <PlusIcon size={20} />
            <span className="text-sm font-semibold transition-all duration-200 lg:text-base">{t.note.registerButton}</span>
          </Button>
          <FilterButton items={items} value={sort} onValueChange={onSortChange} />
        </div>
      </div>
    </section>
  );
}
