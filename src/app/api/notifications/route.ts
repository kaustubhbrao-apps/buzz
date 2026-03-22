import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*, actor:person_profiles!notifications_actor_id_fkey(id, full_name, handle, avatar_url, score_band)')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notifications });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ids, all } = await request.json();

  if (all) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient_id', user.id)
      .eq('read', false);
  } else if (ids?.length) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', ids)
      .eq('recipient_id', user.id);
  }

  return NextResponse.json({ success: true });
}
