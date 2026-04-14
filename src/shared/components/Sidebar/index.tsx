'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronsRightIcon,
  SettingsIcon,
  LogOutIcon,
  FlagIcon,
  CopyCheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { Accordion } from 'radix-ui';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import SinglePostModal from '../Modal/SinglePostModal';
import { SettingsModal } from '../Modal/SettingsModal';
import NotificationDropdown from './NotificationDropdown';
import SidebarMobile from './SidebarMobileDrawer';

import { useSidebarContext, useSidebarOpen, MenuItem } from '@/shared/contexts/SidebarContext';
import { useBreakpoint } from '@/shared/hooks/useBreakPoint';
import { useModalStore } from '@/shared/stores/useModalStore';
import { usePostGoal, usePostLogout } from '@/shared/lib/query/mutations';
import { useTodoCreateModal } from '@/features/todo/hooks/useTodoCreateModal';
import { userQueries } from '@/shared/lib/query/queryKeys';
import { CurrentUserResponse } from '@/shared/lib/api';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTodoModeStore } from '@/shared/stores/useTodoModeStore';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useGithubTodoCreateModal } from '@/features/todo/hooks/useGithubTodoCreateModal';

// TODO: 전체적으로 정리필요
export default function Sidebar() {
  const breakpoint = useBreakpoint();
  const isTablet = breakpoint === 'tablet';
  const isMobile = breakpoint === 'mobile';

  const { data: user } = useQuery(userQueries.current());

  if (breakpoint === null) return null;

  if (isMobile) return <SidebarMobile user={user} />;
  else return <SidebarDesktopTablet user={user} isTablet={isTablet} />;
}

