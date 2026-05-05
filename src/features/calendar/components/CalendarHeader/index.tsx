import { ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react';
import Dropdown from '@/shared/components/Dropdown';
import Image from 'next/image';
import { DropdownItemType } from '@/shared/types/types';

interface CalendarHeaderProps {
  goalId: number | undefined;
  goalFilterItems: DropdownItemType[];
  formattedYearMonth: string;
  onPrev: () => void;
  onNext: () => void;
  onGoalChange: (item: DropdownItemType) => void;
}

export default function CalendarHeader({
  goalId,
  goalFilterItems,
  formattedYearMonth,
  onPrev,
  onNext,
  onGoalChange,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-5 px-4 py-5 lg:flex-row lg:justify-between lg:px-8">
      <div className="flex items-center gap-4">
        <button onClick={onPrev} className="cursor-pointer rounded-full p-1 hover:bg-gray-100">
          <ChevronsLeftIcon size={20} className="text-gray-500" />
        </button>
        <span className="text-lg font-semibold text-gray-800 dark:text-white">{formattedYearMonth}</span>
        <button onClick={onNext} className="cursor-pointer rounded-full p-1 hover:bg-gray-100">
          <ChevronsRightIcon size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="w-full lg:max-w-[350px]">
        <Dropdown
          icon={<Image src="/image/goal-todo.png" width={32} height={32} alt="목표 이미지 아이콘" />}
          className="h-12 bg-gray-50 dark:border-[#585858]"
          items={goalFilterItems}
          selectedValue={goalId !== undefined ? String(goalId) : ''}
          onSelectItem={onGoalChange}
        />
      </div>
    </div>
  );
}
