'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import ko from '@/shared/locales/ko.json';
import en from '@/shared/locales/en.json';
import zh from '@/shared/locales/zh.json';
import ja from '@/shared/locales/ja.json';

export type Language = 'ko' | 'en' | 'zh' | 'ja';

const locales = { ko, en, zh, ja };

export type TranslationType = typeof ko;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko');

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = locales[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
