'use client';

import clsx from 'clsx';
import { XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';

import Button from '@/shared/components/Button';
import Dropdown from '@/shared/components/Dropdown';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import DateInput from '../shared/DateInput';
import ImageInput from '../shared/ImageInput';
import LinkInput from '../shared/LinkInput';
import StatusField from '../shared/StatusField';
import TagInput from '../shared/TagInput';

import { ApiError, PatchTodoRequest, PostTodoRequest } from '@/shared/lib/api';
import { usePatchTodo, usePostTodo } from '@/shared/lib/query/mutations';
import { goalQueries, todoQueries } from '@/shared/lib/query/queryKeys';
import { useModalStore } from '@/shared/stores/useModalStore';
import { formatDateForAPI } from '@/shared/utils/utils';
import { useLanguage } from '@/shared/contexts/LanguageContext';
interface BaseProps {
  goalDetailId: number;
}

interface CreateMode extends BaseProps {
  mode: 'create';
  todo: PostTodoRequest;
}

interface EditMode extends BaseProps {
  mode: 'edit';
  todo: PatchTodoRequest & { id: number };
}

type TodoFormModalProps = CreateMode | EditMode;
type TodoFormValues = PostTodoRequest & PatchTodoRequest;

export default function TodoFormModal({ mode, todo, goalDetailId }: TodoFormModalProps) {
  const { closeModal } = useModalStore();
  const { t } = useLanguage();
  const isEditMode = mode === 'edit';
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<TodoFormValues>({
    mode: 'onSubmit',
    defaultValues: isEditMode
      ? {
          title: todo.title ?? '',
          dueDate: todo.dueDate ?? undefined,
          linkUrl: todo.linkUrl ?? undefined,
          imageUrl: todo.imageUrl ?? undefined,
          tags: todo.tags?.filter((tag): tag is string => tag !== null) ?? [],
          done: todo.done ?? false,
        }
      : {
          goalId: goalDetailId ?? todo.goalId,
          title: '',
          dueDate: undefined,
          linkUrl: undefined,
          imageUrl: undefined,
          tags: [],
          done: false,
        },
  });

  const tags = (useWatch({ control, name: 'tags' }) ?? []).filter((tag): tag is string => tag !== null);
  const goalId = useWatch({ control, name: 'goalId' });
  const linkUrl = useWatch({ control, name: 'linkUrl' });
  const imageUrl = useWatch({ control, name: 'imageUrl' }) ?? null;
  const dueDate = useWatch({ control, name: 'dueDate' });
  const done = useWatch({ control, name: 'done' }) ?? false;
  const title = useWatch({ control, name: 'title' });

  const isFormIncomplete = !title || !goalId || !dueDate;

  const selectedDate = dueDate ? new Date(dueDate) : undefined;

  const { data: goals } = useQuery(goalQueries.list());

  const todoId = isEditMode && 'id' in todo ? todo.id : 0;
  const { data: todoDetail } = useQuery({
    ...todoQueries.detail(todoId),
    enabled: isEditMode && !!todoId,
  });

  const postTodoMutation = usePostTodo();
  const patchTodoMutation = usePatchTodo(todoId);
  const isSubmitting = postTodoMutation.isPending || patchTodoMutation.isPending;

  useEffect(() => {
    if (!isEditMode || !todoDetail) return;

    reset({
      title: todoDetail.title ?? '',
      goalId: todoDetail.goal?.id,
      dueDate: todoDetail.dueDate ?? undefined,
      linkUrl: todoDetail.linkUrl ?? undefined,
      imageUrl: todoDetail.imageUrl ?? undefined,
      tags: todoDetail.tags ? todoDetail.tags.map((tag) => tag.name).filter((tag): tag is string => tag !== null) : [],
      done: todoDetail.done ?? false,
    });
  }, [isEditMode, reset, todoDetail]);

  useEffect(() => {
    if (isEditMode) return;
    if (goalId || !goals?.goals?.length) return;

    const nextGoalId = goalDetailId ?? goals.goals[0]?.id;
    if (nextGoalId === undefined) return;

    setValue('goalId', nextGoalId, { shouldDirty: false });
  }, [goalDetailId, goalId, goals, isEditMode, setValue]);

  const goalOptions =
    goals?.goals?.map((goal) => ({
      label: goal.title ?? '',
      value: String(goal.id),
    })) ?? [];

  const defaultGoalId = isEditMode
    ? todoDetail?.goal?.id
      ? String(todoDetail.goal.id)
      : goalOptions[0]?.value
    : todo.goalId
      ? String(todo.goalId)
      : goalOptions[0]?.value;

  const onSubmit = async (data: TodoFormValues) => {
    setSubmitError(null);

    try {
      if (isEditMode && 'id' in todo) {
        await patchTodoMutation.mutateAsync({
          title: data.title,
          dueDate: data.dueDate,
          linkUrl: data.linkUrl ?? null,
          imageUrl: data.imageUrl ?? null,
          tags: data.tags,
          done: data.done,
        });
      } else {
        await postTodoMutation.mutateAsync({
          source: 'MANUAL',
          title: data.title,
          goalId: data.goalId,
          dueDate: data.dueDate,
          linkUrl: data.linkUrl ?? undefined,
          imageUrl: data.imageUrl ?? undefined,
          tags: data.tags,
        });
      }

      closeModal();
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : t.todo.submitError);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={clsx(
        'no-scrollbar flex w-full flex-col bg-white dark:bg-gray-850 shadow-[0px_0px_60px_0px_rgba(0,0,0,0.05)]',
        'gap-3 rounded-t-[32px] p-6',
        'max-h-[90vh] overflow-y-auto',
        'md:w-[488px] md:gap-4 md:rounded-[40px] md:p-8',
      )}
    >
      <div className="mb-1 flex items-center justify-between md:mb-4">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">{isEditMode ? t.todo.editTitle : t.todo.createTitle}</h1>
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

      {isEditMode && (
        <StatusField
          done={done}
          onChange={(nextDone) => {
            setValue('done', nextDone, { shouldDirty: true });
          }}
        />
      )}

      <FormField label={t.todo.titleLabel} required>
        <Input
          autoFocus
          {...register('title', { required: t.todo.titleRequired })}
          placeholder={t.todo.titlePlaceholder}
          className="h-11 rounded-xl border-gray-300 dark:border-[#7E7E7E] dark:bg-gray-850 dark:text-gray-100 dark:placeholder:text-gray-400 p-3 text-sm font-normal text-[#333] placeholder:text-gray-500 md:h-14 md:rounded-2xl md:p-4 md:text-base"
        />
        {errors.title && <p className="px-1 text-xs text-red-500 md:text-sm">{errors.title.message}</p>}
      </FormField>

      <FormField label={t.todo.goalLabel} required>
        <Dropdown
          defaultValue={defaultGoalId}
          {...register('goalId', { required: t.todo.goalRequired })}
          items={goalOptions}
          selectedValue={goalId ? String(goalId) : ''}
          onSelectItem={(item) => setValue('goalId', Number(item.value), { shouldDirty: true })}
          isDisabled={isEditMode}
          className="h-11 rounded-xl p-3 placeholder:text-gray-500 md:h-14 md:rounded-2xl md:p-4"
        />
        {errors.goalId && <p className="px-1 text-xs text-red-500 md:text-sm">{errors.goalId.message}</p>}
      </FormField>

      <FormField label={t.todo.dueDateLabel} required>
        <DateInput
          {...register('dueDate', { required: t.todo.dueDateRequired })}
          date={selectedDate}
          onSelect={(nextDate) => {
            setValue('dueDate', nextDate ? formatDateForAPI(nextDate) : undefined, { shouldValidate: true });
          }}
          onConfirm={(nextDate) => {
            setValue('dueDate', nextDate ? formatDateForAPI(nextDate) : undefined, { shouldValidate: true });
          }}
        />
        {errors.dueDate && <p className="px-1 text-xs text-red-500 md:text-sm">{errors.dueDate.message}</p>}
      </FormField>

      <FormField label={t.todo.tagLabel}>
        <TagInput
          tags={tags}
          onAddTag={(tag) => setValue('tags', [...tags, tag], { shouldDirty: true })}
          onRemoveTag={(tag) =>
            setValue(
              'tags',
              tags.filter((currentTag) => currentTag !== tag),
              { shouldDirty: true },
            )
          }
        />
      </FormField>

      <FormField label={t.todo.linkLabel}>
        <LinkInput
          value={linkUrl ?? ''}
          onChange={(value) => setValue('linkUrl', value || undefined, { shouldDirty: true })}
        />
      </FormField>

      <FormField label={t.todo.imageLabel}>
        <ImageInput
          image={imageUrl}
          onChange={(nextImage) => {
            setValue('imageUrl', nextImage ?? undefined, { shouldDirty: true });
          }}
        />
      </FormField>

      <div className="mt-1 flex items-center gap-2 md:mt-[34px] md:gap-3">
        <Button
          type="button"
          variant="tertiary"
          className="h-12 w-full border border-gray-300 dark:border-[#7E7E7E] text-gray-500 dark:text-gray-500 md:h-14"
          onClick={closeModal}
          disabled={isSubmitting}
        >
          {t.modal.cancel}
        </Button>
        <Button type="submit" variant="primary" className="h-12 w-full dark:text-[#2F2F2F] dark:disabled:bg-[#8C8C8C] md:h-14" disabled={isSubmitting || isFormIncomplete}>
          {t.modal.confirm}
        </Button>
      </div>
    </form>
  );
}
