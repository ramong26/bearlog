import Image from 'next/image';
import emptyIcon from '@/features/note/assets/icons/icon-empty.png';

export default function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-[10px] py-10 text-sm font-medium text-slate-500 dark:text-gray-400 md:gap-4.5 md:text-base">
      <Image
        src={emptyIcon}
        alt="데이터 없이 빈 화면일 때, 서비스 시그니처 캐릭터"
        className="aspect-[2/3] w-[79px] md:w-[130px]"
      />
      {children}
    </div>
  );
}
