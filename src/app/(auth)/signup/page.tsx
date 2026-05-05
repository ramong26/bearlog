'use client';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import FormField from '@/shared/components/FormField';
import { fetchAuth } from '@/shared/lib/api/fetchAuth';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useLanguage, type TranslationType } from '@/shared/contexts/LanguageContext';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { GITHUB_AUTH_INTENT_KEY } from '@/shared/constants/githubAuth';

const createSignupSchema = (t: TranslationType) =>
  z
    .object({
      name: z.string().min(1, t.validation.nameRequired),
      email: z.string().min(1, t.validation.emailRequired).email(t.validation.emailInvalid),
      password: z.string().min(1, t.validation.passwordRequired).min(8, t.validation.passwordMin),
      passwordConfirm: z.string().min(1, t.validation.passwordConfirmRequired),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: t.validation.passwordMismatch,
      path: ['passwordConfirm'],
    });

type SignupFormValues = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToastStore();
  const { t } = useLanguage();

  const signupSchema = useMemo(() => createSignupSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      await fetchAuth.postSignup({ nickname: data.name, email: data.email, password: data.password });
      showToast(t.auth.signupSuccess, 'success');
      router.push('/login');
    } catch (error) {
      console.error(error);
      showToast(t.auth.signupFail, 'fail');
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
        <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <FormField label={t.auth.name}>
            <Input
              type="text"
              placeholder={t.auth.namePlaceholder}
              {...register('name')}
            />
          </FormField>

          {/* 이메일 */}
          <FormField label={t.auth.email} error={errors.email?.message}>
            <Input
              type="text"
              placeholder={t.auth.emailPlaceholder}
              {...register('email')}
            />
          </FormField>

          {/* 비밀번호 */}
          <FormField label={t.auth.password} error={errors.password?.message}>
            <Input
              type="password"
              placeholder={t.auth.passwordPlaceholder}
              {...register('password')}
            />
          </FormField>

          <FormField label={t.auth.passwordConfirm} error={errors.passwordConfirm?.message}>
            <Input
              type="password"
              placeholder={t.auth.passwordConfirmPlaceholder}
              {...register('passwordConfirm')}
            />
          </FormField>

          <Button
            type="submit"
            className="mt-8 h-14 w-full"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? <LoadingSpinner /> : t.auth.signupButton}
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
