'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useEffect } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import PageHeader from '@/shared/components/PageHeader';
import PageSubTitle from '@/shared/components/PageSubTitle';
import ProgressCircle from '@/shared/components/ProgressCircle';
import TabChangeMode from '@/shared/components/TabChangeMode';
import TaskCardWrapper from '../TaskCardWrapper';
import GithubRepoConnectModal from '@/shared/components/Modal/GithubRepoConnectModal';

import { useBreakpoint } from '@/shared/hooks/useBreakPoint';
import { dashboardQueries } from '@/shared/lib/query/queryKeys';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useTodoModeStore, TodoMode } from '@/shared/stores/useTodoModeStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { GITHUB_DISCONNECTED_SESSION_KEY } from '@/shared/constants/github';
import { DashboardSummaryResponse } from '@/shared/types/api/schemas/api.process';

export default function DashBoardSummary() {
  const { t } = useLanguage();
  const breakpoint = useBreakpoint();
  const mode = useTodoModeStore((state) => state.mode);
  const setMode = useTodoModeStore((state) => state.setMode);

  const { data: dashboardSummaryData, isFetched: isDashboardSummaryFetched } = useQuery({
    ...dashboardQueries.summary(),
  });

  const { openModal } = useModalStore();

  const githubGoals = dashboardSummaryData?.todos?.filter((goal) => goal.source === 'GITHUB') ?? [];
  const isGithubDisconnectedSession =
    typeof window !== 'undefined' && window.sessionStorage.getItem(GITHUB_DISCONNECTED_SESSION_KEY) === 'true';

  const githubModalOpenedRef = useRef(false);

  const handleModeChange = (nextMode: TodoMode) => {
    setMode(nextMode);
  };

  useEffect(() => {
    if (mode !== 'GITHUB') {
      githubModalOpenedRef.current = false;
      return;
    }

    if (!isDashboardSummaryFetched) {
      return;
    }

    const shouldOpenConnectModal =
      isGithubDisconnectedSession ||
      !dashboardSummaryData?.user?.githubConnected ||
      (dashboardSummaryData?.user?.githubConnected && isDashboardSummaryFetched && githubGoals.length === 0);

    if (!shouldOpenConnectModal) {
      githubModalOpenedRef.current = false;
      return;
    }

    if (!githubModalOpenedRef.current) {
      githubModalOpenedRef.current = true;
      openModal(<GithubRepoConnectModal />, undefined, 'bottom');
    }
  }, [
    mode,
    isDashboardSummaryFetched,
    githubGoals.length,
    openModal,
    dashboardSummaryData?.user?.githubConnected,
    isGithubDisconnectedSession,
  ]);

  return (
    <>
      <div className="flex items-center justify-end pb-[30px] md:justify-between lg:pb-[34px]">
        {breakpoint !== 'mobile' && (
          <div className="flex flex-col gap-2">
            <PageHeader title={`${dashboardSummaryData?.user?.nickname}${t.dashboard.title}`} />
            {mode === 'GITHUB' && (
              <span className="text-xl text-gray-400 transition-all duration-200">{t.dashboard.githubModeDesc}</span>
            )}
          </div>
        )}

        <div className="flex shrink-0 justify-end md:w-fit">
          <TabChangeMode mode={mode} onModeChange={handleModeChange} />
        </div>
      </div>
      <section className="flex w-full flex-col gap-[40px] pb-[40px] md:flex-row md:gap-[12px] lg:gap-[32px] lg:pb-[34px]">
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-[10px]">
          <PageSubTitle
            subTitle={t.dashboard.recentTodo}
            icons={<Image src={'/image/task-green.png'} alt="Task Icon" width={40} height={40} />}
            actions={
              <Link
                href="/dashboard/all-todo"
                className="text-bearlog-500 w-full cursor-pointer text-sm font-semibold md:text-base"
              >
                {t.dashboard.viewAll} <ChevronRightIcon className="inline-block cursor-pointer" />
              </Link>
            }
          />
          <RecentPostCard dashboardSummaryData={dashboardSummaryData} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-[10px]">
          <PageSubTitle
            subTitle={t.dashboard.myProgress}
            icons={<Image src={'/image/progress-green.png'} alt="Progress Icon" width={40} height={40} />}
          />
          <CurrentProgressCard dashboardSummaryData={dashboardSummaryData} />
        </div>
      </section>
    </>
  );
}

interface RecentPostCardProps {
  dashboardSummaryData: DashboardSummaryResponse | undefined;
}
function RecentPostCard({ dashboardSummaryData }: RecentPostCardProps) {
  const { t } = useLanguage();

  if (!dashboardSummaryData || dashboardSummaryData.todos.length === 0) return null;
  return (
    <article className="dark:bg-gray-850 flex h-[187px] h-fit w-full min-w-0 flex-col gap-[6px] rounded-[40px] bg-white px-4 py-[18px] md:h-[229px] md:p-4 lg:h-[256px] lg:p-8">
      {dashboardSummaryData?.todos?.length > 0 ? (
        dashboardSummaryData.todos.map((item) => <TaskCardWrapper key={item.id} item={item} mode="todo" />)
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-gray-500">{t.dashboard.noRecentTodo}</span>
        </div>
      )}
    </article>
  );
}

interface CurrentProgressCardProps {
  dashboardSummaryData: DashboardSummaryResponse | undefined;
}
function CurrentProgressCard({ dashboardSummaryData }: CurrentProgressCardProps) {
  const { t } = useLanguage();
  const mode = useTodoModeStore((state) => state.mode);

  if (!dashboardSummaryData || dashboardSummaryData.progress === null) return null;
  return (
    <article className="bg-bearlog-500 relative h-[187px] w-full rounded-[40px] shadow-[0_10px_40px_0_rgba(2,202,181,0.40)] md:h-[229px] lg:h-[256px]">
      <div className="absolute right-0 bottom-0">
        <Image
          src={'/image/teaching-bear-lg.png'}
          alt="Progress card Tablet"
          width={140}
          height={88}
          className="block lg:hidden"
        />
        <Image
          src={'/image/teaching-bear-xl.png'}
          alt="Progress card PC"
          width={222}
          height={140}
          className="hidden lg:block"
        />
      </div>
      <div className="absolute flex h-full w-full items-center justify-start gap-8 p-6 lg:p-12">
        <div className="w-[120px]">
          <ProgressCircle
            percent={dashboardSummaryData?.progress?.totalProgress ?? 0}
            className="h-auto w-full"
            color="#008354"
          />
        </div>
        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-col items-start">
            <span className="text-[clamp(12px,2vw,20px)] font-semibold text-white">{t.dashboard.todoProgress}</span>
            {mode === 'GITHUB' && (
              <span className="text-[clamp(12px,2vw,15px)] font-semibold whitespace-pre-line text-white/70">
                {t.dashboard.githubModeProgressDesc}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[clamp(20px,5vw,60px)] leading-[1] font-bold text-white">
              {dashboardSummaryData?.progress?.totalProgress}
            </span>
            <span className="text-[clamp(14px,2vw,30px)] text-white">%</span>
          </div>
        </div>
      </div>
    </article>
  );
}
