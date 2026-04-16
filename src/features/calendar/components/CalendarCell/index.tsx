import { TodoResponse } from '@/shared/lib/api/fetchTodos';
import CalendarEventItem from '@/features/calendar/components/CalendarEventItem';
import clsx from 'clsx';
import { useBreakpoint } from '@/shared/hooks/useBreakPoint';
import Image from 'next/image';

interface CalendarCellProps {
  day: number | null;
  todos: TodoResponse[];
  isLastRow: boolean;
  isSelected?: boolean;
  onDayClick?: (day: number) => void;
}

const MAX_VISIBLE = 3;

export default function CalendarCell({ day, todos, isLastRow, isSelected, onDayClick }: CalendarCellProps) {
  const overflow = todos.length - MAX_VISIBLE;
  const breakpoint = useBreakpoint();
  const isDotEvent = breakpoint === 'mobile' || breakpoint === 'tablet';
  const isAllDone = todos.length > 0 && todos.every((todo) => todo.done);

  return (
    <div
      className={clsx(
        'border-border-secondary dark:border-[#585858] relative h-20 overflow-hidden p-1.5 md:h-28 md:p-2 lg:h-35.5',
        !isLastRow && 'border-b',
        'border-r nth-[7n]:border-r-0',
      )}
    >
      {isAllDone && (
        <>
          <div className="bg-bearlog-500/10 pointer-events-none absolute inset-0" />
          <Image
            src="/image/stamp.png"
            alt="스탬프 이미지"
            width={80}
            height={80}
            className="pointer-events-none absolute top-1/2 left-1/2 aspect-auto w-full -translate-x-1/2 -translate-y-1/2 opacity-80"
          />
        </>
      )}
      {day != null && (
        <>
          <button onClick={() => onDayClick?.(day)} className="mb-1.5 flex justify-start">
            <span
              className={clsx(
                'flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-xs font-semibold',
                isSelected ? 'bg-bearlog-500 text-white' : 'text-gray-600 dark:text-gray-500',
              )}
            >
              {day}
            </span>
          </button>

          <div className="flex flex-col gap-0.5">
            {isDotEvent ? (
              <div className="flex gap-0.5">
                {todos.slice(0, MAX_VISIBLE).map((todo) => (
                  <div key={todo.id} className="flex gap-1 p-[1px]">
                    <div
                      className={clsx('h-[6px] w-[6px] rounded-full', todo.done ? 'bg-bearlog-500' : 'bg-gray-400')}
                    />
                  </div>
                ))}
              </div>
            ) : (
              todos.slice(0, MAX_VISIBLE).map((todo) => <CalendarEventItem key={todo.id} todo={todo} />)
            )}
            {overflow > 0 && <span className="text-xs text-gray-400">+{overflow}</span>}
          </div>
        </>
      )}
    </div>
  );
}
