import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  hideLabel?: boolean;
}

export default function FormField({ label, required, error, children, className, hideLabel }: FormFieldProps) {
  return (
    <div className={twMerge(clsx('flex w-full flex-col gap-2', className))}>
      <label
        className={twMerge(
          clsx('text-base font-semibold text-text-label', hideLabel && 'sr-only'),
        )}
      >
        {label}
        {required && <span className="text-bearlog-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="px-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
