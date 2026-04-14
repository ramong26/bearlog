import { TodoResponse } from '@/shared/lib/api/fetchTodos';
import CalendarCell from '@/features/calendar/components/CalendarCell';

interface CalendarGridProps {
  year: number;
  month: number;
  todos: TodoResponse[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarGrid({ year, month, todos, selectedDay, onSelectDay }: CalendarGridProps) {
  // dueDate 기준으로 날짜별 그룹핑
  const todosByDate: Record<string, TodoResponse[]> = {};
  for (const todo of todos) {
    if (!todo.dueDate) continue;
    const dateKey = todo.dueDate.slice(0, 10); // "YYYY-MM-DD"
    if (!todosByDate[dateKey]) todosByDate[dateKey] = [];
    todosByDate[dateKey].push(todo);
  }

  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=일
  const daysInMonth = new Date(year, month, 0).getDate();

  // 6주 × 7일 = 42칸
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  
  return (
    <div className="w-full overflow-hidden last:rounded-b-4xl">
      {/* 요일 헤더 */}
      <div className="border-border-secondary grid grid-cols-7 border-t border-b">
        {DAYS.map((d) => (
          <div
            key={d}
            className="border-border-secondary border-r py-2 text-center text-xs font-medium text-gray-500 last:border-r-0"
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 셀 */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          const dateKey = day ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
          return (
            <CalendarCell
              key={idx}
              day={day}
              todos={dateKey ? (todosByDate[dateKey] ?? []) : []}
              isLastRow={idx >= cells.length - 7}
              isSelected={day === selectedDay}
              onDayClick={onSelectDay}
            />
          );
        })}
      </div>
    </div>
  );
}
