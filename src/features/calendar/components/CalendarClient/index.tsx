'use client';

import CalendarGrid from '@/features/calendar/components/CalendarGrid';
import CalendarHeader from '@/features/calendar/components/CalendarHeader';
import CalendarDayTodoList from '@/features/calendar/components/CalendarDayTodoList';
import PageHeader from '@/shared/components/PageHeader';
import { useBreakpoint } from '@/shared/hooks/useBreakPoint';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useCalendar } from '@/features/calendar/hooks/useCalendar';

const localeMap: Record<string, string> = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' };

export default function CalendarClient() {
  const {
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
  } = useCalendar();

  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const isDesktop = breakpoint === 'desktop';
  const { t, language } = useLanguage();

  const formattedYearMonth = new Intl.DateTimeFormat(localeMap[language], { year: 'numeric', month: 'long' }).format(new Date(year, month - 1));

  const translatedGoalFilterItems = [
    { label: t.calendar.allGoal, value: '' },
    ...goalFilterItems.filter((item) => item.value !== ''),
  ];

  return (
    <>
      {!isMobile && <PageHeader title={user?.nickname ? `${user.nickname}${t.calendar.title}` : t.sidebar.calendar} className="md:mb-[32px] lg:mb-5" />}
      <div className="border-border-secondary flex w-full flex-col bg-white md:rounded-t-4xl md:rounded-b-4xl md:border">
        <CalendarHeader
          goalId={goalId}
          goalFilterItems={translatedGoalFilterItems}
          formattedYearMonth={formattedYearMonth}
          onPrev={prevMonth}
          onNext={nextMonth}
          onGoalChange={(item) => setGoalId(item.value === '' ? undefined : Number(item.value))}
        />

        <CalendarGrid year={year} month={month} todos={todos} selectedDay={selectedDay} onSelectDay={setSelectedDay} />

        {!isDesktop && (
          <CalendarDayTodoList selectedDate={selectedDate} todos={selectedDayTodos} />
        )}
      </div>
    </>
  );
}
