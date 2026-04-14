'use client';
import { useState, useRef, useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';

import Button from '@/shared/components/Button';
import Empty from '@/shared/components/Empty';
import { DataBoundary } from '@/shared/components/ErrorSuspenseBoundary';
import PageHeader from '@/shared/components/PageHeader';
import TaskCardWrapper from '@/features/dashboard/components/TaskCardWrapper';
import FavoriteTodoDropdownGoal from '../FavoriteTodoDropdownGoal';

import { goalQueries, todoQueries } from '@/shared/lib/query/queryKeys';
import { useTodoCreateModal } from '@/features/todo/hooks/useTodoCreateModal';
import type { TodoListResponse } from '@/shared/lib/api';
import { TodoOptions } from '@/shared/types/types';
import { useBreakpoint } from '@/shared/hooks/useBreakPoint';
import { useLanguage } from '@/shared/contexts/LanguageContext';

type TodoItem = NonNullable<TodoListResponse['todos']>[number];

export default function FavoriteTodoContent() {
  const breakpoint = useBreakpoint();
  const { t } = useLanguage();

  const [selectedFilter, setSelectedFilter] = useState<TodoOptions>('ALL');
  const done = selectedFilter === 'ALL' ? undefined : selectedFilter === 'DONE';

  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const goalId = selectedGoal ? Number(selectedGoal) : undefined;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    ...todoQueries.infiniteList({ done, favorite: true, goalId }),
    placeholderData: (prev) => prev,
  });

  const allTodos: TodoItem[] = data?.pages.flatMap((page) => page.todos ?? []) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  if (!data) return null;

  return (
    <div className="mx-auto mb-[76px] flex max-w-[720px] flex-col gap-6">
      {breakpoint !== 'mobile' && (
        <PageHeader title={t.sidebar.favoriteTodo} count={totalCount} className="pl-2" />
      )}
      <section className="flex flex-col gap-3">
        <FavoriteTodoFilter
          todos={allTodos}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />
        <DataBoundary>
          <FavoriteTodoFetcher
            todos={allTodos}
            fetchNextPage={fetchNextPage}
            hasNextPage={!!hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            selectedGoal={selectedGoal}
            setSelectedGoal={setSelectedGoal}
          />
        </DataBoundary>
      </section>
    </div>
  );
}

interface FavoriteTodoFilterProps {
  todos: TodoItem[];
  selectedFilter: TodoOptions;
  setSelectedFilter: React.Dispatch<React.SetStateAction<TodoOptions>>;
}
function FavoriteTodoFilter({ todos, selectedFilter, setSelectedFilter }: FavoriteTodoFilterProps) {
  const { t } = useLanguage();
  const { openTodoCreateModal } = useTodoCreateModal();
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
        className="group hover:bg-bearlog-500 flex items-center gap-1 bg-[#F2F2F2] px-3 py-[10px] md:px-[20px]"
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
        <PlusIcon size={20} className="text-gray-500 group-hover:text-white" />
        <span className="overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap text-gray-500 group-hover:text-white">
          {t.allTodo.addTodo}
        </span>
      </Button>
    </div>
  );
}

interface FavoriteTodoFetcherProps {
  todos: TodoItem[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  selectedGoal: string;
  setSelectedGoal: React.Dispatch<React.SetStateAction<string>>;
}
function FavoriteTodoFetcher({
  todos,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  selectedGoal,
  setSelectedGoal,
}: FavoriteTodoFetcherProps) {
  const { t } = useLanguage();
  const { data: goalList } = useQuery(goalQueries.list());
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

  const goalItems = [
    { label: t.allTodo.allGoal, value: '' },
    ...(goalList?.goals?.map((goal) => ({ label: goal.title ?? '', value: String(goal.id) })) ?? []),
  ];

  return (
    <section className="flex flex-col gap-5 rounded-4xl bg-white p-4 md:p-8">
      <FavoriteTodoDropdownGoal
        selectedValue={selectedGoal}
        onSelectItem={(item) => setSelectedGoal(item.value)}
        items={goalItems}
      />
      <div className="max-h-[620px] overflow-y-auto">
        <div className="flex flex-col gap-4">
          {todos.length === 0 ? (
            <Empty>{t.allTodo.empty}</Empty>
          ) : (
            todos.map((todo) => <TaskCardWrapper key={todo.id} item={todo} mode="todo" />)
          )}
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
