'use client';

import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BellIcon } from 'lucide-react';
import { notificationQueries } from '@/shared/lib/query/queryKeys';
import { fetchNotifications } from '@/shared/lib/api/fetchNotifications';
import { getRelativeTime } from '@/shared/lib/formatters';
import useOnClickOutside from '@/shared/hooks/useOnClickOutside';
import { useLanguage } from '@/shared/contexts/LanguageContext';

interface NotificationDropdownProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  isSidebarOpen: boolean;
  placement?: 'right' | 'bottom';
}

export default function NotificationDropdown({ isOpen, onOpen, onClose, isSidebarOpen, placement = 'right' }: NotificationDropdownProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery(notificationQueries.list());

  const { mutate: markAsRead } = useMutation({
    mutationFn: fetchNotifications.patchNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueries.list().queryKey });
    },
  });

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const hasUnread = unreadNotifications.length > 0;

  const handleMarkAllRead = async () => {
    try {
      await Promise.all(unreadNotifications.map((n) => fetchNotifications.patchNotificationRead(n.id)));
      queryClient.invalidateQueries({ queryKey: notificationQueries.list().queryKey });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const DROPDOWN_WIDTH = 320;
      if (placement === 'bottom') {
        setDropdownPos({ top: rect.bottom + 8, left: Math.max(8, rect.right - DROPDOWN_WIDTH) });
      } else {
        setDropdownPos({ top: rect.top, left: rect.right + 8 });
      }
    }
  }, [isOpen, placement]);

  useOnClickOutside([buttonRef, dropdownRef], onClose);

  return (
    <div>
      <button
        ref={buttonRef}
        onClick={() => (isOpen ? onClose() : onOpen())}
        className={`group hover:text-bearlog-600 relative text-gray-500 ${
          isSidebarOpen ? 'rounded-[999px] border border-gray-200 p-[20px] dark:border-gray-500 dark:bg-gray-850' : 'p-0'
        }`}
      >
        <BellIcon size={24} className="transition-transform group-hover:scale-110" />
        {hasUnread && (
          <div
            className={`bg-bearlog-500 absolute top-[2px] right-[5px] rounded-full ${isSidebarOpen ? 'h-3 w-3' : 'h-2 w-2'}`}
          />
        )}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
            className="fixed z-50 w-[320px] rounded-2xl border border-gray-100 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-base font-semibold text-gray-800">{t.notification.title}</span>
              {hasUnread && (
                <button onClick={handleMarkAllRead} className="text-bearlog-600 text-sm font-medium hover:underline">
                  {t.notification.markAllRead}
                </button>
              )}
            </div>

            <ul className="max-h-100 overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="px-5 py-8 text-center text-sm text-gray-400">{t.notification.empty}</li>
              ) : (
                notifications.map((notification) => (
                  <li
                    key={notification.id}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                    className={`flex cursor-pointer items-start gap-3 px-5 py-4 transition-colors hover:bg-gray-50 ${
                      !notification.isRead ? 'bg-gray-50/50' : ''
                    }`}
                  >
                    <div className="mt-2 shrink-0">
                      {!notification.isRead && <div className="bg-bearlog-500 h-2 w-2 rounded-full" />}
                      {notification.isRead && <div className="h-2 w-2" />}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="text-sm leading-snug text-gray-800">{notification.message}</p>
                      <span className="text-xs text-gray-400">{getRelativeTime(notification.createdAt)}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
