'use client';

import { DropdownList } from '@/shared/components/Dropdown';
import { DropdownItemType } from '@/shared/types/types';
import useOnClickOutside from '@/shared/hooks/useOnClickOutside';
import { ListFilterIcon } from 'lucide-react';
import { useRef, useState } from 'react';

interface FilterButtonProps {
  items: DropdownItemType[];
  value: string;
  onValueChange: (value: string) => void;
}

const FilterButton = ({ items, value, onValueChange }: FilterButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref, () => setIsOpen(false));

  const selectedLabel = items.find((item) => item.value === value)?.label;

  return (
    <div ref={ref} className="relative flex">
      <button className="flex w-20 cursor-pointer items-center gap-1" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-sm font-medium text-[#737373]">{selectedLabel}</span>
        <ListFilterIcon size={20} className="text-[#737373]" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-10 text-nowrap">
          <DropdownList
            items={items}
            onSelectItem={(item) => {
              onValueChange(item.value);
              setIsOpen(false);
            }}
            className="w-[102px]"
          />
        </div>
      )}
    </div>
  );
};

export default FilterButton;
