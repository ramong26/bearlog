'use client';

import { formatDate } from '@/shared/utils/utils';
import EllipsisButton from '../EllipsisButton';
import Image from 'next/image';
import Link from 'next/link';
import { Note } from '@/shared/types/types';
import TodoTitle from '@/features/note/components/TodoTitle';

export default function NoteItem({ note, goalId }: { note: Note; goalId: string }) {
  const createDate = formatDate(new Date(note.createdAt));

  return (
    <Link href={`/goal/${goalId}/note/${note.id}`} className="block">
      <article className="flex cursor-pointer flex-col gap-3 rounded-[20px] bg-[#FFF] p-4 md:gap-4 md:rounded-3xl md:px-9.5 md:pt-7 md:pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Image src={'/image/note.png'} width={32} height={32} alt="노트 아이콘" className="md:h-10 md:w-10" />
            <h3 className="line-clamp-1 text-sm font-semibold text-[#1E293B] md:text-xl">{note.title}</h3>
          </div>
          <EllipsisButton
            items={[
              { label: '수정하기', value: 'edit' },
              { label: '삭제하기', value: 'delete' },
            ]}
            noteId={note.id}
            goalId={Number(goalId)}
          />
        </div>
        <div className="flex items-center justify-between">
          <TodoTitle todoId={note.todoId} />
          <div>
            <p className="text-xs font-normal whitespace-nowrap text-[#A4A4A4]">{createDate}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
