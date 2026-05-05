'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { DropdownList } from '@/shared/components/Dropdown';
import useOnClickOutside from '@/shared/hooks/useOnClickOutside';
import { DropdownItemType } from '@/shared/types/types';

interface FavoriteTodoDropdownGoalProps {
  items: DropdownItemType[];
  selectedValue: string;
  onSelectItem: (item: DropdownItemType) => void;
  defaultValue?: string;
}

export default function FavoriteTodoDropdownGoal({
  items,
  selectedValue,
  onSelectItem,
  defaultValue,
}: FavoriteTodoDropdownGoalProps) {
  const [isToggleOpen, setIsToggleOpen] = useState(false);

  const selectedItem =
    items.find((item) => item.value === selectedValue) ?? items.find((item) => item.value === defaultValue);

  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref, () => {
    setIsToggleOpen(false);
  });

  const handleSelectItem = (item: DropdownItemType) => {
    onSelectItem(item);
    setIsToggleOpen(false);
  };

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsToggleOpen((prev) => !prev)}
        className={[
          'flex w-full items-center justify-between gap-2 self-stretch rounded-xl border bg-gray-50 dark:bg-gray-850 px-4 py-[10px] text-base font-medium md:py-3',
          (isToggleOpen || !!selectedValue)
            ? 'border-bearlog-500 rounded-2xl'
            : 'border-gray-100 dark:border-gray-900',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Image src="/image/goal-todo.png" alt="goal todo" width={32} height={32} />
          <span className="line-clamp-1 text-sm font-semibold text-[#1E293B] dark:text-white md:text-base">
            {selectedItem?.label ?? '선택해주세요'}
          </span>
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition-transform ${isToggleOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isToggleOpen && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1">
          <DropdownList className="w-full" items={items} onSelectItem={handleSelectItem} />
        </div>
      )}
    </div>
  );
}
