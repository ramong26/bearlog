'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CalendarIcon, PlusIcon } from 'lucide-react';

import PageSubTitle from '@/shared/components/PageSubTitle';
import Button from '@/shared/components/Button';
import Empty from '@/shared/components/Empty';
import TaskCardWrapper from '@/features/dashboard/components/TaskCardWrapper';

import { goalQueries } from '@/shared/lib/query/queryKeys';
import { useTodoCreateModal } from '@/features/todo/hooks/useTodoCreateModal';
import { useGithubTodoCreateModal } from '@/features/todo/hooks/useGithubTodoCreateModal';
import { useLanguage } from '@/shared/contexts/LanguageContext';

interface GoalDetailProps {
  goalId: number;
}
export default function GoalDetail({ goalId }: GoalDetailProps) {
  const { t } = useLanguage();
  const { openTodoCreateModal } = useTodoCreateModal();
  const { openGithubTodoCreateModal } = useGithubTodoCreateModal();

  const { data: goalDetail } = useQuery({
    ...goalQueries.detail(goalId),
    enabled: !!goalId,
  });

  const isGithubGoal = goalDetail?.source === 'GITHUB';

  const handleAddTodo = () => {
    if (isGithubGoal) {
      openGithubTodoCreateModal({
        goalId,
        goalTitle: goalDetail?.title,
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

  return (
    <section className="flex flex-col gap-8 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
        <PageSubTitle
          subTitle="TO DO"
          textClassName="font-semibold"
          actions={
            <div className="flex gap-2">
              <Button
                variant="cancel"
                className="rounded-full border border-gray-300 bg-inherit p-2.5 md:px-4.5 md:py-2.5 lg:py-2.5 dark:bg-gray-900 dark:hover:bg-gray-900"
              >
                <CalendarIcon size={20} color="#737373" />
                <Link href={`/calendar`} className="hidden w-full w-max text-sm font-semibold text-gray-500 md:block">
                  {t.goal.calendarView}
                </Link>
              </Button>
              <Button
                className="dark:text-gray-850 rounded-full p-2.5 md:px-4.5 md:py-2.5 lg:py-2.5"
                onClick={handleAddTodo}
              >
                <PlusIcon size={20} />
                <span className="hidden w-full w-max text-sm font-semibold md:block">
                  {isGithubGoal ? '이슈/PR 추가' : t.goal.addTodo}
                </span>
              </Button>
            </div>
          }
        />
        <section className="dark:bg-gray-750 h-144 w-full rounded-2xl bg-white px-7 py-8">
          <div className="flex h-full flex-col gap-4 overflow-y-auto">
            {goalDetail?.todoList && goalDetail?.todoList.length > 0 ? (
              goalDetail.todoList.map((todo) => <TaskCardWrapper key={todo.id} item={todo} mode="todo" />)
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <Empty>{t.goal.emptyTodoList}</Empty>
              </div>
            )}
          </div>
        </section>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
        <PageSubTitle subTitle="DONE" textClassName="font-semibold" className="py-[6px]" />
        <section className="dark:bg-gray-750 h-144 w-full rounded-2xl bg-white px-7 py-8">
          <div className="flex h-full flex-col gap-4 overflow-y-auto">
            {goalDetail?.doneList && goalDetail?.doneList.length > 0 ? (
              goalDetail.doneList.map((todo) => <TaskCardWrapper key={todo.id} item={todo} mode="done" />)
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <Empty>{t.goal.emptyDoneList}</Empty>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
