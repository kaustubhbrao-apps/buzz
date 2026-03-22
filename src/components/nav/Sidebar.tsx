'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Briefcase, MessageSquare, Bell, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import { BAND_CONFIG } from '@/lib/score';
import type { PersonProfile, CompanyProfile, ScoreBand } from '@/types/database';

interface SidebarProps {
  profile: PersonProfile | CompanyProfile;
  accountType: 'person' | 'company';
  unreadNotifications?: number;
}

const NAV_ITEMS = [
  { label: 'Feed', icon: Home, href: '/feed' },
  { label: 'Discover', icon: Search, href: '/discover' },
  { label: 'Jobs', icon: Briefcase, href: '/jobs' },
  { label: 'Messages', icon: MessageSquare, href: '/messages' },
  { label: 'Notifications', icon: Bell, href: '/notifications' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar({ profile, accountType, unreadNotifications = 0 }: SidebarProps) {
  const pathname = usePathname();
  const handle = 'handle' in profile ? profile.handle : '';
  const name = accountType === 'person'
    ? (profile as PersonProfile).full_name
    : (profile as CompanyProfile).name;
  const avatar = accountType === 'person'
    ? (profile as PersonProfile).avatar_url
    : (profile as CompanyProfile).logo_url;
  const band = accountType === 'person'
    ? (profile as PersonProfile).score_band
    : null;

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 border-r border-buzz-border bg-white p-4">
      <Link href="/" className="text-xl font-bold text-buzz-dark mb-8">
        ⚡ Buzz
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-buzz-yellow/10 text-buzz-dark border-l-2 border-buzz-yellow -ml-px'
                  : 'text-buzz-muted hover:bg-gray-50 hover:text-buzz-text'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.label === 'Notifications' && unreadNotifications > 0 && (
                <span className="ml-auto bg-buzz-error text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Link>
          );
        })}

        <Link
          href={`/${handle}`}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === `/${handle}`
              ? 'bg-buzz-yellow/10 text-buzz-dark border-l-2 border-buzz-yellow -ml-px'
              : 'text-buzz-muted hover:bg-gray-50 hover:text-buzz-text'
          )}
        >
          <User className="w-5 h-5" />
          Profile
        </Link>
      </nav>

      {/* User card */}
      <div className="border-t border-buzz-border pt-4 mt-4">
        <Link href={`/${handle}`} className="flex items-center gap-2">
          <Avatar src={avatar} name={name} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            {band && (
              <p className="text-xs">
                {BAND_CONFIG[band as ScoreBand].emoji} {BAND_CONFIG[band as ScoreBand].label}
              </p>
            )}
          </div>
        </Link>
      </div>
    </aside>
  );
}
