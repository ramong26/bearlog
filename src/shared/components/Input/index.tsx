'use client';
import { useState, forwardRef, InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type InputType = 'text' | 'email' | 'password' | 'url';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: InputType;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type = 'text', placeholder, value, onChange, disabled, className, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={twMerge(
            'h-[56px] w-full rounded-2xl border border-border-input',
            'px-6 text-base text-text-input',
            'placeholder:text-text-muted',
            'bg-bg-input outline-none',
            disabled ? 'cursor-not-allowed opacity-50' : '',
            className,
          )}
          {...rest}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-[60%] right-5 -translate-y-1/2 text-gray-500"
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {showPassword ? <Eye size={22} /> : <EyeOff size={22} />}
          </button>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export default Input;
