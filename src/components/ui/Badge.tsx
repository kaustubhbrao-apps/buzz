import { cn } from '@/lib/utils';
import { Check, AlertTriangle } from 'lucide-react';

interface BadgeProps {
  variant?: 'default' | 'yellow' | 'success' | 'error' | 'warning' | 'verified' | 'unverified';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-100 text-buzz-muted',
  yellow: 'bg-buzz-yellow text-buzz-dark',
  success: 'bg-green-100 text-buzz-success',
  error: 'bg-red-100 text-buzz-error',
  warning: 'bg-orange-100 text-buzz-warning',
  verified: 'bg-green-100 text-buzz-success',
  unverified: 'bg-orange-100 text-buzz-warning',
};

export default function Badge({ variant = 'default', size = 'sm', children, className }: BadgeProps) {
  return (
    <span className={cn('chip', variantStyles[variant], size === 'md' && 'px-4 py-1.5 text-sm', className)}>
      {variant === 'verified' && <Check className="w-3 h-3 mr-1" />}
      {variant === 'unverified' && <AlertTriangle className="w-3 h-3 mr-1" />}
      {children}
    </span>
  );
}
