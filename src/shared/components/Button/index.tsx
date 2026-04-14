'use client';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'icon' | 'cancel' | 'confirm';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-bearlog-500 text-white rounded-full font-semibold hover:bg-bearlog-600 disabled:bg-[#BBBBBB] disabled:text-white',
  secondary:
    'bg-transparent text-bearlog-600 border-2 border-bearlog-500 rounded-full font-semibold hover:border-bearlog-600',
  tertiary: 'bg-transparent text-gray-500 rounded-full font-medium hover:bg-gray-100',
  danger: 'bg-red-500 text-white rounded-full font-semibold hover:bg-red-500/90',
  icon: 'bg-white text-[#FF8442] border-2 border-[#FF8442] rounded-full hover:bg-[#FF8442]/10',
  cancel: 'bg-white text-gray-800 border border-gray-200 rounded-full font-medium hover:bg-gray-50',
  confirm: 'bg-[#FF8442] text-white rounded-full font-medium hover:bg-[#FF8442]/90',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          'flex cursor-pointer items-center justify-center gap-1',
          'transition-colors duration-200',
          'disabled:cursor-not-allowed disabled:opacity-50',
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export default Button;
