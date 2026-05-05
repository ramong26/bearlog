'use client';
import { useState, useRef, useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';

import Button from '@/shared/components/Button';
import Empty from '@/shared/components/Empty';
import { DataBoundary } from '@/shared/components/ErrorSuspenseBoundary';
import PageHeader from '@/shared/components/PageHeader';
import TaskCardWrapper from '@/features/dashboard/components/TaskCardWrapper';

import { goalQueries, todoQueries } from '@/shared/lib/query/queryKeys';
import { useTodoCreateModal } from '@/features/todo/hooks/useTodoCreateModal';
import type { TodoListResponse } from '@/shared/lib/api';
import { TodoOptions } from '@/shared/types/types';
import { useBreakpoint } from '@/shared/hooks/useBreakPoint';
import { useLanguage } from '@/shared/contexts/LanguageContext';

type TodoItem = NonNullable<TodoListResponse['todos']>[number];

export default function AllTodoContent() {
  const breakpoint = useBreakpoint();
  const { t } = useLanguage();

  const [selectedFilter, setSelectedFilter] = useState<TodoOptions>('ALL');
  const done = selectedFilter === 'ALL' ? undefined : selectedFilter === 'DONE';

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    ...todoQueries.infiniteList({ done }),
    placeholderData: (prev) => prev,
  });

  const allTodos: TodoItem[] = data?.pages.flatMap((page) => page.todos ?? []) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  if (!data) return null;
  return (
    <div className="mx-auto mb-[76px] flex max-w-[720px] flex-col gap-6">
      {breakpoint !== 'mobile' && <PageHeader title={t.allTodo.title} count={totalCount} className="pl-2" />}
      <section className="flex flex-col gap-3">
        <AllTodoFilter todos={allTodos} selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
        {allTodos.length === 0 ? (
          <section className="rounded-4xl bg-white dark:bg-gray-850 p-4 md:p-8 w-full max-w-180 h-204 flex items-center justify-center">
            <Empty>{t.allTodo.empty}</Empty>
          </section>
        ) : (
          <DataBoundary>
            <AllTodoFetcher
              todos={allTodos}
              fetchNextPage={fetchNextPage}
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          </DataBoundary>
        )}
      </section>
    </div>
  );
}

interface AllTodoFilterProps {
  todos: TodoItem[];
  selectedFilter: TodoOptions;
  setSelectedFilter: React.Dispatch<React.SetStateAction<TodoOptions>>;
}
function AllTodoFilter({ todos, selectedFilter, setSelectedFilter }: AllTodoFilterProps) {
  const { openTodoCreateModal } = useTodoCreateModal();
  const { t } = useLanguage();
  const { data: goalList } = useQuery(goalQueries.list());
  const defaultGoalId = todos[0]?.goal?.id ?? goalList?.goals?.[0]?.id;

  const todoButtons: { id: number; label: TodoOptions; translationKey: 'all' | 'todo' | 'done' }[] = [
    { id: 1, label: 'ALL', translationKey: 'all' },
    { id: 2, label: 'TO DO', translationKey: 'todo' },
    { id: 3, label: 'DONE', translationKey: 'done' },
  ];

  return (
    <div className="flex justify-between px-2">
      <div className="flex gap-0 md:gap-2">
        {todoButtons.map((button) => (
          <button
            key={button.id}
            className={`cursor-pointer overflow-hidden rounded-2xl px-4 py-2 text-base font-bold text-ellipsis whitespace-nowrap transition-all duration-200 ${
              selectedFilter === button.label
                ? 'text-bearlog-600 bg-bearlog-500/20'
                : 'hover:text-bearlog-600 hover:bg-bearlog-500/20 text-gray-400'
            }`}
            onClick={() => setSelectedFilter(button.label)}
          >
            {t.allTodo[button.translationKey]}
          </button>
        ))}
      </div>
      <Button
        variant="cancel"
        className="group hover:bg-bearlog-500 flex items-center gap-1 bg-[#F2F2F2] dark:bg-bearlog-500 dark:border-transparent px-3 py-[10px] md:px-[20px]"
        disabled={!defaultGoalId}
        onClick={() => {
          if (!defaultGoalId) return;

          openTodoCreateModal({
            goalDetailId: defaultGoalId,
            todo: {
              title: '',
              goalId: defaultGoalId,
              dueDate: undefined,
              linkUrl: undefined,
              imageUrl: undefined,
              tags: [],
            },
          });
        }}
      >
        <PlusIcon size={20} className="text-gray-500 dark:text-gray-850 group-hover:text-white" />
        <span className="overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap text-gray-500 dark:text-gray-850 group-hover:text-white">
          {t.allTodo.addTodo}
        </span>
      </Button>
    </div>
  );
}

interface AllTodoFetcherProps {
  todos: TodoItem[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}
function AllTodoFetcher({ todos, fetchNextPage, hasNextPage, isFetchingNextPage }: AllTodoFetcherProps) {
  const { t } = useLanguage();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section className="rounded-4xl bg-white dark:bg-gray-850 p-4 md:p-8">
      <div className="mb-6 flex flex-col items-center rounded-2xl bg-[#C6D7D11C] py-[10px]">
        <span className="text-sm text-[#AFB6B4B8]">{t.allTodo.issueReopenNotice1}</span>
        <span className="text-sm text-[#AFB6B4B8]">{t.allTodo.issueReopenNotice2}</span>
      </div>
      <div className="max-h-[816px] overflow-y-auto">
        <div className="flex flex-col gap-4">
          {todos.map((todo) => (
            <TaskCardWrapper key={todo.id} item={todo} mode="todo" />
          ))}
          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-2">
              <span className="text-sm text-gray-400">{t.allTodo.loading}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
