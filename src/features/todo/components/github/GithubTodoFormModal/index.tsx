'use client';

import clsx from 'clsx';
import { CheckIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import Button from '@/shared/components/Button';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import DateInput from '@/features/todo/components/manual/shared/DateInput';

import { ApiError, PostTodoRequest } from '@/shared/lib/api';
import { usePostTodo } from '@/shared/lib/query/mutations';
import { useModalStore } from '@/shared/stores/useModalStore';
import { formatDateForAPI } from '@/shared/utils/utils';
import { useLanguage } from '@/shared/contexts/LanguageContext';

type GithubTodoSource = 'GITHUB_ISSUE' | 'GITHUB_PR';

interface GithubTodoFormModalProps {
  goalId: number;
  goalTitle?: string;
}

type GithubTodoFormValues = {
  title: string;
  dueDate?: string;
  source: GithubTodoSource;
  headBranch?: string;
  baseBranch?: string;
};

const SOURCE_OPTIONS: { label: string; value: GithubTodoSource }[] = [
  {
    label: 'Issues',
    value: 'GITHUB_ISSUE',
  },
  {
    label: 'PR',
    value: 'GITHUB_PR',
  },
];

export default function GithubTodoFormModal({ goalId }: GithubTodoFormModalProps) {
  const { closeModal } = useModalStore();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<GithubTodoFormValues>({
    mode: 'onSubmit',
    defaultValues: {
      title: '',
      dueDate: undefined,
      source: 'GITHUB_ISSUE',
      headBranch: '',
      baseBranch: '',
    },
  });

  const dueDate = useWatch({ control, name: 'dueDate' });
  const source = useWatch({ control, name: 'source' });
  const title = useWatch({ control, name: 'title' });
  const headBranch = useWatch({ control, name: 'headBranch' });
  const baseBranch = useWatch({ control, name: 'baseBranch' });

  const selectedDate = dueDate ? new Date(dueDate) : undefined;
  const isPR = source === 'GITHUB_PR';
  const isFormIncomplete = !title?.trim() || !dueDate || (isPR && (!headBranch?.trim() || !baseBranch?.trim()));

  const postTodoMutation = usePostTodo();
  const isSubmitting = postTodoMutation.isPending;

  const onSubmit = async (data: GithubTodoFormValues) => {
    setSubmitError(null);

    try {
      const body: PostTodoRequest = {
        title: data.title,
        goalId,
        dueDate: data.dueDate,
        source: data.source,
        linkUrl: undefined,
        imageUrl: undefined,
        tags: [],
        // PR 생성 시 headBranch(소스 브랜치, 이미 존재해야 함)와 baseBranch(대상 브랜치) 전달
        ...(isPR && {
          headBranch: data.headBranch?.trim() || undefined,
          baseBranch: data.baseBranch?.trim() || undefined,
        }),
      };

      await postTodoMutation.mutateAsync(body);
      closeModal();
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : t.todo.submitError);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={clsx(
        'no-scrollbar flex max-h-[90vh] w-full flex-col gap-3 overflow-y-auto rounded-t-[32px] bg-white dark:bg-gray-850 p-6 shadow-[0px_0px_60px_0px_rgba(0,0,0,0.05)]',
        'md:w-[488px] md:gap-4 md:rounded-[40px] md:p-8',
      )}
    >
      <div className="mb-1 flex items-center justify-between md:mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">{t.todo.createTitle}</h1>
        </div>
        <button
          type="button"
          className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          onClick={closeModal}
          disabled={isSubmitting}
        >
          <XIcon size={24} className="stroke-gray-400" />
        </button>
      </div>

      {submitError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">{submitError}</p>}

      {/* 작업유형 선택 */}
      <FormField label={t.todo.sourceTypeLabel} required>
        <div className="flex flex-wrap gap-3">
          {SOURCE_OPTIONS.map((option) => {
            const isSelected = source === option.value;

            return (
              <button
                key={option.value}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                onClick={() => setValue('source', option.value, { shouldDirty: true })}
                className={
                  'flex min-h-11 items-center gap-[6px] rounded-2xl px-1 py-1 text-left transition-all duration-150'
                }
              >
                <span
                  className={clsx(
                    'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all duration-150',
                    isSelected
                      ? 'border-bearlog-500 bg-bearlog-500 text-white dark:text-gray-850'
                      : 'border-gray-300 bg-white dark:border-[#7E7E7E] dark:bg-gray-850 text-transparent',
                  )}
                >
                  <CheckIcon size={18} strokeWidth={3} />
                </span>

                <span
                  className={
                    'text-xl leading-none font-extrabold tracking-[-0.03em] text-gray-400 transition-colors duration-150'
                  }
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </FormField>

      {/* PR 생성 안내 */}
      {isPR && (
        <div className="rounded-2xl bg-[#F6F8FA] dark:bg-gray-750 px-4 py-3 text-xs leading-5 text-gray-600 dark:text-white">
          <p className="font-semibold text-gray-700 dark:text-white">{t.todo.prGuideTitle}</p>
          <p>{t.todo.prGuideDesc1}</p>
          <p>{t.todo.prGuideDesc2}</p>
          <p>{t.todo.prGuideDesc3}</p>
        </div>
      )}

      {/* Issue 생성 안내 */}
      {!isPR && (
        <div className="rounded-2xl bg-[#F6F8FA] dark:bg-gray-750 px-4 py-3 text-xs leading-5 text-gray-600 dark:text-white">
          <p className="font-semibold text-gray-700 dark:text-white">{t.todo.issueGuideTitle}</p>
          <p>{t.todo.issueGuideDesc1}</p>
          <p>{t.todo.issueGuideDesc2}</p>
        </div>
      )}

      <FormField label={t.todo.titleLabel} required>
        <Input
          autoFocus
          {...register('title', { required: t.todo.titleRequired })}
          placeholder={isPR ? t.todo.githubPrTitlePlaceholder : t.todo.githubIssueTitlePlaceholder}
          className="h-11 rounded-xl border-gray-300 dark:border-[#7E7E7E] p-3 text-sm font-normal text-[#333] dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 md:h-14 md:rounded-2xl md:p-4 md:text-base"
        />
        {errors.title && <p className="px-1 text-xs text-red-500 md:text-sm">{errors.title.message}</p>}
      </FormField>

      {/* PR 전용 — Head 브랜치 입력 */}
      {isPR && (
        <FormField label={t.todo.headBranchLabel} required>
          <Input
            {...register('headBranch', { required: t.todo.headBranchRequired })}
            placeholder={t.todo.headBranchPlaceholder}
            className="h-11 rounded-xl border-gray-300 dark:border-[#7E7E7E] p-3 text-sm font-normal text-[#333] dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 md:h-14 md:rounded-2xl md:p-4 md:text-base"
          />
          {errors.headBranch && <p className="px-1 text-xs text-red-500 md:text-sm">{errors.headBranch.message}</p>}
        </FormField>
      )}

      {/* PR 전용 — Base 브랜치 입력 */}
      {isPR && (
        <FormField label={t.todo.baseBranchLabel} required>
          <Input
            {...register('baseBranch', { required: t.todo.baseBranchRequired })}
            placeholder={t.todo.baseBranchPlaceholder}
            className="h-11 rounded-xl border-gray-300 dark:border-[#7E7E7E] p-3 text-sm font-normal text-[#333] dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 md:h-14 md:rounded-2xl md:p-4 md:text-base"
          />
          {errors.baseBranch && <p className="px-1 text-xs text-red-500 md:text-sm">{errors.baseBranch.message}</p>}
        </FormField>
      )}

      <FormField label={t.todo.dueDateLabel} required>
        <DateInput
          {...register('dueDate', { required: t.todo.dueDateRequired })}
          date={selectedDate}
          onSelect={(nextDate) => {
            setValue('dueDate', nextDate ? formatDateForAPI(nextDate) : undefined, {
              shouldValidate: true,
            });
          }}
          onConfirm={(nextDate) => {
            setValue('dueDate', nextDate ? formatDateForAPI(nextDate) : undefined, {
              shouldValidate: true,
            });
          }}
        />
        {errors.dueDate && <p className="px-1 text-xs text-red-500 md:text-sm">{errors.dueDate.message}</p>}
      </FormField>

      <div className="mt-1 flex items-center gap-2 md:mt-[34px] md:gap-3">
        <Button
          type="button"
          variant="tertiary"
          className="h-12 w-full border border-gray-300 dark:border-[#7E7E7E] text-gray-500 md:h-14"
          onClick={closeModal}
          disabled={isSubmitting}
        >
          {t.common.cancel}
        </Button>
        <Button type="submit" variant="primary" className="h-12 w-full dark:text-gray-850 dark:disabled:bg-[#8C8C8C] md:h-14" disabled={isSubmitting || isFormIncomplete}>
          {isSubmitting ? t.todo.creating : t.common.confirm}
        </Button>
      </div>
    </form>
  );
}
