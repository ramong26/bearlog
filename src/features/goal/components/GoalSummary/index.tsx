'use client';

import { memo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRightIcon, EllipsisVerticalIcon } from 'lucide-react';

import EditDeleteDropdown from '@/features/dashboard/components/EditDeleteDropdown';
import PageHeader from '@/shared/components/PageHeader';
import ProgressCircle from '@/shared/components/ProgressCircle';
import { PopupModal } from '@/shared/components/Modal/PopupModal';
import SinglePostModal from '@/shared/components/Modal/SinglePostModal';

import { GoalDetailResponse } from '@/shared/lib/api';
import { useDeleteGoal, useDisconnectGithubGoal, usePatchGoal } from '@/shared/lib/query/mutations';
import { goalQueries, userQueries } from '@/shared/lib/query/queryKeys';
import { useBreakpoint } from '@/shared/hooks/useBreakPoint';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';

interface GoalSummaryProps {
  goalId: number;
}

function GoalSummary({ goalId }: GoalSummaryProps) {
  const breakpoint = useBreakpoint();
  const { t } = useLanguage();

  const { data: user } = useQuery(userQueries.current());
  const { data: goalDetail } = useQuery({
    ...goalQueries.detail(goalId),
    enabled: !!goalId,
  });

  return (
    <div className="flex flex-col gap-10">
      {breakpoint !== 'mobile' && <PageHeader title={`${user?.nickname}${t.goal.title}`} className="pl-2" />}
      <section className="flex flex-col gap-6 xl:flex-row xl:gap-8">
        <GoalInfo goalDetail={goalDetail} />

        <div className="flex shrink-0 flex-col justify-between gap-6 md:flex-row xl:flex-1">
          <GoalProgress goalDetail={goalDetail} />
          <LinkNote goalDetail={goalDetail} />
        </div>
      </section>
    </div>
  );
}

export default memo(GoalSummary);

interface GoalInfoProps {
  goalDetail: GoalDetailResponse | undefined;
}

function GoalInfo({ goalDetail }: GoalInfoProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { openModal } = useModalStore();
  const { mutate: deleteGoal } = useDeleteGoal(goalDetail?.id);
  const { mutate: disconnectGithubGoal } = useDisconnectGithubGoal(goalDetail?.id);
  const { mutateAsync: patchGoal } = usePatchGoal(goalDetail?.id);
  const { t } = useLanguage();

  if (!goalDetail) return null;

  const isGithubGoal = goalDetail.source === 'GITHUB';

  const handleEdit = () => {
    if (isGithubGoal) return;

    setOpen(false);
    openModal(
      <SinglePostModal
        title={t.goal.editTitle}
        placeholder={t.goal.editPlaceholder}
        defaultValue={goalDetail.title ?? ''}
        inputType="text"
        onConfirm={async (title) => {
          const trimmed = title.trim();
          if (!trimmed) return;
          await patchGoal({ title: trimmed });
        }}
      />,
    );
  };

  const handleDelete = () => {
    setOpen(false);
    openModal(
      <PopupModal
        variant={{ type: isGithubGoal ? 'githubDisconnect' : 'goalDelete' }}
        onConfirm={() => {
          if (isGithubGoal) {
            disconnectGithubGoal();
            return;
          }

          deleteGoal();
        }}
      />,
    );
  };

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white xl:flex-1">
      <div className="flex items-center justify-center gap-4 py-5 pl-5 md:py-6 md:pl-6 lg:py-15 lg:pl-10">
        <Image
          src={isGithubGoal ? '/image/github-icon.png' : '/image/goal-todo.png'}
          alt="Goal Icon"
          width={40}
          height={40}
        />
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="overflow-hidden text-lg font-semibold text-ellipsis whitespace-nowrap lg:text-2xl">
              {goalDetail.title}
            </span>
            {isGithubGoal && (
              <span className="rounded-full bg-[#F6F8FA] px-3 py-1 text-xs font-semibold text-gray-600">GitHub</span>
            )}
          </div>
          {isGithubGoal && goalDetail.repositoryFullName && (
            <span className="text-sm text-gray-500">{goalDetail.repositoryFullName}</span>
          )}
        </div>
      </div>

      <div className="relative mr-5 shrink-0 md:mr-6 lg:mr-10">
        <button ref={buttonRef} type="button" className="cursor-pointer" onClick={() => setOpen((prev) => !prev)}>
          <EllipsisVerticalIcon size={24} color="#A4A4A4" className="cursor-pointer" />
        </button>

        {open && (
          <EditDeleteDropdown
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            onClose={() => setOpen(false)}
            anchorRef={buttonRef}
            editLabel={isGithubGoal ? '수정 불가' : undefined}
            editDisabled={isGithubGoal}
            deleteLabel={isGithubGoal ? '연결 해제' : undefined}
          />
        )}
      </div>
    </div>
  );
}

interface GoalProgressProps {
  goalDetail: GoalDetailResponse | undefined;
}

function GoalProgress({ goalDetail }: GoalProgressProps) {
  const { t } = useLanguage();
  if (!goalDetail) return null;

  return (
    <div className="bg-bearlog-500 relative flex min-h-[160px] w-full gap-[31px] rounded-[32px] shadow-[0_10px_40px_0_rgba(0,200,127,0.40)]">
      <div className="absolute flex h-full w-full items-center gap-1 p-[34px]">
        <div className="w-[92px]">
          <ProgressCircle percent={goalDetail.progress} className="h-auto w-full" color="#008354" />
        </div>

        <div className="relative flex flex-col items-start gap-2">
          <span className="truncate text-xl font-semibold text-white">{t.goal.progressLabel}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-[41px] leading-[1] font-bold text-white">{goalDetail.progress}</span>
            <span className="text-[clamp(14px,2vw,30px)] text-white">%</span>
          </div>
        </div>
        <div className="absolute right-0 bottom-0">
          <Image
            src={'/image/teaching-bear-lg.png'}
            alt="Progress card Tablet"
            width={88}
            height={72}
            className="block"
          />
        </div>
      </div>
    </div>
  );
}

interface LinkNoteProps {
  goalDetail: GoalDetailResponse | undefined;
}

function LinkNote({ goalDetail }: LinkNoteProps) {
  const { t } = useLanguage();
  const goalId = goalDetail?.id;

  return (
    <div className="relative min-h-[160px] w-full rounded-[32px] bg-[#63B6FF] shadow-[0_10px_40px_0_rgba(99,182,255,0.24)]">
      <Link className="absolute top-1/5 left-1/7 flex items-center gap-[2px]" href={`/goal/${goalId}/note`}>
        <span className="text-2xl font-bold text-white">{t.goal.noteCollection}</span>
        <ChevronRightIcon size={24} color="#ffffff" className="cursor-pointer" />
      </Link>

      <Image
        src="/image/note-group.svg"
        alt="Note Group"
        width={100}
        height={100}
        className="absolute top-1/2 right-0 -translate-y-1/2 transform"
      />
    </div>
  );
}
