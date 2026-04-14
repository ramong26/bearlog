'use client';

import useOnClickOutside from '@/shared/hooks/useOnClickOutside';
import { EllipsisVertical } from 'lucide-react';
import { useRef, useState } from 'react';
import { DropdownList } from '@/shared/components/Dropdown';
import { DropdownItemType } from '@/shared/types/types';
import { useModalStore } from '@/shared/stores/useModalStore';
import { PopupModal } from '@/shared/components/Modal/PopupModal';
import { useDeleteNote } from '@/shared/lib/query/mutations';

interface EllipsisButtonProps {
  items: DropdownItemType[];
  noteId: number;
  goalId: number;
}

export default function EllipsisButton({ items, noteId, goalId }: EllipsisButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { openModal } = useModalStore();

  const { mutate: handleDelete } = useDeleteNote(noteId, goalId);

  useOnClickOutside(ref, () => setIsOpen(false));

  const handleSelectItem = (value: string) => {
    if (value === 'edit') {
      window.location.href = `/goal/${goalId}/note/${noteId}/edit`;
    }
    if (value === 'delete') {
      openModal(<PopupModal variant={{ type: 'noteDelete' }} onConfirm={() => handleDelete()} />);
    }
  };

  return (
    <div ref={ref} className="relative flex">
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="cursor-pointer"
      >
        <EllipsisVertical size={16} className="stroke-[#A4A4A4] md:h-6 md:w-6" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-10 text-nowrap" onClick={(e) => e.stopPropagation()}>
          <DropdownList
            items={items}
            onSelectItem={(item) => {
              handleSelectItem(item.value);
              setIsOpen(false);
            }}
            className="w-[102px]"
          />
        </div>
      )}
    </div>
  );
}
