'use client';

import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export default function Input({
  label,
  error,
  helper,
  maxLength,
  value,
  className,
  ...props
}: InputProps) {
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div>
      {label && <label className="label mb-1 block">{label}</label>}
      <div className="relative">
        <input
          value={value}
          maxLength={maxLength}
          className={cn(
            'input',
            error && 'border-buzz-error focus:ring-buzz-error',
            maxLength && 'pr-16',
            className
          )}
          {...props}
        />
        {maxLength && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-buzz-muted">
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      {error && <p className="text-buzz-error text-xs mt-1">{error}</p>}
      {helper && !error && <p className="text-buzz-muted text-xs mt-1">{helper}</p>}
    </div>
  );
}
