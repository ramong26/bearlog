'use client';

import clsx from 'clsx';
import { CheckIcon } from 'lucide-react';

import FormField from '@/shared/components/FormField';
import { useLanguage } from '@/shared/contexts/LanguageContext';

interface StatusFieldProps {
  done: boolean;
  onChange: (done: boolean) => void;
  errorMessage?: string;
}

export default function StatusField({ done, onChange, errorMessage }: StatusFieldProps) {
  const { t } = useLanguage();
  return (
    <FormField label={t.todo.statusLabel} required>
      <div className="flex gap-2">
        <StatusFieldItem label="TO DO" selected={!done} onChange={() => onChange(false)} />
        <StatusFieldItem label="DONE" selected={done} onChange={() => onChange(true)} />
      </div>
      {errorMessage && <p className="px-1 text-xs text-red-500">{errorMessage}</p>}
    </FormField>
  );
}

interface StatusFieldItemProps {
  label: 'TO DO' | 'DONE';
  selected: boolean;
  onChange: () => void;
}

function StatusFieldItem({ label, selected, onChange }: StatusFieldItemProps) {
  return (
    <button type="button" onClick={onChange} className="flex w-[76px] cursor-pointer items-center gap-[6px]">
      <div
        className={clsx(
          'flex size-[18px] shrink-0 items-center justify-center rounded-[6px] border',
          selected ? 'bg-bearlog-500 border-transparent' : 'border-gray-300 bg-white',
        )}
      >
        {selected && <CheckIcon size={12} className="stroke-white stroke-2" />}
      </div>
      <span className="text-sm font-medium text-gray-500">{label}</span>
    </button>
  );
}
