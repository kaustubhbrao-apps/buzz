import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/nav/Sidebar';
import TopBar from '@/components/nav/TopBar';
import BottomNav from '@/components/nav/BottomNav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('account_type')
    .eq('id', user.id)
    .single();

  let profile = null;
  const accountType = userData?.account_type ?? 'person';

  if (accountType === 'person') {
    const { data } = await supabase
      .from('person_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    profile = data;
  } else {
    const { data } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    profile = data;
  }

  if (!profile) redirect('/signup');

  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .eq('read', false);

  const handle = profile.handle;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        profile={profile}
        accountType={accountType}
        unreadNotifications={unreadCount ?? 0}
      />

      <div className="flex-1 flex flex-col">
        <TopBar profile={profile} handle={handle} unreadNotifications={unreadCount ?? 0} />

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-20 md:pb-6">
          <Suspense>{children}</Suspense>
        </main>

        <BottomNav unreadNotifications={unreadCount ?? 0} />
      </div>
    </div>
  );
}
