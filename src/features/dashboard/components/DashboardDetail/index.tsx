'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Empty from '@/shared/components/Empty';
import PageSubTitle from '@/shared/components/PageSubTitle';
import GoalBox from '../GoalBox';

import { dashboardQueries, goalQueries } from '@/shared/lib/query/queryFunction';
import { useTodoModeStore } from '@/shared/stores/useTodoModeStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { GITHUB_DISCONNECTED_SESSION_KEY } from '@/shared/constants/github';

export default function DashboardDetail() {
  const mode = useTodoModeStore((state) => state.mode);
  const { data: goals, isFetched: isGoalsFetched } = useQuery(goalQueries.list({ limit: 100 }));
  const { t } = useLanguage();

  const [isGithubDisconnectedSession] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(GITHUB_DISCONNECTED_SESSION_KEY) === 'true';
  });

  const visibleGoalIds =
    mode === 'GITHUB' && isGithubDisconnectedSession
      ? []
      : (goals?.goals?.filter((goal) => goal.source === mode).map((goal) => goal.id) ?? []);

  const { data: goalDetail } = useQuery({
    ...dashboardQueries.detailTodosByGoals(visibleGoalIds),
    enabled: visibleGoalIds.length > 0,
  });

  const visibleGoals = goalDetail?.items ?? [];

  if (!isGoalsFetched) {
    return null;
  }

  if (mode === 'MANUAL' && visibleGoalIds.length === 0) {
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
            {visibleGoals.map((goalDetailItem) => (
              <GoalBox key={goalDetailItem.goal.id} data={goalDetailItem} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
