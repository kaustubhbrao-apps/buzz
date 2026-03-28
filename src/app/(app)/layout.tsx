import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/nav/Sidebar';
import TopBar from '@/components/nav/TopBar';
import BottomNav from '@/components/nav/BottomNav';
import type { AccountType } from '@/types/database';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const { data: dbUser } = await supabase
    .from('users')
    .select('account_type')
    .eq('id', authUser.id)
    .single();

  const accountType: AccountType = dbUser?.account_type ?? 'person';

  let profile;
  if (accountType === 'company') {
    const { data } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single();
    profile = data;
  } else {
    const { data } = await supabase
      .from('person_profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single();
    profile = data;

  }

  if (!profile) redirect('/login');

  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', authUser.id)
    .eq('read', false);

  const unreadNotifications = unreadCount ?? 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile} accountType={accountType} unreadNotifications={unreadNotifications} />
      <div className="flex-1 min-w-0">
        <TopBar profile={profile} handle={profile.handle} unreadNotifications={unreadNotifications} />
        <main className="w-full px-5 md:px-6 py-5 pb-20 md:pb-5">
          <Suspense>{children}</Suspense>
        </main>
        <BottomNav unreadNotifications={unreadNotifications} />
      </div>
    </div>
  );
}
