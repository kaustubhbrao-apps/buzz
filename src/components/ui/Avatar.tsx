import Image from 'next/image';
import { cn, getInitials } from '@/lib/utils';

const sizeClasses = { sm: 'w-7 h-7 text-[9px]', md: 'w-9 h-9 text-[10px]', lg: 'w-12 h-12 text-sm', xl: 'w-16 h-16 text-base' };
const pxMap = { sm: 28, md: 36, lg: 48, xl: 64 };

export default function Avatar({ src, name, size = 'md', className }: { src?: string | null; name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  if (src) return <Image src={src} alt={name} width={pxMap[size]} height={pxMap[size]} className={cn('rounded-2xl object-cover flex-shrink-0', sizeClasses[size], className)} />;
  return (
    <div className={cn('rounded-2xl bg-[#0F0F0F] text-white flex items-center justify-center font-bold flex-shrink-0 tracking-tight', sizeClasses[size], className)}>
      {getInitials(name)}
    </div>
  );
}
