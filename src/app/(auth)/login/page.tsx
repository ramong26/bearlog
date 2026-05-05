'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import Image from 'next/image';
import { fetchAuth } from '@/shared/lib/api/fetchAuth';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { GITHUB_AUTH_INTENT_KEY } from '@/shared/constants/githubAuth';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToastStore();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(t.auth.loginFail);

      showToast(t.auth.loginSuccess, 'success');
      router.push('/dashboard');
    } catch (error) {
      console.error('로그인 요청 실패:', error);
      showToast(t.auth.loginFail, 'fail');
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
        <div className="mb-10 flex h-12 w-full items-center gap-4">
          <Image src="/image/bearlog-icon.png" alt="logo" width={48} height={48} />
          <span className="text-2xl font-bold">Bearlog</span>
        </div>
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <FormField label={t.auth.email} hideLabel>
            <Input
              type="email"
              placeholder={t.auth.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <FormField label={t.auth.password} hideLabel>
            <Input
              type="password"
              placeholder={t.auth.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
          <Button type="submit" className="mt-8 h-14 w-full" disabled={!email || !password || isLoading}>
            {isLoading ? <LoadingSpinner /> : t.auth.loginButton}
          </Button>
        </form>

        <div className="mt-6 flex h-6 w-full items-center justify-center gap-2 text-sm">
          <span className="text-text-label text-base leading-6 font-medium">{t.auth.noAccount}</span>
          <Link href="/signup" className="text-base leading-6 font-semibold text-[#008354]">
            {t.auth.signup}
          </Link>
        </div>

        <div className="mt-10 mb-4 flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">{t.auth.snsLogin}</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

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
