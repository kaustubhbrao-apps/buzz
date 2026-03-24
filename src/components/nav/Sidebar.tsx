'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Briefcase, MessageCircle, Bell, User, Settings, Zap, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PersonProfile, CompanyProfile } from '@/types/database';

const BASE_NAV = [
  { icon: Home, href: '/feed', label: 'Feed' },
  { icon: Compass, href: '/discover', label: 'Discover' },
  { icon: Briefcase, href: '/jobs', label: 'Jobs' },
  { icon: MessageCircle, href: '/messages', label: 'Messages' },
  { icon: Bell, href: '/notifications', label: 'Alerts' },
];

export default function Sidebar({ profile, accountType, unreadNotifications = 0 }: {
  profile: PersonProfile | CompanyProfile; accountType: 'person' | 'company'; unreadNotifications?: number;
}) {
  const pathname = usePathname();
  const handle = 'handle' in profile ? profile.handle : '';
  const name = accountType === 'person' ? (profile as PersonProfile).full_name : (profile as CompanyProfile).name;
  const avatarUrl = accountType === 'person' ? (profile as PersonProfile).avatar_url : (profile as CompanyProfile).logo_url;
  const score = accountType === 'person' ? (profile as PersonProfile).buzz_score : 0;

  const NAV = accountType === 'company'
    ? [...BASE_NAV, { icon: LayoutDashboard, href: '/dashboard', label: 'Dashboard' }]
    : BASE_NAV;

  return (
    <aside className="hidden md:flex flex-col items-center w-[72px] h-screen sticky top-0 bg-white border-r border-[#F0F0F0] py-5">
      {/* Logo */}
      <Link href="/" className="mb-8">
        <div className="w-10 h-10 rounded-2xl bg-[#FFD60A] flex items-center justify-center">
          <Zap className="w-5 h-5 text-[#0F0F0F]" fill="#0F0F0F" />
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {NAV.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'relative w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-150',
                isActive ? 'bg-[#0F0F0F] text-white' : 'text-[#BBB] hover:bg-[#F5F5F5] hover:text-[#0F0F0F]'
              )}
              title={item.label}
            >
              <item.icon className="w-[20px] h-[20px]" strokeWidth={isActive ? 2.2 : 1.6} />
              {item.icon === Bell && unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FFD60A] text-[#0F0F0F] text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-2">
        <Link href="/settings" className="w-11 h-11 flex items-center justify-center rounded-2xl text-[#BBB] hover:bg-[#F5F5F5] hover:text-[#0F0F0F] transition-all" title="Settings">
          <Settings className="w-[20px] h-[20px]" strokeWidth={1.6} />
        </Link>
        <Link href={`/${handle}`} title={name}
          className="w-10 h-10 rounded-2xl bg-[#0F0F0F] text-white flex items-center justify-center text-xs font-bold overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            name.split(' ').map(w => w[0]).join('').slice(0, 2)
          )}
        </Link>
        <div className="text-[10px] font-bold text-[#0F0F0F]">{score}</div>
      </div>
    </aside>
  );
}
