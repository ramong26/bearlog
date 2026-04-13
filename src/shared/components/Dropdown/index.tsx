'use client';

import useOnClickOutside from '@/shared/hooks/useOnClickOutside';
import { DropdownItemType } from '@/shared/types/types';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Dropdown
 *
 * 선택 가능한 드롭다운 컴포넌트
 *
 * @example 기본 사용법
 * const [selectedValue, setSelectedValue] = useState('');
 *
 * <Dropdown
 *   items={[
 *     { label: '자바스크립트로 웹 서비스 만들기', value: '1' },
 *     { label: '디자인 시스템 정복하기', value: '2' },
 *   ]}
 *   selectedValue={selectedValue}
 *   onSelectItem={(item) => setSelectedValue(item.value)}
 * />
 *
 * @important 반드시 value 기준으로 초기값 설정
 * const [selectedValue, setSelectedValue] = useState('1');
 *
 * @param items - 드롭다운 목록 ({ label: 표시될 텍스트, value: 실제 값 })
 * @param selectedValue - 현재 선택된 항목의 value
 * @param onSelectItem - 항목 선택 시 실행할 콜백 (item 전체를 인자로 받음)
 * @param isDisabled - 비활성화 여부 (기본값: false)
 * @param className - 추가 스타일 클래스
 */
export const dropdownVariants = cva(
  'rounded-xl border border-[#CCC] bg-[#FFF] flex p-4 items-center gap-2 self-stretch text-base font-medium justify-between',
  {
    variants: {
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: 'cursor-pointer',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
);

interface DropdownProps extends React.HTMLAttributes<HTMLButtonElement> {
  items: DropdownItemType[];
  selectedValue: string;
  onSelectItem: (item: DropdownItemType) => void;
  isDisabled?: boolean;
  className?: string;
  defaultValue?: string;
  icon?: React.ReactNode;
  placeholder?: string;
}

function Dropdown({
  items,
  selectedValue,
  onSelectItem,
  isDisabled,
  className,
  defaultValue,
  icon,
  placeholder,
}: DropdownProps) {
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const selectedItem =
    items.find((item) => item.value === selectedValue) || items.find((item) => item.value === defaultValue);

  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setIsToggleOpen(false));

  const handleSelectItem = (item: DropdownItemType) => {
    onSelectItem(item);
    setIsToggleOpen(false);
  };

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsToggleOpen(!isToggleOpen)}
        className={twMerge(
          dropdownVariants({ disabled: isDisabled }),
          'flex w-full items-center gap-2',
          isToggleOpen ? 'border-bearlog-500 rounded-2xl border' : "border-gray-100",
          className,
        )}
        disabled={isDisabled}
      >
        <div className="flex items-center justify-center gap-2">
          {icon}
          <span
            className={clsx(
              'line-clamp-1 text-sm font-normal md:text-base',
              selectedItem ? 'text-gray-700' : 'text-[#838383]',
            )}
          >
            {selectedItem?.label ?? placeholder}
          </span>
        </div>
        {/* //TODO 선택된 아이템 표시 */}
        <ChevronDown size={16} className="text-gray-400 dark:text-white" />
      </button>
      <div className="absolute top-full right-0 left-0 z-50 mt-1">
        {isToggleOpen && <DropdownList className="w-full" items={items} onSelectItem={handleSelectItem} />}
      </div>
    </div>
  );
}

/**
 * DropdownList
 */
interface DropdownListProps extends React.HTMLAttributes<HTMLDivElement> {
  items: DropdownItemType[];
  onSelectItem: (item: DropdownItemType) => void;
}

export function DropdownList({ items, onSelectItem, className }: DropdownListProps) {
  return (
    <div
      className={twMerge(
        clsx('w-full max-h-50 overflow-y-auto rounded-2xl shadow-[0px_4px_16px_-2px_rgba(0,0,0,0.1)]', className),
      )}
    >
      {items.map((item) => (
        <DropdownItem key={item.value} item={item} onSelectItem={onSelectItem} />
      ))}
    </div>
  );
}

/**
 * DropdownItem
 */
interface DropdownItemProps {
  item: DropdownItemType;
  onSelectItem: (item: DropdownItemType) => void;
}

export function DropdownItem({ item, onSelectItem }: DropdownItemProps) {
  return (
    <div className="flex w-full bg-white p-1.5">
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onSelectItem(item);
        }}
        className={twMerge(clsx('flex w-full cursor-pointer'))}
      >
        <div className={twMerge(clsx('hover:bg-bearlog-500/20 w-full rounded-xl p-2 text-left'))}>
          <span className="text-sm leading-6 font-medium tracking-[-0.48px] text-[#333] md:text-base">
            {item.label}
          </span>
        </div>
      </button>
    </div>
  );
}

export default Dropdown;
