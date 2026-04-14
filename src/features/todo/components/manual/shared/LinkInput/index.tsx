'use client';

import { Link2, XIcon } from 'lucide-react';
import { useRef } from 'react';
import { useLanguage } from '@/shared/contexts/LanguageContext';

interface LinkInputPros {
  value: string;
  onChange: (value: string) => void;
}

export default function LinkInput({ value, onChange }: LinkInputPros) {
  const urlInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  return (
    <div className="flex h-11 w-full items-center justify-between rounded-xl border border-dashed border-[#CCC] bg-[#FAFAFA] p-3 md:h-14 md:rounded-2xl md:p-4">
      <div className="flex flex-1 items-center gap-2">
        <Link2 size={20} className="shrink-0 -rotate-45 stroke-[#737373] md:h-6 md:w-6" />
        <input
          ref={urlInputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.todo.linkPlaceholder}
          className="w-full flex-1 border-none bg-transparent p-0 text-sm text-[#333] placeholder:text-[#737373] focus:outline-none md:text-base"
        />
      </div>
      {/* 링크 입력 후 삭제 버튼 */}
      {value && (
        <button
          type="button"
          className="cursor-pointer"
          onClick={() => {
            onChange('');
            urlInputRef.current?.focus();
          }}
        >
          <XIcon size={20} className="shrink-0 stroke-[#737373] md:h-6 md:w-6" />
        </button>
      )}
    </div>
  );
}
