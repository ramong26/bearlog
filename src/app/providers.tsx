'use client';

import { ReactQueryProvider } from '@/shared/providers/ReactQueryProvider';
import { MSWProvider } from '@/shared/mocks/MSWProvider';
import ToastContainer from '@/shared/components/Toast/ToastContainer';
import { Modal } from '@/shared/components/Modal';
import { LanguageProvider } from '@/shared/contexts/LanguageContext';
import { useEffect } from 'react';
import { useThemeStore } from '@/shared/stores/useThemeStore';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDark } = useThemeStore();
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MSWProvider>
      <ReactQueryProvider>
        <LanguageProvider>
          <ThemeProvider>
            {children}
            <Modal />
            <ToastContainer />
          </ThemeProvider>
        </LanguageProvider>
      </ReactQueryProvider>
    </MSWProvider>
  );
}
