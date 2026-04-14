import { cn } from '@/shared/lib/utils';

interface ProgressCircleProps {
  className?: string;
  color?: string;
  percent: number;
}
export default function ProgressCircle({ className, color = '#008354', percent }: ProgressCircleProps) {
  const clampedPercent = Math.max(0, Math.min(100, percent ?? 0));

  const size = 160;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progressLength = circumference * (clampedPercent / 100);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={cn('aspect-square shrink-0', className)}
      role="img"
      aria-label={`진행률 ${clampedPercent}%`}
    >
      {/* 배경 트랙 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={0.45}
      />

      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#FFFFFF"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${progressLength} ${circumference}`}
        style={{
          transform: 'rotate(90deg) scaleX(-1)',
          transformOrigin: '50% 50%',
        }}
        className="duration-300 ease-in-out"
      />
    </svg>
  );
}
