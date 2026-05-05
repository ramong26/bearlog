'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CopyCheckIcon, FlagIcon, LogOutIcon, MenuIcon, SettingsIcon, XIcon } from 'lucide-react';
import { Accordion } from 'radix-ui';

import { SettingsModal } from '../../Modal/SettingsModal';
import SinglePostModal from '../../Modal/SinglePostModal';
import SidebarMobileCase from '../SidebarMobileCase';

import { usePostGoal, usePostLogout } from '@/shared/lib/query/mutations';
import { useTodoCreateModal } from '@/features/todo/hooks/useTodoCreateModal';
import { useGithubTodoCreateModal } from '@/features/todo/hooks/useGithubTodoCreateModal';
import { useSidebarContext } from '@/shared/contexts/SidebarContext';
import { useModalStore } from '@/shared/stores/useModalStore';
import { getSelectedGoalId, isMenuActive, SidebarMenuEntry } from '..';
import { CurrentUserResponse } from '@/shared/lib/api';
import { useTodoModeStore } from '@/shared/stores/useTodoModeStore';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';

const CLOSETIME = 300;

// 모바일일 때 렌더링 되는 사이드바 컴포넌트
interface SidebarMobileProps {
  user: CurrentUserResponse | undefined;
}
export default function SidebarMobile({ user }: SidebarMobileProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuMounted, setMobileMenuMounted] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { mutate } = usePostGoal();
  const { mutate: logout } = usePostLogout();
  const { openTodoCreateModal } = useTodoCreateModal();
  const { openGithubTodoCreateModal } = useGithubTodoCreateModal();
  const pathname = usePathname();
  const { menus, goals } = useSidebarContext();
  const { openModal } = useModalStore();
  const selectedGoalId = getSelectedGoalId(pathname, goals);
  const mode = useTodoModeStore((state) => state.mode);
  const { showToast } = useToastStore();
  const { t } = useLanguage();

  const openMobileMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setMobileMenuMounted(true);
    requestAnimationFrame(() => setMobileMenuOpen(true));
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);

    closeTimeoutRef.current = setTimeout(() => {
      setMobileMenuMounted(false);
      closeTimeoutRef.current = null;
    }, CLOSETIME);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="flex items-center gap-3 border-b-2 border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
        <button onClick={openMobileMenu} className="cursor-pointer transition-colors hover:text-gray-600">
          <MenuIcon size={24} className="text-gray-500" />
        </button>
        <SidebarMobileCase user={user} />
      </div>

      {/* Mobile Menu Modal */}
      {mobileMenuMounted && (
        <>
          {/* Overlay */}
          <button
            type="button"
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
              mobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMobileMenu}
            aria-label="Close menu"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex w-full items-center justify-center overflow-hidden">
            <div
              className={`h-full w-full overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-gray-800 ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col gap-6 p-6">
                <div className="flex w-full justify-end">
                  <button onClick={closeMobileMenu} className="w-fit cursor-pointer text-gray-400 hover:text-gray-600">
                    <XIcon size={24} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 rounded-2xl shadow-[0_3px_20px_rgba(0,200,127,0.35)]">
                    <Image priority src="/image/bearlog-icon.png" alt="Logo" fill className="object-contain" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Bearlog</h2>
                </div>
              </div>

              {/* Menu Items */}
              <div className="px-4 py-6">
                <Accordion.Root
                  type="multiple"
                  defaultValue={menus.filter((menu) => isMenuActive(menu, pathname)).map((menu) => menu.name)}
                  className="flex flex-col gap-2"
                >
                  {menus.map((menu) => (
                    <SidebarMenuEntry key={menu.name} menu={menu} pathname={pathname} onClose={closeMobileMenu} />
                  ))}
                </Accordion.Root>

                {/* Settings & Logout */}
                <div className="mt-6 pt-4">
                  <button
                    onClick={() => {
                      openModal(<SettingsModal />);
                      closeMobileMenu();
                    }}
                    className="dark:hover:bg-gray-750 flex w-full items-center justify-start gap-3 rounded-lg px-3 py-3 transition-all hover:bg-gray-50"
                  >
                    <SettingsIcon color="#BBBBBB" size={20} />
                    <span className="text-lg font-semibold text-gray-500 dark:text-gray-300">{t.sidebar.settings}</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="dark:hover:bg-gray-750 flex w-full items-center justify-start gap-3 rounded-lg px-3 py-3 transition-all hover:bg-gray-50"
                  >
                    <LogOutIcon color="#BBBBBB" size={20} />
                    <span className="text-lg font-semibold text-gray-500 dark:text-gray-300">{t.sidebar.logout}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (mode === 'MANUAL') {
                        openModal(
                          <SinglePostModal
                            title={t.sidebar.newGoalTitle}
                            placeholder={t.sidebar.newGoalPlaceholder}
                            onConfirm={(title) => mutate({ title })}
                          />,
                        );
                        closeMobileMenu();
                      } else {
                        showToast(t.sidebar.developerModeAlert, 'fail');
                      }
                    }}
                    className="group bg-bearlog-500 flex flex-1 items-center justify-center gap-1 rounded-full py-3 transition-all hover:shadow-lg"
                  >
                    <FlagIcon className="dark:text-gray-850 h-6 w-6 text-white transition-transform group-hover:scale-110" />
                    <span className="dark:text-gray-850 text-base font-semibold text-white">새 목표</span>
                  </button>
                  <button
                    onClick={() => {
                      if (goals.length === 0 || !selectedGoalId) {
                        showToast(t.dashboard.noGoal, 'fail');
                        return;
                      }
                      if (!selectedGoalId) return;
                      const selectedGoal = goals.find((goal) => goal.id === selectedGoalId);
                      if (!selectedGoal) return;
                      if (selectedGoal.source === 'GITHUB') {
                        openGithubTodoCreateModal({
                          goalId: selectedGoalId,
                          goalTitle: selectedGoal.title ?? '',
                        });
                      } else {
                        openTodoCreateModal({
                          goalDetailId: selectedGoalId,
                          todo: {
                            title: '',
                            goalId: selectedGoalId,
                            dueDate: undefined,
                            linkUrl: undefined,
                            imageUrl: undefined,
                            tags: [],
                          },
                        });
                      }
                      closeMobileMenu();
                    }}
                    aria-disabled={!selectedGoalId}
                    className={`group border-bearlog-500 flex flex-1 items-center justify-center gap-1 rounded-full border bg-white py-3 transition-all hover:shadow-lg dark:bg-gray-700 ${
                      !selectedGoalId ? 'opacity-50' : ''
                    }`}
                  >
                    <CopyCheckIcon color="#00C87F" className="h-6 w-6 transition-transform group-hover:scale-110" />
                    <span className="text-bearlog-600 dark:text-bearlog-500 text-base font-semibold">새 할일</span>
                  </button>
                </div>
              </div>

              {/* Profile */}
              <div className="p-4">
                <Link
                  href="/mypage"
                  onClick={closeMobileMenu}
                  className="dark:bg-gray-850 flex items-center gap-3 rounded-full border border-gray-200 px-4 py-2 dark:border-gray-500"
                >
                  <Image
                    src={user?.profileImageUrl || '/image/default-profile.png'}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-gray-800">{user?.nickname}</p>
                    <p className="truncate text-xs text-gray-400">{user?.email}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
