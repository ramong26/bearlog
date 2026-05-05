import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface ProgressbarProps {
  /**
   * @description
   * progress: 현재 진행 상황을 나타내는 바 (숫자)
   */
  progress: number;
  /**
   * @description
   * number: 진행 상황을 숫자로 표시할지 여부 (기본값: true)
   */
  number?: boolean;
}
export default function Progressbar({ progress, number = true }: ProgressbarProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));
  const springProgress = useSpring(0, {
    stiffness: 120,
    damping: 20,
    mass: 0.8,
  });
  const animatedLabel = useTransform(() => `${Math.round(springProgress.get())}%`);

  useEffect(() => {
    springProgress.set(safeProgress);
  }, [safeProgress, springProgress]);

  return (
    <div className="flex w-full items-center gap-[8px] transition-all duration-300 ease-in-out md:gap-[10px]">
      <div className="h-2 w-full overflow-hidden rounded bg-[#E9E9E9] dark:bg-gray-700">
        <motion.div
          className="bg-bearlog-500 h-full rounded"
          animate={{ width: `${safeProgress}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.8 }}
        />
      </div>
      {number && (
        <motion.span className="text-bearlog-500 text-sm transition-all duration-300 ease-in-out md:text-base md:font-bold">
          {animatedLabel}
        </motion.span>
      )}
    </div>
  );
}