interface SidebarDesktopTabletProps {
  user: CurrentUserResponse | undefined;
  isTablet: boolean;
}
function SidebarDesktopTablet({ user, isTablet }: SidebarDesktopTabletProps) {
  const { openModal } = useModalStore();
  const { toggle, menus, goals } = useSidebarContext();
  const isOpen = useSidebarOpen();
  const pathname = usePathname();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { t } = useLanguage();
  const { showToast } = useToastStore();
  const mode = useTodoModeStore((state) => state.mode);

  const { mutate } = usePostGoal();
  const { mutate: logout } = usePostLogout();

  const { openTodoCreateModal } = useTodoCreateModal();
  const { openGithubTodoCreateModal } = useGithubTodoCreateModal();

  const selectedGoalId = getSelectedGoalId(pathname, goals, mode);

  const handleAddTodo = () => {
    if (!selectedGoalId) return;

    const selectedGoal = goals.find((goal) => goal.id === selectedGoalId);
    if (!selectedGoal) return;

    const isGithubGoal = selectedGoal.source === 'GITHUB';

    if (isGithubGoal) {
      openGithubTodoCreateModal({
        goalId: selectedGoalId,
        goalTitle: selectedGoal.title,
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
  };

  return (
    <>
      {isTablet && isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/40"
          onClick={toggle}
        />
      )}
      <div
        className={clsx(
          'flex flex-col rounded-tr-[32px] rounded-br-[32px] bg-white dark:bg-gray-800 transition-all duration-300',
          isOpen ? 'p-4' : 'min-w-[80px] gap-8 px-6 py-8',
          isOpen &&
            (isTablet
              ? 'fixed top-0 left-0 z-50 h-full w-[320px] shadow-2xl'
              : 'gap-[80px] lg:min-w-[362px] lg:gap-[140px] lg:p-8'),
        )}
      >
        <div className={`flex flex-col justify-center gap-4 lg:gap-8 ${isOpen ? 'items-end' : 'w-fit items-center'}`}>
          <button
            onClick={toggle}
            className="cursor-pointer transition-colors hover:text-gray-600"
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={isOpen}
          >
            <ChevronsRightIcon
              size={32}
              color="#cccccc"
              className={`${isOpen ? 'rotate-180' : ''} transition-transform duration-300`}
            />
          </button>

          <Link
            href="/dashboard"
            className={`flex items-center ${isOpen ? 'w-full gap-4 pr-[22px] pl-2' : 'w-fit gap-0 p-0'}`}
          >
            <div
              className={`relative shrink-0 ${isOpen ? 'h-12 w-12' : 'h-8 w-8'} rounded-2xl shadow-[0_3px_20px_rgba(0,200,127,0.35)]`}
            >
              {/* TODO: 해당 로고 바뀌면 교체 필요 */}
              <Image
                priority
                src={'/image/bearlog-icon.png'}
                alt="Logo"
                fill
                className={`object-contain ${isOpen ? 'h-12 w-12' : 'h-8 w-8'}`}
              />
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                isOpen ? 'max-w-[220px] opacity-100' : 'max-w-0 opacity-0'
              }`}
              aria-hidden={!isOpen}
            >
              <h2 className="pl-1 text-2xl leading-[42px] font-semibold whitespace-nowrap text-gray-800 dark:text-white lg:text-3xl">
                Bearlog
              </h2>
            </div>
          </Link>

          <div className={`flex w-full flex-col gap-6 transition-all duration-300 ${isOpen ? 'block' : 'hidden'}`}>
            <Accordion.Root
              type="multiple"
              defaultValue={menus.filter((menu) => isMenuActive(menu, pathname)).map((menu) => menu.name)}
              className="flex flex-col gap-3"
            >
              {menus.map((menu) => (
                <SidebarMenuEntry key={menu.name} menu={menu} pathname={pathname} />
              ))}
            </Accordion.Root>

            <div className="flex w-full flex-col gap-3">
              <button
                onClick={() => openModal(<SettingsModal />)}
                className="flex h-14 items-center justify-start gap-[10px] rounded-[20px] bg-white px-[14px] py-[10px] transition-all duration-100 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-750"
              >
                <SettingsIcon color="#BBBBBB" size={24} />
                <span className="text-lg font-semibold text-gray-500 dark:text-gray-500">{t.sidebar.settings}</span>
              </button>
              <button
                onClick={() => logout()}
                className="flex h-14 items-center justify-start gap-[10px] rounded-[20px] bg-white px-[14px] py-[10px] transition-all duration-100 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-750"
              >
                <LogOutIcon color="#BBBBBB" size={24} />
                <span className="text-lg font-semibold text-gray-500 dark:text-gray-500">{t.sidebar.logout}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 transition-all duration-300">
          <div className={`w-full gap-4 ${isOpen ? 'flex' : 'hidden'}`}>
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
                } else {
                  showToast(t.sidebar.developerModeAlert, 'fail');
                }
              }}
              className="group bg-bearlog-500 flex w-full flex-col items-center justify-center gap-2 rounded-[32px] px-2 py-4 transition-all duration-200 hover:shadow-lg lg:px-[22.5px] lg:py-8"
            >
              <FlagIcon
                className="h-8 w-8 text-white dark:text-gray-850 transition-transform group-hover:scale-110 lg:h-10 lg:w-10"
                size={40}
              />
              <span className="text-md cursor-pointer font-semibold text-[#ffffff] dark:text-gray-850 transition-all group-hover:font-bold lg:text-lg">
                {t.sidebar.newGoal}
              </span>
            </button>
            <button
              onClick={handleAddTodo}
              disabled={!selectedGoalId}
              className="group border-bearlog-500 flex w-full flex-col items-center justify-center gap-2 rounded-[32px] border bg-[#ffffff] px-2 py-4 transition-all duration-200 hover:shadow-lg dark:bg-gray-700 lg:px-[22.5px] lg:py-8"
            >
              <CopyCheckIcon
                color="#00C87F"
                className="h-8 w-8 transition-transform group-hover:scale-110 lg:h-10 lg:w-10"
                size={40}
              />
              <span className="text-md text-bearlog-600 dark:text-bearlog-500 cursor-pointer font-semibold transition-all group-hover:font-bold lg:text-lg">
                {t.sidebar.newTodo}
              </span>
            </button>
          </div>

          <div className="flex w-full justify-between gap-2">
            <Link
              href="/mypage"
              className={`w-full items-center justify-start gap-[8px] rounded-[999px] border border-gray-200 px-[20px] py-[12px] dark:border-gray-500 dark:bg-gray-850 lg:pr-[42px] lg:pl-[12px] ${isOpen ? 'flex' : 'hidden'}`}
            >
              <Image
                src={user?.profileImageUrl || '/image/default-profile.png'}
                alt="Character Profile Image"
                width={38}
                height={38}
                className="rounded-full object-cover"
              />
              <div className="flex flex-col items-start">
                <div className="flex items-center justify-center">
                  <span className="w-15 truncate text-sm font-medium dark:text-gray-300 lg:w-full">{user?.nickname}</span>
                  <ChevronRightIcon size={16} color="#A0A0A0" className="hidden lg:block" />
                </div>
                <span className="hidden w-35 truncate text-sm font-medium text-[#A0A0A0] lg:block">{user?.email}</span>
              </div>
            </Link>

            <NotificationDropdown
              isOpen={notificationOpen}
              onClose={() => setNotificationOpen(false)}
              isSidebarOpen={isOpen}
              onOpen={() => setNotificationOpen(true)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export function isMenuActive(menu: MenuItem, pathname: string) {
  return menu.href === pathname || menu.subMenus?.some((subMenu) => subMenu.href === pathname);
}

export function getSelectedGoalId(pathname: string, goals: { id?: number; source?: string }[], mode?: string) {
  const pathnameGoalId = pathname.startsWith('/goal/') ? Number(pathname.split('/')[2]) : undefined;
  if (pathnameGoalId) {
    return goals.find((goal) => goal.id === pathnameGoalId)?.id;
  }
  // 특정 goal 페이지가 아닐 때는 현재 mode에 맞는 첫 번째 goal을 우선 선택
  const modeSource = mode === 'GITHUB' ? 'GITHUB' : 'MANUAL';
  return goals.find((g) => g.source === modeSource)?.id ?? goals[0]?.id;
}

export function SidebarMenuEntry({
  menu,
  pathname,
  onClose,
}: {
  menu: MenuItem;
  pathname: string;
  onClose?: () => void;
}) {
  const isActive = isMenuActive(menu, pathname);

  if (!menu.subMenus?.length) {
    return (
      <Link
        href={menu.href}
        onClick={onClose}
        className="group flex h-14 w-full items-center justify-start gap-[8px] rounded-[20px] bg-white px-[12px] py-[10px] transition-all duration-200 dark:bg-gray-700 lg:px-[16px] lg:py-[14px]"
      >
        <span
          className={`transition-all duration-200 ${
            isActive ? 'text-[#008354] transition-all' : 'text-gray-300 transition-all group-hover:text-[#339C76]'
          }`}
        >
          {menu.icon}
        </span>
        <span
          className={`text-lg transition-all ${isActive ? 'font-bold text-[#339C76]' : 'font-semibold text-gray-700 dark:text-gray-300 group-hover:font-bold group-hover:text-[#339C76]'}`}
        >
          {menu.name}
        </span>
      </Link>
    );
  }

  return (
    <Accordion.Item value={menu.name} className="flex w-full flex-col data-[state=open]:gap-2">
      <AccordionTrigger menu={menu} isActive={isActive} />
      <Accordion.Content
        forceMount
        className="group/submenu grid w-full overflow-hidden transition-[grid-template-rows] duration-300 ease-out data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]"
      >
        <div className="min-h-0">
          <div className="transition-all duration-300 ease-out group-data-[state=closed]/submenu:-translate-y-1.5 group-data-[state=closed]/submenu:opacity-0 group-data-[state=open]/submenu:translate-y-0 group-data-[state=open]/submenu:opacity-100">
            {menu.subMenus.map((subMenu) => {
              const isSubMenuActive = subMenu.href === pathname;
              return (
                <Link
                  key={subMenu.href}
                  href={subMenu.href}
                  onClick={onClose}
                  className={`group flex w-[calc(100%-1rem)] items-center justify-start gap-2 rounded-[20px] px-4 py-1 transition-all duration-200 hover:bg-[#F2FBF7] lg:px-6 lg:py-2 ${
                    isSubMenuActive ? 'bg-[#F2FBF7]' : ''
                  }`}
                >
                  <span
                    className={`text-sm transition-all ${
                      isSubMenuActive
                        ? 'font-bold text-[#339C76]'
                        : 'font-semibold text-gray-700 dark:text-gray-300 group-hover:text-[#339C76]'
                    }`}
                  >
                    {subMenu.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

interface AccordionTriggerProps extends React.ComponentPropsWithoutRef<'button'> {
  menu: MenuItem;
  isActive: boolean | undefined;
}
function AccordionTrigger({ children, menu, isActive, ...props }: AccordionTriggerProps) {
  return (
    <Accordion.Trigger
      {...props}
      className={`group flex h-14 w-full items-center justify-start gap-[8px] rounded-[20px] bg-white px-[12px] py-[10px] transition-all duration-200 dark:bg-gray-700 lg:px-[16px] lg:py-[14px]`}
    >
      <span className={isActive ? 'text-[#339C76]' : 'text-gray-300 group-hover:text-[#339C76]'}>{menu.icon}</span>
      <span
        className={`text-lg font-semibold transition-all ${isActive ? 'font-bold text-[#339C76]' : 'text-gray-700 dark:text-gray-300 group-hover:font-bold group-hover:text-[#339C76]'}`}
      >
        {menu.name}
      </span>
      {children}
      <span className="relative ml-auto flex items-center justify-center text-[#A0A0A0]">
        <ChevronDownIcon
          size={24}
          className="accordion-chevron-down absolute transition-all duration-200 ease-out group-data-[state=open]:-rotate-180 group-data-[state=open]:opacity-0"
          aria-hidden
        />
        <ChevronUpIcon
          size={24}
          className="accordion-chevron-up absolute rotate-180 opacity-0 transition-all duration-200 ease-out group-data-[state=open]:rotate-0 group-data-[state=open]:opacity-100"
          aria-hidden
        />
      </span>
    </Accordion.Trigger>
  );
}
