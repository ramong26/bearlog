'use client';

import { XIcon } from 'lucide-react';
import { useLanguage } from '@/shared/contexts/LanguageContext';

interface DraftNoteToastProps {
  onLoad: () => void;
  onClose: () => void;
}

export default function DraftNoteToast({ onLoad, onClose }: DraftNoteToastProps) {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 md:absolute md:top-13 md:-translate-x-[80%]">
      <div className="relative">
        <div
          className="absolute -top-[8px] right-5 h-0 w-0"
          style={{
            borderLeft: '10px solid transparent',
            borderRight: '0px solid transparent',
            borderBottom: '10px solid #E6FAF3',
          }}
        />
        <div className="bg-bearlog-100 flex w-70.25 flex-col gap-2 rounded-[20px] px-5 py-4 shadow-[0_0_30px_rgba(0,0,0,0.05)]">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm leading-5 font-normal tracking-[-0.42px] text-gray-600">
              {t.note.draftExists}
              <br />
              {t.note.draftLoad}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-0.5 shrink-0 cursor-pointer text-gray-400 transition-colors hover:text-gray-500"
            >
              <XIcon size={20} />
            </button>
          </div>
          <button
            type="button"
            onClick={onLoad}
            className="hover:text-bearlog-600 text-bearlog-500 cursor-pointer text-left text-sm leading-5 font-semibold tracking-[-0.42px] transition-opacity hover:opacity-75"
          >
            {t.note.draftLoadButton}
          </button>
        </div>
      </div>
    </div>
  );
}
