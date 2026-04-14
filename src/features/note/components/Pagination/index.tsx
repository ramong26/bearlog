import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, LucideIcon } from 'lucide-react';

// ---- 서브 컴포넌트 ----

interface NavButtonProps {
  icon: LucideIcon;
  disabled?: boolean;
  onClick?: () => void;
  'aria-label': string;
}

const btnBase = 'flex-row-center h-6 w-6 cursor-pointer rounded-[5px] p-0.5';
const enabledStyle = 'bg-primary-500-10 text-primary-500';
const disabledStyle = 'bg-gray-200 text-gray-300';

const NavButton = ({ icon: Icon, disabled, onClick, 'aria-label': ariaLabel }: NavButtonProps) => {
  return (
    <button
      className={`${btnBase} ${disabled ? disabledStyle : enabledStyle}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <Icon className={`${disabled ? 'text-gray-300' : 'text-primary-500'} h-full w-full`} />
    </button>
  );
};

interface PageButtonProps {
  page: number | string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const PageButton = ({ page, active, onClick, disabled }: PageButtonProps) => {
  const base = 'inline-flex items-center justify-center cursor-pointer rounded-[5px] py-[2px] h-6 min-w-6';
  const style = active ? 'bg-primary-500 text-gray-600/50 font-body-b' : 'bg-gray-100 text-gray-600 font-body-m';

  if (page === '...') return <div className={`${base} ${style}`}>···</div>;

  return (
    <button className={`${base} ${style}`} onClick={onClick} disabled={disabled || active}>
      {page}
    </button>
  );
};

// ---- Pagination ----

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const getPages = () => {
    const pages: (number | string)[] = [];

    // 1. totalPages <= 10
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // 2. totalPages > 10
    // 2-1. currentPage가 앞쪽에 있을 때 (1~6 페이지)
    // 예: [1] 2 3 4 5 6 7 8 ... 100
    if (currentPage <= 5) {
      for (let i = 1; i <= 8; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
      return pages;
    }

    // 2-2. currentPage가 뒤쪽에 있을 때 (마지막에서 5개 이내)
    // 예: 1 ... 93 94 95 96 97 98 99 [100]
    if (currentPage >= totalPages - 4) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 7; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // 2-3. currentPage가 중간에 있을 때
    // 예: 1 ... 48 49 [50] 51 52 53 ... 100
    pages.push(1);
    pages.push('...');
    for (let i = currentPage - 2; i <= currentPage + 2; i++) {
      pages.push(i);
    }
    pages.push('...');
    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="inline-flex items-center gap-3">
      <NavButton
        icon={ChevronsLeftIcon}
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        aria-label="첫 페이지"
      />
      <NavButton
        icon={ChevronLeftIcon}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="이전 페이지"
      />

      {getPages().map((page, idx) => (
        <PageButton
          key={idx}
          page={page}
          active={page === currentPage}
          disabled={page === '...'}
          onClick={() => typeof page === 'number' && onPageChange(page)}
        />
      ))}

      <NavButton
        icon={ChevronRightIcon}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="다음 페이지"
      />
      <NavButton
        icon={ChevronsRightIcon}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
        aria-label="마지막 페이지"
      />
    </div>
  );
};

export default Pagination;
