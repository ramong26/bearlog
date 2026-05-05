'use client';
import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { FlagIcon, CalendarIcon, HashIcon, XIcon, LinkIcon, GitBranchIcon } from 'lucide-react';

import Tag from '@/shared/components/Tag';

import { useModalStore } from '@/shared/stores/useModalStore';
import { TodoResponse } from '@/shared/lib/api';
import { noteQueries } from '@/shared/lib/query/queryKeys';
import { formatDate } from '@/shared/utils/utils';
import { useLanguage } from '@/shared/contexts/LanguageContext';

/** GitHub 소스 라벨 반환 */
function getGithubSourceLabel(source: TodoResponse['source']): string | null {
  if (source === 'GITHUB_ISSUE') return 'GitHub Issue';
  if (source === 'GITHUB_PR') return 'GitHub PR';
  return null;
}

interface DetailTodoModalComponentsProps {
  todo: TodoResponse | undefined;
}
const DetailTodoModalComponents = memo(function DetailTodoModalComponents({ todo }: DetailTodoModalComponentsProps) {
  const { closeModal } = useModalStore();
  const { t } = useLanguage();

  if (!todo) return null;

  const githubSourceLabel = getGithubSourceLabel(todo.source);
  const hasGithubLink = githubSourceLabel && todo.linkUrl;

  return (
    <div className="flex w-85.75 flex-col gap-6 rounded-3xl bg-white dark:bg-gray-850 p-4 shadow-[0px_0px_60px_0px_rgba(0,0,0,0.05)] md:w-114 md:rounded-[40px] md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">{todo?.title}</span>
          <div className="bg-bearlog-500/10 text-bearlog-600 dark:text-bearlog-500 rounded-lg px-[5.5px] py-[3px] text-sm font-semibold">
            {todo?.done ? 'DONE' : 'TO DO'}
          </div>
          {/* GitHub 소스 뱃지 */}
          {githubSourceLabel && (
            <span className="rounded-lg bg-[#F6F8FA] dark:bg-gray-700 px-[6px] py-[3px] text-xs font-semibold text-gray-600 dark:text-gray-300">
              {githubSourceLabel}
            </span>
          )}
        </div>
        <XIcon className="cursor-pointer text-slate-400 dark:text-gray-400" size={24} onClick={closeModal} />
      </div>
      <div className="flex flex-col gap-4">
        <DetailItemSummary icon={<FlagIcon size={18} />} label={t.todo.goalLabel} value={todo?.goal?.title} />
        <DetailItemSummary
          icon={<CalendarIcon size={18} />}
          label={t.todo.dueDateLabel}
          value={todo?.dueDate ? formatDate(todo.dueDate) : ''}
        />
        <DetailItemSummary
          icon={<HashIcon size={18} />}
          label={t.todo.tagLabel}
          value={todo?.tags?.map((tag) => (
            <Tag key={tag.id} string={tag.name ?? ''} />
          ))}
        />
      </div>

      {/* GitHub 링크 섹션 */}
      {githubSourceLabel && (
        <div className="flex flex-col gap-2">
          <span className="text-base font-semibold text-gray-700 dark:text-gray-300">GitHub 연동</span>
          <div className="flex items-center gap-2 rounded-2xl bg-[#F6F8FA] dark:bg-gray-700 px-4 py-3">
            <GitBranchIcon size={16} className="shrink-0 text-gray-400" />
            {hasGithubLink ? (
              <a
                href={todo.linkUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 truncate text-sm text-[#1E90FF] hover:underline"
                title={todo.linkUrl!}
              >
                {todo.linkUrl}
              </a>
            ) : (
              <span className="text-sm text-gray-500">
                {/* TODO: 백엔드 Phase 7 완료 후 GitHub URL이 자동으로 채워집니다 */}
                GitHub URL이 아직 연결되지 않았습니다.
              </span>
            )}
          </div>
          {todo.done && (
            <p className="px-1 text-xs text-gray-400">
              {todo.source === 'GITHUB_ISSUE'
                ? '이 할 일은 완료되어 GitHub Issue가 close되었습니다.'
                : '이 할 일은 완료되어 GitHub PR이 merge되었습니다.'}
            </p>
          )}
        </div>
      )}

      {(todo?.imageUrl || (todo?.linkUrl && !githubSourceLabel)) && (
        <div className="flex flex-col gap-2">
          <span className="text-base font-semibold text-gray-700 dark:text-gray-300">{t.todo.attachmentLabel}</span>
          <div className="flex flex-col gap-3">
            <div className="flex gap-1">
              <LinkIcon size={17} className="inline-block text-gray-400" />
              <a
                href={todo?.linkUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#1E90FF]"
              >
                {todo.linkUrl}
              </a>
            </div>
          </div>
        </div>
      )}

      {todo?.noteIds && todo.noteIds.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-base font-semibold">{t.todo.noteLabel}</span>
          {todo.noteIds.map((noteId) => (
            <NoteItem key={noteId} noteId={noteId} />
          ))}
        </div>
      )}
    </div>
  );
});
export default DetailTodoModalComponents;

interface DetailItemSummaryProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
}
function DetailItemSummary({ icon, label, value }: DetailItemSummaryProps) {
  return (
    <div className="flex gap-2">
      <div className="flex items-center gap-1">
        <div className="flex items-center text-gray-400 dark:text-[#AFAFAF]">{icon}</div>
        <span className="text-sm font-medium text-gray-400 dark:text-[#AFAFAF]">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1 text-sm font-normal text-gray-700 dark:text-[#AFAFAF]">{value}</div>
    </div>
  );
}

function NoteItem({ noteId }: { noteId: number }) {
  const { closeModal } = useModalStore();
  const router = useRouter();

  const { data: note } = useQuery({
    ...noteQueries.detail(noteId),
    enabled: Boolean(noteId) && noteId !== undefined,
  });

  if (!note) return null;

  return (
    <button
      onClick={() => {
        closeModal();
        router.push(`/goal/${note?.goalId}/note/${noteId}`);
      }}
      className="flex gap-2 rounded-2xl border border-gray-200 bg-white dark:bg-gray-700 dark:border-gray-600 p-2"
    >
      <Image src={'/image/todo-note.svg'} alt="노트 이미지" width={32} height={32} />
      <span className="flex items-center text-base font-medium text-gray-700 dark:text-gray-300">{note?.title}</span>
    </button>
  );
}
