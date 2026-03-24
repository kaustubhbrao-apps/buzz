'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Briefcase, MessageCircle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { icon: Home, href: '/feed' },
  { icon: Compass, href: '/discover' },
  { icon: Briefcase, href: '/jobs' },
  { icon: MessageCircle, href: '/messages' },
  { icon: Bell, href: '/notifications' },
];

export default function BottomNav({ unreadNotifications = 0 }: { unreadNotifications?: number }) {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#F0F0F0] z-40">
      <div className="flex items-center justify-around h-14">
        {ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={cn('relative w-11 h-11 flex items-center justify-center rounded-2xl transition-all',
                isActive ? 'bg-[#0F0F0F] text-white' : 'text-[#CCC]')}>
              <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.6} />
              {item.icon === Bell && unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#FFD60A] text-[#0F0F0F] text-[8px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
