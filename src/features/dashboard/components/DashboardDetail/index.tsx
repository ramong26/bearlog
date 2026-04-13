'use client';

import Image from 'next/image';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';

import Empty from '@/shared/components/Empty';
import PageSubTitle from '@/shared/components/PageSubTitle';
import GoalBox from '../GoalBox';
import DashboardDetailSkeleton from '../DashboardDetailSkeleton';

import { goalQueries } from '@/shared/lib/query/queryKeys';
import { useTodoModeStore } from '@/shared/stores/useTodoModeStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';

export default function DashboardDetail() {
  const { t } = useLanguage();
  const mode = useTodoModeStore((state) => state.mode);
  const hasHydrated = useTodoModeStore((state) => state.hasHydrated);

  const { data: goals } = useSuspenseQuery(goalQueries.list());

  const visibleGoals = goals?.goals?.filter((goal) => goal.source === mode) ?? [];
  const visibleGoalIds = visibleGoals.map((goal) => goal.id).filter((id): id is number => id != null);
  const goalDetailResults = useSuspenseQueries({
    queries: visibleGoalIds.map((goalId) => goalQueries.detail(goalId)),
  });

  if (!hasHydrated) {
    return <DashboardDetailSkeleton />;
  }
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
            {goalDetailResults.map((result) => (
              <GoalBox key={result.data.id} goalDetail={result.data} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
