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

export default function GithubRepoConnectModal() {
  const { closeModal } = useModalStore();
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
    <div className="no-scrollbar flex w-full flex-col overflow-y-auto rounded-t-[32px] bg-white p-6 shadow-[0px_0px_60px_0px_rgba(0,0,0,0.05)] md:rounded-[40px] md:p-8">
      <div className="mb-[30px] flex flex-col gap-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-black">개발자 모드 설정하기</span>

          <button type="button" className="cursor-pointer" onClick={closeModal}>
            <XIcon size={24} className="stroke-gray-400" />
          </button>
        </div>
        <span className="text-xl font-medium text-[#64748B]">
          Github 연동 Todo를 사용하려면 아래 단계를 완료해 주세요.
        </span>
      </div>

      {!user?.githubConnected ? (
        <GithubRepoDescription
          onClose={closeModal}
          nickname={user?.nickname}
          profileImageUrl={user?.profileImageUrl ?? null}
        />
      ) : hasConnectedRepo ? (
        <div className="rounded-[24px] bg-[#F6F8FA] p-5 text-sm leading-6 text-gray-600">
          이미 연결된 GitHub 레포가 있습니다. 새 레포를 연결하려면 기존 연결을 먼저 해제해주세요.
        </div>
      ) : availableRepositories.length === 0 ? (
        <div className="rounded-[24px] bg-[#F6F8FA] p-5 text-sm leading-6 text-gray-600">
          연결 가능한 저장소가 없습니다.
        </div>
      ) : (
        <div className="flex max-h-[40vh] flex-col gap-3 overflow-y-auto">
          {availableRepositories.map((repository) => (
            <article
              key={repository.id}
              className="flex items-center justify-between gap-4 rounded-[24px] border border-gray-200 bg-[#F6F8FA] p-5"
            >
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-gray-800">{repository.name}</p>
                <p className="truncate text-sm text-gray-500">{repository.fullName}</p>
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
                연결
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
      { index: 1, title: 'Github 로그인', description: 'Github OAuth를 통해 계정을 연결합니다.' },
      { index: 2, title: '레포지토리 선택', description: `목표당 1개의 레포만 연결할 수 있습니다. (1:1 매칭)` },
      {
        index: 3,
        title: 'Webhook URL 등록',
        description: '제공된 Webhook URL을 GitHub 레포지토리의\nSettings > Webhooks에 등록합니다.',
      },
    ],
    [],
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
              <p className="text-2xl font-semibold text-gray-800">{title}</p>
              <p className="text-xl whitespace-pre-line text-[#64748B]">{description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex w-full items-center justify-between gap-3">
        <Button variant="cancel" className="px-40 py-[18.5px]" onClick={onClose}>
          <span className="truncate">취소</span>
        </Button>
        <Button className="px-40 py-[18.5px]" onClick={handleGithubLogin}>
          <span className="truncate">확인</span>
        </Button>
      </div>
    </>
  );
}
