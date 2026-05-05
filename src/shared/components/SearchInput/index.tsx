'use client';

import { useCallback } from 'react';
import { SearchIcon } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  placeholder?: string;
  onIconClick?: () => void;
  ref?: React.Ref<HTMLInputElement>;
}

export default function SearchInput({ placeholder, className, onIconClick, ref, ...props }: SearchInputProps) {
  const handleIconClick = useCallback(() => {
    if (onIconClick) {
      onIconClick();
      return;
    }

    if (ref && typeof ref !== 'function') {
      ref.current?.focus();
    }
  }, [onIconClick, ref]);

  return (
    <div
      className={`flex items-center gap-2 rounded-[999px] border-[1px] border-[#A4A4A4] bg-white dark:bg-gray-850 dark:border-gray-500 px-4 py-2 ${className ?? ''}`}
    >
      <input
        type="text"
        placeholder={placeholder}
        className="w-full border-none bg-transparent text-sm font-medium text-[#404040] outline-none placeholder:text-[#A4A4A4] focus:ring-0"
        ref={ref}
        {...props}
      />
      <SearchIcon size={20} className="text-[#A4A4A4]" onClick={handleIconClick} />
    </div>
  );
}
