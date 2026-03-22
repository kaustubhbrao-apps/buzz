'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import type { PersonProfile, CompanyProfile } from '@/types/database';

interface TopBarProps {
  profile?: PersonProfile | CompanyProfile;
  handle?: string;
  unreadNotifications?: number;
}

export default function TopBar({ profile, handle, unreadNotifications = 0 }: TopBarProps) {
  const name = profile
    ? 'full_name' in profile ? profile.full_name : profile.name
    : 'User';
  const avatar = profile
    ? 'avatar_url' in profile ? profile.avatar_url : profile.logo_url
    : null;

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white border-b border-buzz-border">
      <div className="flex items-center justify-between h-12 px-4">
        <Link href={handle ? `/${handle}` : '/feed'}>
          <Avatar src={avatar} name={name} size="sm" />
        </Link>

        <Link href="/" className="text-lg font-bold text-buzz-dark">
          ⚡ Buzz
        </Link>

        <Link href="/notifications" className="relative">
          <Bell className="w-5 h-5 text-buzz-muted" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-buzz-error text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
              {unreadNotifications}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
