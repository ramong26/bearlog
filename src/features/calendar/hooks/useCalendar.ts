'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { todoQueries, goalQueries, userQueries } from '@/shared/lib/query/queryKeys';

export function useCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [goalId, setGoalId] = useState<number | undefined>(undefined);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const { data: calendarData } = useQuery(todoQueries.calendar({ year, month, goalId }));
  const { data: goalList } = useQuery(goalQueries.list());
  const { data: user } = useQuery(userQueries.current());

  const todos = calendarData?.todos ?? [];

  const selectedDateKey = selectedDay
    ? `${year}-${String(month).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const selectedDate = selectedDay
    ? `${year}. ${String(month).padStart(2, '0')}. ${String(selectedDay).padStart(2, '0')}`
    : '';
  const selectedDayTodos = todos.filter((todo) => todo.dueDate?.slice(0, 10) === selectedDateKey);

  const goalFilterItems = [
    { label: '전체 목표', value: '' },
    ...(goalList?.goals ?? []).filter((g) => g.id != null).map((g) => ({ label: g.title ?? '', value: String(g.id) })),
  ];

  const isCurrentMonth = (y: number, m: number) => y === today.getFullYear() && m === today.getMonth() + 1;

  const prevMonth = () => {
    const newYear = month === 1 ? year - 1 : year;
    const newMonth = month === 1 ? 12 : month - 1;
    setYear(newYear);
    setMonth(newMonth);
    setSelectedDay(isCurrentMonth(newYear, newMonth) ? today.getDate() : null);
  };

  const nextMonth = () => {
    const newYear = month === 12 ? year + 1 : year;
    const newMonth = month === 12 ? 1 : month + 1;
    setYear(newYear);
    setMonth(newMonth);
    setSelectedDay(isCurrentMonth(newYear, newMonth) ? today.getDate() : null);
  };

  return {
    year,
    month,
    goalId,
    setGoalId,
    selectedDay,
    setSelectedDay,
    selectedDate,
    selectedDayTodos,
    todos,
    goalFilterItems,
    user,
    prevMonth,
    nextMonth,
  };
}
