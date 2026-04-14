'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import FormField from '@/shared/components/FormField';
import { validateEmail, validatePassword, validatePasswordConfirm } from '@/shared/lib/validation';
import { fetchAuth } from '@/shared/lib/api/fetchAuth';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { GITHUB_AUTH_INTENT_KEY } from '@/shared/constants/githubAuth';

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToastStore();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // TODO: 리액트쿼리로 변경 필요, 리액트 훅 폼 적용 필요
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email, t.validation);
    const passwordErr = validatePassword(password, t.validation);
    const passwordConfirmErr = validatePasswordConfirm(password, passwordConfirm, t.validation);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setPasswordConfirmError(passwordConfirmErr);
    if (emailErr || passwordErr || passwordConfirmErr) return;

    if (isLoading) return;
    setIsLoading(true);
    try {
      await fetchAuth.postSignup({ nickname: name, email, password });

      showToast(t.auth.signupSuccess, 'success');
      router.push('/login');
    } catch (error) {
      console.error(error);
      showToast(t.auth.signupFail, 'fail');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      const { loginUrl } = await fetchAuth.getGithubAuthorizeUrlByEnv();
      if (loginUrl) {
        window.sessionStorage.setItem(GITHUB_AUTH_INTENT_KEY, 'login');
        window.location.href = loginUrl;
      }
    } catch (error) {
      console.error('GitHub 로그인 URL 요청 실패:', error);
      showToast(t.auth.socialLoginFail, 'fail');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { loginUrl } = await fetchAuth.getGoogleAuthorizeUrlByEnv();
      if (loginUrl) {
        window.location.href = loginUrl;
      }
    } catch (error) {
      console.error('Google 로그인 URL 요청 실패:', error);
      showToast(t.auth.socialLoginFail, 'fail');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center py-20">
      <div className="flex w-full max-w-[331px] flex-col items-start md:max-w-[400px]">
        {/* 로고 */}
        <div className="mb-10 flex h-12 w-full items-center gap-4">
          <Image src="/image/bearlog-icon.png" alt="logo" width={48} height={48} />
          <span className="text-2xl font-bold">Bearlog</span>
        </div>
        <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
          <FormField label={t.auth.name}>
            <Input
              type="text"
              placeholder={t.auth.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          {/* 이메일 */}
          <FormField label={t.auth.email} error={emailError}>
            <Input
              type="text"
              placeholder={t.auth.emailPlaceholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
            />
          </FormField>

          {/* 비밀번호 */}
          <FormField label={t.auth.password} error={passwordError}>
            <Input
              type="password"
              placeholder={t.auth.passwordPlaceholder}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
            />
          </FormField>
          <FormField label={t.auth.passwordConfirm} error={passwordConfirmError}>
            <Input
              type="password"
              placeholder={t.auth.passwordConfirmPlaceholder}
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
                setPasswordConfirmError('');
              }}
            />
          </FormField>

          <Button
            type="submit"
            className="mt-8 h-14 w-full"
            disabled={!name || !email || !password || !passwordConfirm || isLoading}
          >
            {isLoading ? <LoadingSpinner /> : t.auth.signupButton}
          </Button>
        </form>

        {/* 로그인 링크 */}
        <div className="mt-6 flex h-6 w-full items-center justify-center gap-2 text-sm">
          <span className="text-base leading-6 font-medium text-text-label">{t.auth.hasAccount}</span>
          <Link href="/login" className="text-bearlog-600 text-base leading-6 font-semibold">
            {t.auth.login}
          </Link>
        </div>

        {/* SNS 구분선 */}
        <div className="mt-10 mb-4 flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">{t.auth.snsSignup}</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* SNS 버튼 */}
        <div className="flex w-full justify-center gap-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            aria-label={t.auth.googleLogin}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-[#DDDDDD] bg-white p-4 hover:bg-gray-50"
          >
            <Image src="/icons/google-icon.png" alt="구글 아이콘" width={24} height={24} />
          </button>
          <button
            type="button"
            onClick={handleGithubLogin}
            aria-label={t.auth.githubLogin}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-[#DDDDDD] bg-white p-2 hover:bg-gray-50"
          >
            <Image src="/icons/GitHub.png" alt="깃허브 아이콘" width={40} height={40} />
          </button>
        </div>
      </div>
    </main>
  );
}
