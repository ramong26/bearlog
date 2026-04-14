import { CheckIcon } from 'lucide-react';

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

interface CalendarEventItemProps {
  todo: Todo;
}

export default function CalendarEventItem({ todo }: CalendarEventItemProps) {
  if (todo.done) {
    return (
      <div className="flex w-full items-center gap-1 rounded-[6px] border border-gray-300 bg-gray-50 px-2 py-1">
        <CheckIcon size={16} className="stroke-gray-400" />
        <p className="flex-1 overflow-hidden text-xs leading-4 font-semibold text-ellipsis whitespace-nowrap text-gray-400">
          {todo.title}
        </p>
      </div>
    );
  }

  return (
    <div className="border-bearlog-300 bg-calendar-300 flex w-full items-center rounded-[6px] border px-2 py-1 opacity-20">
      <p className="text-bearlog-600 flex-1 overflow-hidden text-xs leading-4 font-semibold text-ellipsis whitespace-nowrap">
        {todo.title}
      </p>
    </div>
  );
}
