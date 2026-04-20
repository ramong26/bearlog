'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Empty from '@/shared/components/Empty';
import PageSubTitle from '@/shared/components/PageSubTitle';
import GoalBox from '../GoalBox';

import { dashboardQueries } from '@/shared/lib/query/queryFunction';
import { useTodoModeStore } from '@/shared/stores/useTodoModeStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { GITHUB_DISCONNECTED_SESSION_KEY } from '@/shared/constants/github';

export default function DashboardDetail() {
  const mode = useTodoModeStore((state) => state.mode);
  const { data: goalDetail } = useQuery(dashboardQueries.detailTodos());
  const { t } = useLanguage();

  const [isGithubDisconnectedSession] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(GITHUB_DISCONNECTED_SESSION_KEY) === 'true';
  });

  const visibleGoals =
    mode === 'GITHUB' && isGithubDisconnectedSession
      ? []
      : (goalDetail?.items?.filter((item) => item.goal.source === mode) ?? []);

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
            {visibleGoals.map((goalDetailItem) => (
              <GoalBox key={goalDetailItem.goal.id} data={goalDetailItem} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
