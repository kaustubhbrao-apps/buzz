'use client';

import Link from 'next/link';
import { Bell, Zap } from 'lucide-react';
import type { PersonProfile, CompanyProfile } from '@/types/database';

export default function TopBar({ profile, handle, unreadNotifications = 0 }: {
  profile?: PersonProfile | CompanyProfile; handle?: string; unreadNotifications?: number;
}) {
  const name = profile ? ('full_name' in profile ? profile.full_name : profile.name) : 'U';

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white border-b border-[#F0F0F0]">
      <div className="flex items-center justify-between h-14 px-4">
        <Link href={handle ? `/${handle}` : '/feed'}
          className="w-8 h-8 rounded-xl bg-[#0F0F0F] text-white flex items-center justify-center text-[10px] font-bold">
          {name.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </Link>
        <Link href="/" className="flex items-center gap-1">
          <div className="w-7 h-7 rounded-lg bg-[#FFD60A] flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#0F0F0F]" fill="#0F0F0F" />
          </div>
        </Link>
        <Link href="/notifications" className="relative">
          <Bell className="w-5 h-5 text-[#999]" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFD60A] text-[#0F0F0F] text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadNotifications}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
