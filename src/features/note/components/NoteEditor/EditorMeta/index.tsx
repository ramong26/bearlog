'use client';

import Tag from '@/shared/components/Tag';
import { formatDate } from '@/shared/utils/utils';
import clsx from 'clsx';
import { CalendarIcon, FlagIcon, Hash, SquareCheck } from 'lucide-react';
import { useLanguage } from '@/shared/contexts/LanguageContext';

/**
 * 부모 컴포넌트에서 사용법
 *  <EditorMeta
      goal={{
        title: '올해 안에 풀스택 개발자 되기',
      }}
      todos={{
        title: 'React 컴포넌트 설계 공부하기',
        done: false,
      }}
      tags={[
        { id: '1', string: 'React' },
        { id: '2', string: 'TypeScript' },
        { id: '3', string: '공부' },
      ]}
    />
 */

interface MetaTag {
  id: string;
  string: string;
  variant?: 'green';
}

interface EditorMetaProps {
  goal: {
    title: string;
  };
  todos: {
    title: string;
    done: boolean;
  };
  tags: MetaTag[];
  createdAt: string;
}

export default function EditorMeta({ goal, todos, createdAt, tags }: EditorMetaProps) {
  const { t } = useLanguage();
  const todosTagLabel = todos.done ? 'DONE' : 'TO DO';
  const today = formatDate(new Date());
  const formattedCreatedAt = createdAt ? formatDate(new Date(createdAt)) : null;

  return (
    <div className="flex w-full flex-col gap-3 md:flex-row">
      {/* 왼쪽 — 목표 / 할 일 */}
      <div className="flex flex-1 flex-col gap-3 md:w-1/2">
        <MetaRow icon={<FlagIcon size={18} className="text-[#A4A4A4]" />} label={t.note.goalLabel}>
          <span className="line-clamp-1 text-sm font-normal text-[#333333]">{goal.title}</span>
        </MetaRow>
        <MetaRow icon={<SquareCheck size={18} className="text-[#A4A4A4]" />} label={t.note.todoLabel}>
          <div className="flex items-center gap-2">
            <span className="line-clamp-1 text-sm font-normal text-[#333333]">{todos.title}</span>

            <Tag
              string={todosTagLabel}
              className={clsx(
                'rounded-md px-[5.5px] py-[3px] text-xs font-semibold',
                !todos.done && 'text-bearlog-600 bg-[rgba(0,183,117,0.10)]',
                todos.done && 'bg-[#BBB] text-[#FFF]',
              )}
            />
          </div>
        </MetaRow>
      </div>

      {/* 오른쪽 — 작성일 / 태그 */}
      <div className="flex flex-1 flex-col gap-3 md:w-1/2">
        <MetaRow icon={<CalendarIcon size={17} className="line-clamp-1 text-[#A4A4A4]" />} label={t.note.createdAtLabel}>
          <span className="line-clamp-1 text-sm font-normal text-[#333333]">{formattedCreatedAt ?? today}</span>
        </MetaRow>

        <MetaRow icon={<Hash size={17} className="text-[#A4A4A4]" />} label={t.note.tagLabel}>
          <div className="no-scrollbar flex gap-1 overflow-x-auto">
            {tags.map((tag) => (
              <Tag
                key={tag.id}
                string={tag.string}
                variant="green"
                className="rounded-full border px-2 py-1 text-xs font-medium whitespace-nowrap"
              />
            ))}
          </div>
        </MetaRow>
      </div>
    </div>
  );
}

// 아이콘 + 라벨 + 값 반복
function MetaRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex shrink-0 items-center justify-center gap-1 pr-3">
        <span>{icon}</span>
        <span className="text-sm leading-5 font-medium text-[#a4a4a4]">{label}</span>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
