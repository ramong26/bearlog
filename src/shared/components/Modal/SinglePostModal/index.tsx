import { useRef } from 'react';
import { XIcon } from 'lucide-react';

import Button from '../../Button';
import Input from '../../Input';

import { useModalStore } from '@/shared/stores/useModalStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';

interface SinglePostModalProps {
  title?: string;
  placeholder?: string;
  defaultValue?: string;
  inputType?: 'text' | 'email' | 'url';
  onConfirm: (value: string) => void;
}

export default function SinglePostModal({
  title,
  placeholder,
  defaultValue = '',
  inputType = 'url',
  onConfirm,
}: SinglePostModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { closeModal } = useModalStore();
  const { t } = useLanguage();
  const resolvedTitle = title ?? t.modal.linkTitle;
  const resolvedPlaceholder = placeholder ?? t.modal.linkPlaceholder;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputRef.current) {
        onConfirm(inputRef.current.value);
      }
      closeModal();
    }
  };
  return (
    <div className="w-85.75 rounded-3xl bg-white dark:bg-gray-850 p-4 shadow-[0px_0px_60px_0px_rgba(0,0,0,0.05)] md:w-114 md:rounded-[40px] md:p-8">
      <div className="flex flex-col">
        <div className="mb-6 flex w-full items-center justify-between self-stretch md:mb-8">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white md:text-xl">{resolvedTitle}</h2>
          <XIcon className="cursor-pointer text-slate-400" size={24} onClick={closeModal} />
        </div>

        <Input
          type={inputType}
          ref={inputRef}
          defaultValue={defaultValue}
          placeholder={resolvedPlaceholder}
          className="mb-6 w-full rounded-xl border border-slate-300 dark:border-[#555555] bg-white dark:bg-gray-850 px-4 py-3 text-sm text-slate-700 dark:text-white placeholder:text-sm placeholder:text-slate-500 dark:placeholder:text-gray-400 focus:outline-none md:text-base md:placeholder:text-base"
          onKeyDown={handleKeyDown}
          aria-label={resolvedPlaceholder}
        />

        <Button
          variant="primary"
          className="px-[18px] py-[10px] text-sm font-semibold dark:text-gray-850 md:py-[14px] md:text-[18px]"
          onClick={() => {
            if (inputRef.current) {
              onConfirm(inputRef.current.value);
            }
            closeModal();
          }}
        >
          {t.modal.confirm}
        </Button>
      </div>
    </div>
  );
}
