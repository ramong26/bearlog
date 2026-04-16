'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

import GithubRepoConnectModal from '@/shared/components/Modal/GithubRepoConnectModal';
import { GITHUB_DISCONNECTED_SESSION_KEY } from '@/shared/constants/github';
import { goalQueries } from '@/shared/lib/query/queryKeys';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useTodoModeStore } from '@/shared/stores/useTodoModeStore';

interface UseGithubRepoConnectModalParams {
  isConnectionFetched: boolean;
  isGithubConnected: boolean | undefined;
}

export function useGithubRepoConnectModal({ isConnectionFetched, isGithubConnected }: UseGithubRepoConnectModalParams) {
  const mode = useTodoModeStore((state) => state.mode);
  const { openModal } = useModalStore();
  const githubModalOpenedRef = useRef(false);

  const { data: goals, isFetched: isGoalListFetched } = useQuery({
    ...goalQueries.list(),
    enabled: mode === 'GITHUB',
  });
  const githubGoals = goals?.goals?.filter((goal) => goal.source === 'GITHUB') ?? [];

  const isGithubDisconnectedSession =
    typeof window !== 'undefined' && window.sessionStorage.getItem(GITHUB_DISCONNECTED_SESSION_KEY) === 'true';

  useEffect(() => {
    if (mode !== 'GITHUB') {
      githubModalOpenedRef.current = false;
      return;
    }

    if (!isConnectionFetched) {
      return;
    }
    if (isGithubConnected && !isGoalListFetched) {
      return;
    }

    const shouldOpenConnectModal =
      isGithubDisconnectedSession ||
      !isGithubConnected ||
      (isGithubConnected && isGoalListFetched && githubGoals.length === 0);

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
    isConnectionFetched,
    isGithubConnected,
    isGoalListFetched,
    githubGoals.length,
    openModal,
    isGithubDisconnectedSession,
  ]);
}
