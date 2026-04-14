'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { CheckIcon, CircleDotIcon, EllipsisVertical, GitPullRequestArrowIcon, Star } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import EditDeleteDropdown from '@/features/dashboard/components/EditDeleteDropdown';
import DetailTodoModal from '@/features/goal/components/DetailTodoModal';

import { useTodoEditModal } from '@/features/todo/hooks/useTodoEditModal';
import { useDeleteTodo } from '@/shared/lib/query/mutations';
import { useModalStore } from '@/shared/stores/useModalStore';
import { TodoResponse } from '@/shared/lib/api';

/** GitHub 연동 todo 여부 — 백엔드는 source를 항상 "github"(소문자)로 반환 */
function isGithubTodo(source: TodoResponse['source']) {
  return source === 'github';
}

interface TaskCardProps {
  todo: TodoResponse;
  onCheckboxClick: () => void;
  onStareClick: () => void;
  variant?: 'default' | 'green';
}

export default function TaskCard({ todo, onCheckboxClick, onStareClick, variant = 'default' }: TaskCardProps) {
  const isGreen = variant === 'green';

  return (
    <li
      className={clsx(
        'group relative flex w-full items-center gap-2 rounded-2xl px-2 py-2 transition-all duration-150 ease-in-out hover:bg-[rgba(0,200,127,0.1)]',
        'sm:gap-3 sm:px-3 sm:py-2.5',
        'lg:px-4',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <TaskCheckbox todo={todo} onCheckboxClick={onCheckboxClick} isGreen={isGreen} />
        <TaskTitleButton todo={todo} isGreen={isGreen} />
      </div>

      <div
        className="flex shrink-0 items-center gap-1 sm:gap-1.5"
        role="toolbar"
        aria-label={`${todo.title} 작업 도구`}
      >
        <TaskLinkNoteCreate todo={todo} />
        {todo.type !== 'BASIC' && <TaskLinkGithub todo={todo} />}
        <TaskEditTodo todo={todo} />
        <TaskFavorite todo={todo} onStareClick={onStareClick} />
      </div>
    </li>
  );
}

interface TaskCheckboxProps {
  todo: TodoResponse;
  onCheckboxClick: () => void;
  isGreen: boolean;
}
function TaskCheckbox({ todo, isGreen, onCheckboxClick }: TaskCheckboxProps) {
  const isGithub = isGithubTodo(todo.source);
  const isDoneAndLocked = isGithub && todo.done && todo.type !== 'ISSUE';

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={todo.done ?? false}
      aria-label={
        isDoneAndLocked
          ? `${todo.title} (GitHub 연동 완료 후 되돌리기 불가)`
          : `${todo.title} ${todo.done ? '완료 취소' : '완료 처리'}`
      }
      onClick={isDoneAndLocked ? undefined : onCheckboxClick}
      disabled={isDoneAndLocked}
      title={isDoneAndLocked ? 'GitHub 연동 할 일은 완료 후 되돌릴 수 없습니다.' : undefined}
      className={twMerge(
        clsx(
          'relative flex size-4.5 shrink-0 items-center justify-center rounded-md transition-all duration-150 ease-in-out',
          todo.done ? 'bg-bearlog-500 border-none' : 'border border-border-input bg-bg-input',
          isGreen ? '' : 'border-none',
          isDoneAndLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
        ),
      )}
    >
      {todo.done && <CheckIcon size={16} className="text-white dark:text-gray-850" />}
    </button>
  );
}

interface TaskTitleButtonProps {
  todo: TodoResponse;
  isGreen: boolean;
}
function TaskTitleButton({ todo, isGreen }: TaskTitleButtonProps) {
  const { openModal } = useModalStore();

  return (
    <button
      type="button"
      onClick={() => {
        if (todo.id) openModal(<DetailTodoModal todoId={todo.id} />);
      }}
      className={clsx(
        'group/title flex min-w-0 flex-1 overflow-hidden text-left text-sm leading-5 tracking-[-0.02em] transition-all duration-150 ease-in-out',
        'sm:text-[15px] sm:leading-6 md:text-base',
        todo.done && 'group-hover:text-bearlog-600 font-medium group-hover:font-semibold',
        isGreen
          ? 'group-hover:text-bearlog-600 text-gray-800 dark:text-gray-450 group-hover:font-semibold'
          : 'group-hover:text-bearlog-600 text-gray-500 dark:text-gray-450 group-hover:font-semibold',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
        <TaskGithubBadge todo={todo} />
        <div className="flex items-center justify-center gap-1">
          <span className="min-w-0 flex-1 truncate">{todo.title}</span>
          {(todo.status === 'MERGED' || todo.status === 'CLOSED' || todo.status === 'OPEN') && (
            <span className="bg-bearlog-500 ml-1 h-[17px] rounded-full px-2 text-[11px] leading-[17px] text-white opacity-0 transition-opacity duration-150 group-hover/title:opacity-100">
              {todo.status}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
interface TaskGithubBadgeProps {
  todo: TodoResponse;
}

function TaskGithubBadge({ todo }: TaskGithubBadgeProps) {
  switch (todo.type) {
    case 'ISSUE':
      return <CircleDotIcon className="shrink-0 text-gray-500" size={16} />;
    case 'PR':
      return <GitPullRequestArrowIcon className="shrink-0 text-gray-500" size={16} />;
    default:
      return null;
  }
}

interface TaskLinkNoteCreateProps {
  todo: TodoResponse;
}

function TaskLinkNoteCreate({ todo }: TaskLinkNoteCreateProps) {
  if (!todo.goal?.id || !todo.id) return null;

  return (
    <Link
      href={`/goal/${todo.goal.id}/note/create?todoId=${todo.id}`}
      className="relative flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center"
      aria-label="노트 작성 페이지로 이동"
    >
      <Image src="/image/go-note.png" alt="Note menu" width={24} height={24} className="absolute inset-0 dark:brightness-[0.6]" />
    </Link>
  );
}

interface TaskLinkGithubProps {
  todo: TodoResponse;
}
function TaskLinkGithub({ todo }: TaskLinkGithubProps) {
  if (!isGithubTodo(todo.source)) return null;

  if (!todo.linkUrl) {
    return (
      <span
        title="GitHub URL이 아직 연결되지 않았습니다"
        className="flex h-6 w-6 shrink-0 cursor-not-allowed items-center justify-center opacity-40"
        aria-label="GitHub 링크 없음"
      >
        <Image src="/image/github-icon.png" alt="GitHub menu" width={24} height={24} />
      </span>
    );
  }

  return (
    <a
      href={todo.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub에서 보기"
      title={todo.linkUrl}
      className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center"
    >
      <Image src="/image/github-icon.png" alt="GitHub menu" width={24} height={24} />
    </a>
  );
}

interface TaskLinkDetailProps {
  todo: TodoResponse;
}
function TaskEditTodo({ todo }: TaskLinkDetailProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { openTodoEditModal } = useTodoEditModal();
  const { mutate: deleteTodo } = useDeleteTodo(todo.id);

  const handleDelete = () => {
    deleteTodo();
    setOpen(false);
  };

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-label="편집 모달 보기"
        onClick={() => setOpen((prev) => !prev)}
        className="relative h-6 w-6 cursor-pointer rounded-full bg-[rgba(0,200,127,0.1)] p-1"
      >
        <EllipsisVertical color="#008354" className="absolute inset-0 p-1" />
      </button>

      {open && (
        <EditDeleteDropdown
          handleEdit={() => {
            if (todo.id === undefined) return;

            openTodoEditModal({
              goalDetailId: todo.goal?.id,
              todo: { id: todo.id, title: todo.title, done: todo.done ?? false },
            });
            setOpen(false);
          }}
          editDisabled={isGithubTodo(todo.source)}
          handleDelete={handleDelete}
          onClose={() => setOpen(false)}
          anchorRef={buttonRef}
        />
      )}
    </div>
  );
}

interface TaskFavoriteProps {
  todo: TodoResponse;
  onStareClick: () => void;
}
function TaskFavorite({ todo, onStareClick }: TaskFavoriteProps) {
  return (
    <button
      type="button"
      aria-label={todo.favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
      aria-pressed={todo.favorite}
      onClick={onStareClick}
      className="h-6 w-6 shrink-0 cursor-pointer rounded-full"
    >
      <Star className="h-6 w-6 stroke-[rgba(0,200,127,0.1)]" fill={todo.favorite ? '#00c87f' : 'none'} />
    </button>
  );
}
