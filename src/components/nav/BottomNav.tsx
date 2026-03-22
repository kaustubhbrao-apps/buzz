'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Briefcase, MessageSquare, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  unreadNotifications?: number;
}

const ITEMS = [
  { icon: Home, href: '/feed' },
  { icon: Search, href: '/discover' },
  { icon: Briefcase, href: '/jobs' },
  { icon: MessageSquare, href: '/messages' },
  { icon: Bell, href: '/notifications' },
];

export default function BottomNav({ unreadNotifications = 0 }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-buzz-border z-40">
      <div className="flex items-center justify-around h-14">
        {ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative p-2',
                isActive ? 'text-buzz-yellow' : 'text-buzz-muted'
              )}
            >
              <item.icon className="w-6 h-6" />
              {item.icon === Bell && unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-buzz-error text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
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
