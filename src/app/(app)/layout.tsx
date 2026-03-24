import { Suspense } from 'react';
import Sidebar from '@/components/nav/Sidebar';
import TopBar from '@/components/nav/TopBar';
import BottomNav from '@/components/nav/BottomNav';
import type { PersonProfile } from '@/types/database';

const ME: PersonProfile = {
  id: 'm1', user_id: 'mu1', handle: 'arjun-mehta', full_name: 'Arjun Mehta',
  avatar_url: null, headline: 'Full-stack dev · Bangalore', city: 'Bangalore',
  open_to: ['full_time', 'collab'], buzz_score: 340, score_band: 'charged',
  streak_count: 5, streak_last_post: '2026-03-22', profile_complete: true,
  created_at: '', updated_at: '',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar profile={ME} accountType="person" unreadNotifications={3} />
      <div className="flex-1 min-w-0">
        <TopBar profile={ME} handle={ME.handle} unreadNotifications={3} />
        <main className="w-full px-5 md:px-6 py-5 pb-20 md:pb-5">
          <Suspense>{children}</Suspense>
        </main>
        <BottomNav unreadNotifications={3} />
      </div>
    </div>
  );
}
