import CalendarEventItem from '@/features/calendar/components/CalendarEventItem';
import { TodoResponse } from '@/shared/lib/api/fetchTodos';

interface CalendarDayTodoListProps {
  selectedDate: string;
  todos: TodoResponse[];
}

export default function CalendarDayTodoList({ selectedDate, todos }: CalendarDayTodoListProps) {
  return (
    <div className="border-border-secondary dark:border-[#585858] flex flex-col border-t px-4 py-5">
      <h3 className="pb-4 text-sm font-semibold">{selectedDate}</h3>
      <div className="flex w-full flex-col gap-[6px] last:pb-[34px]">
        {todos.map((todo) => (
          <CalendarEventItem key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
}
