'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import PageHeader from '@/shared/components/PageHeader';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import FormField from '@/shared/components/FormField';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

import { userQueries } from '@/shared/lib/query/queryKeys';
import {
  useDeleteGithubConnection,
  usePatchCurrentUser,
  usePatchCurrentUserPassword,
} from '@/shared/lib/query/mutations';
import { validatePassword, validatePasswordConfirm } from '@/shared/lib/validation';
import { useBreakpoint } from '@/shared/hooks/useBreakPoint';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useToastStore } from '@/shared/stores/useToastStore';
import { PopupModal } from '@/shared/components/Modal/PopupModal';
import { fetchUsers } from '@/shared/lib/api/fetchUsers';
import { fetchAuth } from '@/shared/lib/api/fetchAuth';
import { fetchImages } from '@/shared/lib/api/fetchImages';
import { useLanguage } from '@/shared/contexts/LanguageContext';

import { GITHUB_DISCONNECTED_SESSION_KEY } from '@/shared/constants/github';
import { GITHUB_AUTH_INTENT_KEY, GITHUB_PROFILE_SNAPSHOT_KEY } from '@/shared/constants/githubAuth';

// TODO: 리액트 훅 폼 적용 필요
export default function MyPageForm() {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const { t } = useLanguage();

  const { data: user } = useQuery(userQueries.current());
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const [newPasswordError, setNewPasswordError] = useState('');
  const [newPasswordConfirmError, setNewPasswordConfirmError] = useState('');
  const [nicknameSuccess, setNicknameSuccess] = useState(false);

  const { mutate: patchUser, isPending: isPatchingUser } = usePatchCurrentUser();
  const { mutate: patchPassword, isPending: isPatchingPassword } = usePatchCurrentUserPassword();
  const { mutate: disconnectGithub, isPending: isDisconnectingGithub } = useDeleteGithubConnection();
  const { openModal } = useModalStore();
  const { showToast } = useToastStore();
  const router = useRouter();
  const isLocalLogin = user?.loginProvider === 'LOCAL';

  const isGithubDisconnectedSession =
    typeof window !== 'undefined' && window.sessionStorage.getItem(GITHUB_DISCONNECTED_SESSION_KEY) === 'true';

  const isGithubConnected = !isGithubDisconnectedSession && (user?.githubConnected ?? false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { uploadUrl, url } = await fetchImages.postImageUploadUrl({ fileName: file.name });
      await fetch(uploadUrl, { method: 'PUT', body: file });
      patchUser({ profileImageUrl: url });
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      showToast(t.mypage.imageUploadFail, 'fail');
    }
  };

  const handleGithubConnect = async () => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(GITHUB_DISCONNECTED_SESSION_KEY);
      }
      const { loginUrl } = await fetchAuth.getGithubConnectAuthorizeUrlByEnv();
      if (loginUrl) {
        if (user) {
          window.sessionStorage.setItem(
            GITHUB_PROFILE_SNAPSHOT_KEY,
            JSON.stringify({
              nickname: user.nickname,
              profileImageUrl: user.profileImageUrl ?? null,
            }),
          );
        }
        window.sessionStorage.setItem(GITHUB_AUTH_INTENT_KEY, 'connect');
        window.location.href = loginUrl;
      }
    } catch (error) {
      console.error('GitHub 연결 URL 요청 실패:', error);
      showToast(t.auth.socialLoginFail, 'fail');
    }
  };

  const handleGithubDisconnect = () => {
    openModal(
      <PopupModal
        variant={{ type: 'githubDisconnect' }}
        onConfirm={() => {
          disconnectGithub();
        }}
      />,
    );
  };

  const handleAccountDelete = () => {
    openModal(
      <PopupModal
        variant={{ type: 'accountDelete', isLocalUser: isLocalLogin }}
        onConfirm={async (password) => {
          try {
            await fetchUsers.deleteCurrentUser(password ? { password } : undefined);
            router.push('/login');
          } catch (error) {
            console.error('Failed to delete account:', error);
            showToast(t.mypage.withdrawFail, 'fail');
          }
        }}
      />,
    );
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    setNicknameSuccess(false);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setNewPasswordError(validatePassword(e.target.value, t.validation));
    if (newPasswordConfirm) {
      setNewPasswordConfirmError(validatePasswordConfirm(e.target.value, newPasswordConfirm, t.validation));
    }
  };

  const handleNewPasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPasswordConfirm(e.target.value);
    setNewPasswordConfirmError(validatePasswordConfirm(newPassword, e.target.value, t.validation));
  };

  const handleSave = () => {
    if (nickname && nickname !== user?.nickname) {
      patchUser(
        { nickname },
        {
          onSuccess: () => setNicknameSuccess(true),
        },
      );
    }

    if (isLocalLogin && currentPassword && newPassword && newPasswordConfirm) {
      const pwError = validatePassword(newPassword, t.validation);
      const confirmError = validatePasswordConfirm(newPassword, newPasswordConfirm, t.validation);

      if (pwError || confirmError) {
        if (pwError) setNewPasswordError(pwError);
        if (confirmError) setNewPasswordConfirmError(confirmError);
        return;
      }

      patchPassword(
        { currentPassword, newPassword, newPasswordConfirm },
        {
          onSuccess: () => {
            setCurrentPassword('');
            setNewPassword('');
            setNewPasswordConfirm('');
          },
        },
      );
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {!isMobile && <PageHeader title={t.mypage.title} />}

      <div className="flex min-h-219.5 w-140 flex-col gap-6 rounded-2xl bg-white p-8">
        {/* 프로필 이미지 */}
        <div className="flex justify-center">
          <div className="relative h-33 w-33">
            <div className="h-full w-full overflow-hidden rounded-full bg-[#C8EDEA]">
              <Image
                src={user?.profileImageUrl ?? '/image/default-profile.png'}
                alt={t.mypage.profileAlt}
                width={132}
                height={132}
                className="h-full w-full object-cover"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileImageChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-0 bottom-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#00C87F]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* 이메일 */}
        <FormField label={t.mypage.email}>
          <Input type="email" value={user?.email ?? ''} disabled />
        </FormField>

        {/* 닉네임 */}
        <FormField label={t.mypage.nickname}>
          <Input
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder={t.mypage.nicknamePlaceholder}
          />
          {nicknameSuccess && <p className="px-1 text-sm text-[#0CAF60]">{t.mypage.nicknameSuccess}</p>}
        </FormField>

        {/* 비밀번호 변경 - 소셜 로그인이면 숨김 */}
        {isLocalLogin && (
          <FormField label={t.mypage.passwordChange}>
            <div className="flex flex-col gap-2">
              <Input
                type="password"
                placeholder={t.mypage.currentPassword}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder={t.mypage.newPassword}
                value={newPassword}
                onChange={handleNewPasswordChange}
                className={newPasswordError ? 'border-red-500' : ''}
              />
              {newPasswordError && <p className="px-1 text-sm text-red-500">{newPasswordError}</p>}
              <Input
                type="password"
                placeholder={t.mypage.newPasswordConfirm}
                value={newPasswordConfirm}
                onChange={handleNewPasswordConfirmChange}
                className={newPasswordConfirmError ? 'border-red-500' : ''}
              />
              {newPasswordConfirmError && <p className="px-1 text-sm text-red-500">{newPasswordConfirmError}</p>}
            </div>
          </FormField>
        )}

        {/* 저장하기 / 회원 탈퇴 버튼 */}
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            type="button"
            className="h-14 w-full"
            onClick={handleSave}
            disabled={isPatchingUser || isPatchingPassword}
            aria-label={t.mypage.save}
          >
            {isPatchingUser || isPatchingPassword ? <LoadingSpinner /> : t.mypage.save}
          </Button>

          <button
            type="button"
            onClick={handleAccountDelete}
            className="h-14 w-full rounded-full bg-gray-100 text-sm font-medium text-gray-500 hover:bg-gray-200"
          >
            {t.mypage.withdraw}
          </button>
        </div>

        {/* GitHub 연동 */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t.mypage.githubConnect}</span>
          <span className={`h-2 w-2 rounded-full ${isGithubConnected ? 'bg-[#00C87F]' : 'bg-gray-400'}`} />
          <span className="text-sm text-gray-500">
            {isGithubConnected ? t.mypage.connected : t.mypage.notConnected}
          </span>
          {isGithubConnected ? (
            <button
              type="button"
              onClick={handleGithubDisconnect}
              disabled={isDisconnectingGithub}
              className="rounded-full border border-gray-200 px-4 py-1.5 text-sm hover:bg-gray-50"
              style={{ color: '#6A6A6A' }}
            >
              {t.mypage.disconnect}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGithubConnect}
              className="rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
            >
              {t.mypage.connect}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
