import { ReactNode } from 'react';
import clsx from 'clsx';
interface PageSubTitleProps {
  icons?: ReactNode;
  subTitle: string;
  actions?: ReactNode;
  className?: string;
  textClassName?: string;
}

export default function PageSubTitle({ icons, subTitle, actions, className, textClassName }: PageSubTitleProps) {
  return (
    <div className={clsx('flex items-center justify-between px-2', className)}>
      <div className="flex items-center gap-3">
        {icons && <div>{icons}</div>}

        <h2
          className={clsx(
            'w-full overflow-hidden text-base font-medium text-ellipsis whitespace-nowrap text-black dark:text-white transition-all duration-300 lg:text-lg',
            textClassName,
          )}
        >
          {subTitle}
        </h2>
      </div>
      {actions && <div className="min-w-fit">{actions}</div>}
    </div>
  );
}
