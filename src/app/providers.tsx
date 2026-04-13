'use client';

import { ReactQueryProvider } from '@/shared/providers/ReactQueryProvider';
import ToastContainer from '@/shared/components/Toast/ToastContainer';
import { Modal } from '@/shared/components/Modal';
import { LanguageProvider } from '@/shared/contexts/LanguageContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <LanguageProvider>
        {children}
        <Modal />
        <ToastContainer />
      </LanguageProvider>
    </ReactQueryProvider>
  );
}
