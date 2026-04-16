'use client';

import { WifiOff } from 'lucide-react';

import { useLanguage } from '@/shared/contexts/LanguageContext';

interface ErrorFallbackUIProps {
  onRetry: () => void;
}

export default function ErrorFallbackUI({ onRetry }: ErrorFallbackUIProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <WifiOff size={60} className="text-gray-400" />
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{t.modal.errorTitle}</p>
        <p className="whitespace-pre-line text-sm text-gray-500 dark:text-gray-400">{t.modal.errorDesc}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {t.modal.errorRetry}
      </button>
    </div>
  );
}
