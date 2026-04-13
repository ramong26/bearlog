'use client';

import Image from 'next/image';
import { useSuspenseQuery } from '@tanstack/react-query';

import Empty from '@/shared/components/Empty';
import PageSubTitle from '@/shared/components/PageSubTitle';
import GoalBox from '../GoalBox';

import { goalQueries } from '@/shared/lib/query/queryKeys';
import { useTodoModeStore } from '@/shared/stores/useTodoModeStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';

export default function DashboardDetail() {
  const mode = useTodoModeStore((state) => state.mode);
  const { data: goals } = useSuspenseQuery(goalQueries.list());
  const { t } = useLanguage();

  const visibleGoals = goals?.goals?.filter((goal) => goal.source === mode) ?? [];

  if (mode === 'MANUAL' && visibleGoals.length === 0) {
    return <Empty>{t.dashboard.noFirstGoal}</Empty>;
  }

  return (
    <section className="flex flex-col gap-6">
      {visibleGoals.length === 0 ? (
        <Empty>{mode === 'GITHUB' ? t.dashboard.noGithubGoal : t.dashboard.noGoal}</Empty>
      ) : (
        <>
          <PageSubTitle
            subTitle={mode === 'GITHUB' ? t.dashboard.githubGoalTitle : t.dashboard.goalByTodo}
            icons={<Image src={'/image/goal-todo.png'} alt="Goal Icon" width={40} height={40} />}
          />
          <div className="flex flex-col gap-[32px] pt-[10px]">
            {visibleGoals.map((goal) => (
              goal.id ? <GoalDetailItem key={goal.id} goalId={goal.id} /> : null
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function GoalDetailItem({ goalId }: { goalId: number }) {
  const { data: goalDetail } = useSuspenseQuery(goalQueries.detail(goalId));

  return <GoalBox data={goalDetail} />;
}
