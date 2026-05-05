'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

import Button from '@/shared/components/Button';
import Empty from '@/shared/components/Empty';
import Progressbar from '@/shared/components/Progressbar';
import SearchInput from '@/shared/components/SearchInput';
import TaskCardWrapper from '../TaskCardWrapper';

import { useTodoCreateModal } from '@/features/todo/hooks/useTodoCreateModal';
import { useGithubTodoCreateModal } from '@/features/todo/hooks/useGithubTodoCreateModal';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { todoQueries } from '@/shared/lib/query/queryFunction';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { DashboardDetailTodosResponse } from '@/shared/types/api/schemas/api.process';
import { TodoResponse } from '@/shared/lib/api';

interface GoalBoxProps {
  data: DashboardDetailTodosResponse;
}
export default function GoalBox({ data }: GoalBoxProps) {
  const { openTodoCreateModal } = useTodoCreateModal();
  const { openGithubTodoCreateModal } = useGithubTodoCreateModal();
  const { t } = useLanguage();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);
  const isSearching = debouncedSearch.length > 0;
  const goalId = data.goal.id;

  const { data: searchResult } = useQuery({
    ...todoQueries.list({ sort: 'LATEST', search: debouncedSearch, goalId }),
    placeholderData: keepPreviousData,
    enabled: isSearching,
  });

  const searchTodoItems = isSearching ? (searchResult?.todos.filter((todo) => !todo.done) ?? null) : null;
  const searchDoneItems = isSearching ? (searchResult?.todos.filter((todo) => todo.done) ?? null) : null;

  const isGithubGoal = data.goal.source === 'GITHUB';

  const handleAddTodo = () => {
    if (isGithubGoal) {
      openGithubTodoCreateModal({
        goalId,
        goalTitle: data.goal.title,
      });
    } else {
      openTodoCreateModal({
        goalDetailId: goalId,
        todo: {
          title: '',
          goalId,
          dueDate: undefined,
          linkUrl: undefined,
          imageUrl: undefined,
          tags: [],
        },
      });
    }
  };

  const noSearchResults = isSearching && searchTodoItems?.length === 0 && searchDoneItems?.length === 0;

  return (
<<<<<<< HEAD
    <article className="flex flex-col gap-4 rounded-[40px] bg-white dark:bg-gray-850 p-6 lg:px-8 lg:py-6">
=======
    <article className="dark:bg-gray-850 flex flex-col gap-4 rounded-[40px] bg-white p-6 lg:px-8 lg:py-6">
>>>>>>> 97ec23b9b02894d7b559c607539a8f29546a813a
      <div className="flex flex-col items-center gap-2 px-2 md:flex-row md:gap-12 lg:gap-8">
        <GoalName data={data} />

        <div className="flex w-full flex-1 justify-between gap-0 md:justify-end md:gap-2 lg:gap-[14px]">
          <SearchInput
            placeholder={t.todo.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button
            variant="primary"
            className="p-[10px] md:px-[14.5px] md:px-[18px] md:py-[10px] lg:py-[10px]"
            onClick={handleAddTodo}
          >
            <PlusIcon size={20} />
            <span className="hidden w-max text-sm font-semibold md:block">
              {isGithubGoal ? t.todo.addGithubTodo : t.todo.addTodo}
            </span>
          </Button>
        </div>
      </div>

      <div className="flex w-full flex-col justify-around gap-2 md:flex-row lg:gap-8">
        {noSearchResults ? (
          <div className="h-40 md:h-80">
            <Empty>{t.todo.noSearchResult}</Empty>
          </div>
        ) : (
          <>
            <ListBox
              title={t.allTodo.todo}
              mode="todo"
              defaultItems={data.openTodos}
              searchItems={searchTodoItems}
            />
            <ListBox
              title={t.allTodo.done}
              mode="done"
              defaultItems={data.doneTodos}
              searchItems={searchDoneItems}
            />
          </>
        )}
      </div>
    </article>
  );
}

interface GoalNameProps {
  data: DashboardDetailTodosResponse;
}
function GoalName({ data }: GoalNameProps) {
  const router = useRouter();

  return (
    <div className="flex w-full flex-1 flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="w-full max-w-[229px]">
          <button
            onClick={() => {
              router.push(`goal/${data.goal.id}`);
            }}
            className="font-base overflow-hidden text-left font-semibold text-ellipsis whitespace-nowrap text-gray-700 dark:text-gray-200"
          >
            {data.goal.title}
          </button>
        </div>
        <Progressbar progress={data.goal.progress ?? 0} />
      </div>
    </div>
  );
}

interface ListBoxProps {
  title: string;
  mode: 'todo' | 'done';
  defaultItems: TodoResponse[];
  searchItems: TodoResponse[] | null;
}
<<<<<<< HEAD
function ListBox({ title, mode, goalId, searchItems }: ListBoxProps) {
=======
function ListBox({ title, mode, defaultItems, searchItems }: ListBoxProps) {
>>>>>>> 97ec23b9b02894d7b559c607539a8f29546a813a
  const bgColor = mode === 'todo' ? 'bg-[#E5F9F2] dark:bg-gray-750' : 'bg-white dark:bg-gray-750';
  const textColor = mode === 'todo' ? 'text-[#00D185]' : 'text-gray-400';
  const items = searchItems ?? defaultItems;

  return (
    <div
      className={`flex h-[324px] flex-1 flex-col gap-4 overflow-hidden rounded-[16px] ${bgColor} p-4 lg:rounded-[24px] lg:p-6`}
    >
      <span className={`shrink-0 text-sm font-bold ${textColor} lg:text-base`}>{title}</span>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex w-full min-w-0 flex-col gap-1">
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((item) => (
              <TaskCardWrapper key={item.id} item={item} todo={item} mode={mode} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
