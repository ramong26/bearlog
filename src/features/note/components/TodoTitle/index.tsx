'use client';

import { useQuery } from '@tanstack/react-query';
import { todoQueries } from '@/shared/lib/query/queryKeys';
import Tag from '@/shared/components/Tag';
import clsx from 'clsx';

export default function TodoTitle({ todoId }: { todoId: number }) {
  const { data: todo } = useQuery(todoQueries.detail(todoId));

  return (
    <div className="flex items-center gap-2">
      <Tag
        string={todo?.done ? 'DONE' : 'TO DO'}
        variant="green"
        className={clsx(
          'rounded-md px-[5.5px] py-[3px] text-xs font-semibold whitespace-nowrap',
          !todo?.done && 'text-bearlog-600 bg-[rgba(0,183,117,0.10)]',
          todo?.done && 'bg-[#BBB] text-[#FFF]',
        )}
      />
      <p className="line-clamp-1 text-sm font-normal text-[#333]">{todo?.title}</p>
    </div>
  );
}
