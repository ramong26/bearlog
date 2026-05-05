'use client';

import { useState } from 'react';
import { SunIcon, MoonIcon, XIcon } from 'lucide-react';
import Button from '@/shared/components/Button';
import Dropdown from '@/shared/components/Dropdown';
import { useModalStore } from '@/shared/stores/useModalStore';
import { useLanguage, type Language } from '@/shared/contexts/LanguageContext';
import { useThemeStore } from '@/shared/stores/useThemeStore';

export function SettingsModal() {
  const { closeModal } = useModalStore();
  const { language, setLanguage, t } = useLanguage();
  const { isDark, setIsDark } = useThemeStore();
  const [tempLanguage, setTempLanguage] = useState<Language>(language);
  const [tempIsDark, setTempIsDark] = useState(isDark);

  const handleConfirm = () => {
    setLanguage(tempLanguage);
    setIsDark(tempIsDark);
    closeModal();
  };

  const handleCancel = () => {
    setTempLanguage(language);
    setTempIsDark(isDark);
    closeModal();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="h-103 w-114 rounded-3xl bg-white dark:bg-gray-850 p-8 shadow-[0px_0px_60px_0px_rgba(0,0,0,0.05)]"
    >
      <div className="mb-7.5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">{t.settings.title}</h2>
        <button
          type="button"
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600"
          aria-label={t.common.close}
        >
          <XIcon size={24} />
        </button>
      </div>

      {/* 언어 */}
      <div className="mb-6 flex flex-col gap-2">
        <label htmlFor="language-select" className="text-sm font-medium text-slate-700 dark:text-white">
          {t.settings.language}
        </label>
        <Dropdown
          items={[
            { label: '한국어', value: 'ko' },
            { label: 'English', value: 'en' },
            { label: '简体中文', value: 'zh' },
            { label: '日本語', value: 'ja' },
          ]}
          selectedValue={tempLanguage}
          onSelectItem={(item) => setTempLanguage(item.value as Language)}
        />
      </div>

      {/* 다크모드 */}
      <div className="mb-8 flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700 dark:text-white">{t.settings.darkMode}</label>
        <div className="flex h-14 w-56 gap-2.5 rounded-full bg-gray-100 dark:bg-gray-900 p-2">
          <button
            type="button"
            onClick={() => setTempIsDark(false)}
            className={`flex flex-1 items-center justify-center rounded-full transition-colors ${
              !tempIsDark ? 'bg-white dark:bg-gray-850 text-slate-800 dark:text-gray-400 shadow-sm' : 'text-gray-400 hover:text-slate-600'
            }`}
          >
            <SunIcon size={20} />
          </button>
          <button
            type="button"
            onClick={() => setTempIsDark(true)}
            className={`flex flex-1 items-center justify-center rounded-full transition-colors ${
              tempIsDark ? 'bg-white dark:bg-gray-850 text-slate-800 dark:text-gray-400 shadow-sm' : 'text-gray-400 hover:text-slate-600'
            }`}
          >
            <MoonIcon size={20} />
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="cancel" className="h-14 w-48 text-lg text-gray-500 dark:text-gray-500" onClick={handleCancel}>
          {t.settings.cancel}
        </Button>
        <Button variant="primary" className="h-14 w-48 text-lg dark:text-gray-850" onClick={handleConfirm}>
          {t.settings.confirm}
        </Button>
      </div>
    </div>
  );
}
