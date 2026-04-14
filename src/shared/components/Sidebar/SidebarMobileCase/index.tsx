'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

import PageHeader from '@/shared/components/PageHeader';
import NotificationDropdown from '@/shared/components/Sidebar/NotificationDropdown';
import { useMobileHeaderStore } from '@/shared/stores/useMobileHeaderStore';
import { CurrentUserResponse } from '@/shared/lib/api/fetchUsers';
import { todoQueries } from '@/shared/lib/query/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/shared/contexts/LanguageContext';

interface SidebarMobileCaseProps {
  user: CurrentUserResponse | undefined;
}
export default function SidebarMobileCase({ user }: SidebarMobileCaseProps) {
  const pathname = usePathname();
  const slot = useMobileHeaderStore((s) => s.slot);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { t } = useLanguage();

  const { data: todoList } = useQuery(todoQueries.list());
  const favoriteCount = todoList?.todos?.filter((todo) => todo.favorite).length ?? 0;

  let title: string | undefined;
  let count: number | undefined;
  const actions: React.ReactNode = (
    <NotificationDropdown
      isOpen={notificationOpen}
      onOpen={() => setNotificationOpen(true)}
      onClose={() => setNotificationOpen(false)}
      isSidebarOpen={false}
      placement="bottom"
    />
  );

  if (pathname === '/dashboard') {
    title = `${user?.nickname ?? '체다치즈'}${t.dashboard.title}`;
  } else if (/^\/goal\/[^/]+$/.test(pathname)) {
    title = `${user?.nickname ?? '체다치즈'}${t.goal.title}`;
  } else if (pathname === '/dashboard/all-todo') {
    title = t.allTodo.title;
    count = todoList?.totalCount;
  } else if (/^\/goal\/[^/]+\/note$/.test(pathname)) {
    title = t.goal.noteCollection;
  } else if (/^\/goal\/[^/]+\/note\/create$/.test(pathname)) {
    title = t.note.createTitle;
  } else if (/^\/goal\/[^/]+\/note\/[^/]+\/edit$/.test(pathname)) {
    title = t.note.editTitle;
  } else if (pathname === '/dashboard/favorite-todo') {
    title = t.sidebar.favoriteTodo;
    count = favoriteCount;
  } else if (pathname === '/calendar') {
    title = t.sidebar.calendar;
  } else if (pathname === '/mypage') {
    title = t.mypage.title;
  }

  if (slot) {
    return (
      <div className="flex w-full items-center justify-between">
        {title && <PageHeader title={title} count={count} />}
        {slot}
      </div>
    );
  }

  if (!title) {
    return null;
  }

  return (
    <div className="flex w-full items-center justify-between">
      <PageHeader title={title} count={count} />
      {actions}
    </div>
  );
}
