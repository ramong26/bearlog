'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { memo, useCallback, useEffect, useState } from 'react';

import { TodoMode } from '@/shared/stores/useTodoModeStore';

import { useLanguage } from '@/shared/contexts/LanguageContext';

interface TabChangeModeProps {
  mode: TodoMode;
  onModeChange?: (mode: TodoMode) => void;
}

const MODE_OPTIONS: { label: string; value: TodoMode }[] = [
  { label: '일반 모드', value: 'MANUAL' },
  { label: '개발자 모드', value: 'GITHUB' },
];

function TabChangeMode({ mode, onModeChange }: TabChangeModeProps) {
  const [selectedMode, setSelectedMode] = useState<TodoMode>(mode);

  const { t } = useLanguage();

  useEffect(() => {
    setSelectedMode(mode);
  }, [mode]);

  const handleSelectMode = useCallback(
    (nextMode: TodoMode) => {
      setSelectedMode(nextMode);
      onModeChange?.(nextMode);
    },
    [onModeChange],
  );

  return (
    <div
      role="tablist"
      aria-label="모드 선택"
      className="inline-flex h-fit items-center rounded-full bg-[#D9D9D9] dark:bg-gray-700 px-2 py-[7px]"
    >
      {MODE_OPTIONS.map((option) => {
        const isActive = selectedMode === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelectMode(option.value)}
            className={clsx(
              'relative rounded-full px-[10.95px] py-[1.93px] leading-7 font-medium transition-colors duration-200 md:px-[9.76px] md:py-[1.97px] md:text-[12px] lg:px-[14.5px] lg:py-[3px] lg:text-[20px]',
              isActive ? 'text-gray-100' : 'text-[#8A8A8A] hover:bg-white/40',
              option.value === 'GITHUB' && 'px-5 text-[18px]',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="tab-change-mode-indicator"
                className="bg-bearlog-500 absolute inset-0 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 32,
                }}
              />
            )}

            {option.value === 'MANUAL' ? (
              <span className="relative z-10">{option.label}</span>
            ) : (
              <div className="relative z-10 flex items-center gap-2">
                {option.label}
                <ModeGithub isActive={isActive} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default memo(TabChangeMode);

interface ModeGithubProps {
  isActive: boolean;
}

function ModeGithub({ isActive }: ModeGithubProps) {
  return (
    <div
      className={clsx(
        'flex h-[19px] items-center rounded-lg px-[8px] py-[4px] text-[10px] font-medium',
        isActive ? 'bg-[rgba(103,255,200,0.3)] text-gray-100' : 'bg-[rgba(103,255,200,0.1)] text-gray-400',
      )}
    >
      Github
    </div>
  );
}
