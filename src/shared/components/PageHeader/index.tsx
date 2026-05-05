import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PageHeaderProps {
  id?: string;
  title: string;
  count?: number;
  className?: string;
}

/**
 * Dashboard / 페이지 헤더 + 카운트 넘버(ex. 찜한 할 일 개수)
 *
 * ## 반응형 폰트 크기
 *
 * ## 색상
 * - 제목: `text-slate-700`
 * - 카운트: `text-orange-600`
 *
 * ## 사용 예시
 * ```tsx
 * // node 13460:51819 — 대시보드 타이틀
 * <PageHeader title="체다치즈님의 대시보드" />
 *
 * // node 13460:53740 — 페이지 헤더 + 카운트
 * <PageHeader title="모든 할 일" count={10} />
 *
 * // node 13460:61446 — 페이지 헤더 + 카운트
 * <PageHeader title="찜한 할 일" count={6} />
 * ```
 */
export function PageHeader({ id, title, count, className = '' }: PageHeaderProps) {
  const hasCount = count !== undefined;

  return (
    <h1
      id={id}
      className={twMerge(
        clsx(
          'flex items-center gap-2 truncate text-black dark:text-white',
          'font-semibold tracking-[-0.03em]',
          'text-base leading-6',
          'md:text-xl md:leading-7.5',
          'lg:text-2xl lg:leading-8',
        ),
        className,
      )}
      // count가 있을 때 스크린 리더가 "모든 할 일, 10개"로 읽도록 aria-label 구성
      aria-label={hasCount ? `${title}, ${count}개` : undefined}
    >
      {/* 제목 — slate-700 */}
      {title}

      {/* 카운트 — bearlog-500, aria-label로 이미 읽히므로 aria-hidden 처리 */}
      {hasCount && (
        <span className="text-bearlog-500" aria-hidden="true">
          {count}
        </span>
      )}
    </h1>
  );
}

export default PageHeader;
