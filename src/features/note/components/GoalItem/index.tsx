import clsx from 'clsx';
import Image from 'next/image';

export default function GoalItem({ title }: { title: string }) {
  return (
    <div
      className={clsx(
        'flex w-full items-center gap-3 rounded-2xl bg-orange-100 dark:bg-[#4B4B4B] p-5 text-base font-semibold text-gray-700 dark:text-white',
        'md:p-6 md:text-xl',
        'lg:gap-6 lg:p-10 lg:text-2xl',
      )}
    >
      <Image
        src={'/image/goal-orange.png'}
        width={32}
        height={32}
        alt="목표 아이콘"
        className="shrink-0 lg:h-10 lg:w-10"
      />
      <p className="line-clamp-1 flex-1">{title}</p>
    </div>
  );
}
