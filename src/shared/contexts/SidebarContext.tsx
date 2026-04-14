'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { LayoutGridIcon, FlagIcon, ListCheckIcon, StarIcon } from 'lucide-react';

import { goalQueries } from '@/shared/lib/query/queryKeys';
import type { GoalListResponse } from '@/shared/lib/api/fetchGoals';
import { useBreakpoint } from '@/shared/hooks/useBreakPoint';
import Image from 'next/image';
import { useLanguage } from '@/shared/contexts/LanguageContext';

const sidebarMenuIconClassName = 'h-6 w-6 transition-all [&_*]:fill-current [&_*]:stroke-current';
interface MenuBase {
  icon?: React.ReactNode;
  name: string;
}
interface SubMenu extends MenuBase {
  href: string;
}
export interface MenuItem extends MenuBase {
  href: string;
  subMenus?: SubMenu[];
}

interface SidebarContextType {
  toggle: () => void;
  menus: MenuItem[];
  goals: GoalListResponse['goals'];
}

const SidebarOpenContext = createContext<boolean | undefined>(undefined);
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);
const SidebarMenuContext = createContext<MenuItem | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const breakpoint = useBreakpoint();
  const [manualIsOpen, setManualIsOpen] = useState<boolean | null>(null);
  const isOpen = manualIsOpen ?? breakpoint === 'desktop';
  const pathname = usePathname();
  const { t } = useLanguage();

  const { data: goals } = useQuery(goalQueries.list());
  const goalData = useMemo(() => goals?.goals ?? [], [goals]);

  const allMenus = useMemo<MenuItem[]>(() => {
    return [
      {
        icon: <LayoutGridIcon className={sidebarMenuIconClassName} />,
        name: t.sidebar.dashboard,
        href: '/dashboard',
      },
      {
        icon: <FlagIcon className={sidebarMenuIconClassName} />,
        name: t.sidebar.goal,
        href: '/goal',
        subMenus: goalData.map((goal) => ({
          name: goal.title ?? '',
          href: `/goal/${goal.id}`,
        })),
      },
      {
        icon: <ListCheckIcon className={sidebarMenuIconClassName} />,
        name: t.sidebar.todo,
        href: '/dashboard/all-todo',
      },
      {
        icon: (
          <Image
            src={'/image/calendar.png'}
            alt="Calendar Icon"
            width={18}
            height={18}
            className={sidebarMenuIconClassName}
          />
        ),
        name: t.sidebar.calendar,
        href: '/calendar',
      },
      {
        icon: <StarIcon className={sidebarMenuIconClassName} />,
        name: t.sidebar.favoriteTodo,
        href: '/dashboard/favorite-todo',
      },
    ];
  }, [goalData, t]);

  const sidebar = useMemo<SidebarContextType>(() => {
    return {
      toggle: () => setManualIsOpen((prev) => !(prev ?? breakpoint === 'desktop')),
      menus: allMenus,
      goals: goalData,
    };
  }, [allMenus, breakpoint, goalData]);

  const currentMenu = useMemo(() => {
    return (
      allMenus.find((menu) => menu.href === pathname || menu.subMenus?.some((subMenu) => subMenu.href === pathname)) ||
      null
    );
  }, [allMenus, pathname]);

  return (
    <SidebarOpenContext.Provider value={isOpen}>
      <SidebarContext.Provider value={sidebar}>
        <SidebarMenuContext.Provider value={currentMenu}>{children}</SidebarMenuContext.Provider>
      </SidebarContext.Provider>
    </SidebarOpenContext.Provider>
  );
}

export function useSidebarOpen() {
  const context = useContext(SidebarOpenContext);
  if (context === undefined) throw new Error('useSidebarOpen must be used within SidebarProvider');
  return context;
}
export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebarContext must be used within SidebarProvider');
  return context;
}
export function useSidebarMenu() {
  const context = useContext(SidebarMenuContext);
  if (!context) throw new Error('useSidebarMenu must be used within SidebarProvider');
  return context;
}
