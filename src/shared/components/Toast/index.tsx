'use client';

import { Check, XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { cn } from '@/shared/lib/utils';

const TOAST_DURATION_MS = 3000;

interface ToastProps {
  children: React.ReactNode;
  subText?: string;
  show: boolean;
  onClose: () => void;
  variant?: 'success' | 'fail';
}

export default function Toast({ show, children, subText, onClose, variant = 'success' }: ToastProps) {
  useEffect(() => {
    let timeOutId: NodeJS.Timeout;

    if (show) {
      timeOutId = setTimeout(() => {
        onClose();
      }, TOAST_DURATION_MS);
    }

    return () => clearTimeout(timeOutId);
  }, [onClose, show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-10 left-1/2 z-50"
          initial={{ opacity: 0, x: '-50%', y: -16 }}
          animate={{ opacity: 1, x: '-50%', y: 0 }}
          exit={{ opacity: 0, x: '-50%', y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className={cn(
              'flex h-10 items-center gap-1 rounded-[28px] px-4 whitespace-nowrap shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
              variant === 'success' && 'bg-orange-100',
              variant === 'fail' && 'bg-error-200',
              '',
            )}
          >
            {/* 체크 아이콘 */}
            <span className="flex size-6 shrink-0 items-center justify-center">
              {variant === 'success' ? (
                <Check className="aria-hidden h-[10px] w-[14px] stroke-orange-600" />
              ) : (
                <XIcon className="aria-hidden stroke-error-700 h-[10px] w-[14px]" />
              )}
            </span>
            {/* 텍스트 영역 */}
            <div
              className={cn(
                'flex items-center gap-1',
                variant === 'success' && 'text-orange-600',
                variant === 'fail' && 'text-error-700',
              )}
            >
              <p className="text-[14px] leading-5 font-semibold tracking-[-0.42px]">{children}</p>

              {subText && (
                <>
                  <span className="text-[12px] leading-4 font-medium">ㆍ</span>
                  <span className="text-[14px] leading-5 font-semibold tracking-[-0.42px]">{subText}</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
