'use client';

import { useMemo } from 'react';
import { XIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import Button from '@/shared/components/Button';

import { fetchAuth } from '@/shared/lib/api';
import { useConnectGithubRepository } from '@/shared/lib/query/mutations';
import { githubQueries, goalQueries, userQueries } from '@/shared/lib/query/queryKeys';
import { useModalStore } from '@/shared/stores/useModalStore';
import { GITHUB_DISCONNECTED_SESSION_KEY } from '@/shared/constants/github';
import { GITHUB_AUTH_INTENT_KEY, GITHUB_PROFILE_SNAPSHOT_KEY } from '@/shared/constants/githubAuth';
import { useLanguage } from '@/shared/contexts/LanguageContext';

export default function GithubRepoConnectModal() {
  const { closeModal } = useModalStore();
  const { t } = useLanguage();
  const { data: user } = useQuery(userQueries.current());
  const { data: goals } = useQuery(goalQueries.list());
  const isGithubDisconnectedSession =
    typeof window !== 'undefined' && window.sessionStorage.getItem(GITHUB_DISCONNECTED_SESSION_KEY) === 'true';

  const { data: repositories } = useQuery({
    ...githubQueries.repositories(),
    enabled: user?.githubConnected ?? false,
  });

  const connectGithubRepository = useConnectGithubRepository();

  const githubGoals = isGithubDisconnectedSession
    ? []
    : (goals?.goals?.filter((goal) => goal.source === 'GITHUB') ?? []);

  // 이미 연결된 레포가 있으면 새 레포 연결 불가 (1개만 허용)
  const hasConnectedRepo = githubGoals.length > 0;
  const connectedRepositories = new Set(githubGoals.map((goal) => goal.repositoryFullName).filter(Boolean));
  const availableRepositories = (repositories ?? []).filter(
    (repository) => !connectedRepositories.has(repository.fullName),
  );

  return (
    <div className="no-scrollbar flex w-full flex-col overflow-y-auto rounded-t-[32px] bg-white dark:bg-gray-850 p-6 shadow-[0px_0px_60px_0px_rgba(0,0,0,0.05)] md:rounded-[40px] md:p-8">
      <div className="mb-[30px] flex flex-col gap-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-black dark:text-white">{t.modal.githubRepoConnectTitle}</span>

          <button type="button" className="cursor-pointer" onClick={closeModal}>
            <XIcon size={24} className="stroke-gray-400" />
          </button>
        </div>
        <span className="text-xl font-medium text-slate-500 dark:text-gray-400">
          {t.modal.githubRepoConnectDesc}
        </span>
      </div>

      {!user?.githubConnected ? (
        <GithubRepoDescription
          onClose={closeModal}
          nickname={user?.nickname}
          profileImageUrl={user?.profileImageUrl ?? null}
        />
      ) : hasConnectedRepo ? (
        <div className="rounded-[24px] bg-[#F6F8FA] dark:bg-gray-750 p-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
          {t.modal.githubRepoAlreadyConnected}
        </div>
      ) : availableRepositories.length === 0 ? (
        <div className="rounded-[24px] bg-[#F6F8FA] dark:bg-gray-750 p-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
          {t.modal.githubRepoNoAvailable}
        </div>
      ) : (
        <div className="flex max-h-[40vh] flex-col gap-3 overflow-y-auto">
          {availableRepositories.map((repository) => (
            <article
              key={repository.id}
              className="flex items-center justify-between gap-4 rounded-[24px] border border-gray-200 dark:border-gray-700 bg-[#F6F8FA] dark:bg-gray-750 p-5"
            >
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-gray-800 dark:text-white">{repository.name}</p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">{repository.fullName}</p>
              </div>
              <Button
                className="h-10 shrink-0 px-4 text-sm"
                disabled={connectGithubRepository.isPending}
                onClick={() => {
                  connectGithubRepository.mutate(
                    { repositoryFullName: repository.fullName },
                    { onSuccess: closeModal },
                  );
                }}
              >
                {t.modal.githubRepoConnect}
              </Button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function GithubRepoDescription({
  onClose,
  nickname,
  profileImageUrl,
}: {
  onClose: () => void;
  nickname?: string;
  profileImageUrl?: string | null;
}) {
  const { t } = useLanguage();
  const handleGithubLogin = async () => {
    const response = await fetchAuth.getGithubConnectAuthorizeUrlByEnv();

    window.sessionStorage.setItem(
      GITHUB_PROFILE_SNAPSHOT_KEY,
      JSON.stringify({
        nickname,
        profileImageUrl: profileImageUrl ?? null,
      }),
    );
    window.sessionStorage.setItem(GITHUB_AUTH_INTENT_KEY, 'connect');
    window.location.href = response.loginUrl;
  };

  const descriptionLinesArr = useMemo(
    () => [
      { index: 1, title: t.modal.githubRepoStep1Title, description: t.modal.githubRepoStep1Desc },
      { index: 2, title: t.modal.githubRepoStep2Title, description: t.modal.githubRepoStep2Desc },
      { index: 3, title: t.modal.githubRepoStep3Title, description: t.modal.githubRepoStep3Desc },
    ],
    [t],
  );

  return (
    <>
      <div className="mb-[38.5px] flex flex-col items-start gap-6">
        {descriptionLinesArr.map(({ index, title, description }) => (
          <div key={index} className="flex items-start gap-3">
            <div className="bg-bearlog-500 flex h-8 w-8 items-center justify-center rounded-full text-white">
              {index}
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white">{title}</p>
              <p className="text-xl whitespace-pre-line text-slate-500 dark:text-gray-400">{description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex w-full items-center justify-between gap-3">
        <Button variant="cancel" className="px-40 py-[18.5px]" onClick={onClose}>
          <span className="truncate text-lg">{t.modal.cancel}</span>
        </Button>
        <Button className="px-40 py-[18.5px]" onClick={handleGithubLogin}>
          <span className="truncate text-lg dark:text-bg-input">{t.modal.confirm}</span>
        </Button>
      </div>
    </>
  );
}
