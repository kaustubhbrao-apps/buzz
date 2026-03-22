import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { following_id, following_type, action } = await request.json();

  if (action === 'unfollow') {
    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', following_id);
  } else {
    await supabase
      .from('follows')
      .upsert({
        follower_id: user.id,
        following_id,
        following_type,
      });
  }

  const { count } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', following_id);

  return NextResponse.json({
    following: action !== 'unfollow',
    followerCount: count ?? 0,
  });
}
