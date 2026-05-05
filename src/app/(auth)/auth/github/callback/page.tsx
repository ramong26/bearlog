'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { fetchAuth } from '@/shared/lib/api/fetchAuth';
import { fetchUsers } from '@/shared/lib/api/fetchUsers';
import { GITHUB_AUTH_INTENT_KEY, GITHUB_PROFILE_SNAPSHOT_KEY } from '@/shared/constants/githubAuth';

interface ProfileSnapshot {
  nickname?: string;
  profileImageUrl?: string | null;
}

export default function GithubCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (hasProcessedRef.current) return;

    hasProcessedRef.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      router.replace('/login');
      return;
    }

    const payload = {
      code,
      ...(state ? { state } : {}),
    };

    // 세션에 임시저장: GitHub 인증 완료 후 해당 정보를 활용하여 로그인/연동 처리
    const authIntent = window.sessionStorage.getItem(GITHUB_AUTH_INTENT_KEY);
    const rawSnapshot = window.sessionStorage.getItem(GITHUB_PROFILE_SNAPSHOT_KEY);
    window.sessionStorage.removeItem(GITHUB_AUTH_INTENT_KEY);
    window.sessionStorage.removeItem(GITHUB_PROFILE_SNAPSHOT_KEY);

    const completeGithubAuth = async () => {
      try {
        if (authIntent === 'connect') {
          await fetchAuth.postGithubConnectByEnv(payload);

          if (rawSnapshot) {
            try {
              const snapshot = JSON.parse(rawSnapshot) as ProfileSnapshot;
              if (typeof snapshot.nickname === 'string') {
                await fetchUsers.patchCurrentUser({
                  nickname: snapshot.nickname,
                  profileImageUrl: snapshot.profileImageUrl ?? null,
                });
              }
            } catch (profileRestoreError) {
              console.error('GitHub connect profile restore failed:', profileRestoreError);
            }
          }
        } else {
          await fetchAuth.postGithubLoginByEnv(payload);
        }

        router.replace('/dashboard');
      } catch (error) {
        console.error('GitHub callback failed:', { error, authIntent });
        router.replace('/login');
      }
    };

    completeGithubAuth();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner className="bg-bearlog-500" />
    </div>
  );
}
