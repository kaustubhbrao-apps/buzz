import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addScoreEvent } from '@/lib/score.server';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const postId = params.id;

  const { data: existing } = await supabase
    .from('saved_posts')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    await supabase
      .from('saved_posts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);
    return NextResponse.json({ saved: false });
  }

  await supabase
    .from('saved_posts')
    .insert({ post_id: postId, user_id: user.id });

  // Award score to post author (first save only, not self)
  const { data: post } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', postId)
    .single();

  if (post && post.author_id !== user.id) {
    const { data: authorProfile } = await supabase
      .from('person_profiles')
      .select('id')
      .eq('user_id', post.author_id)
      .single();

    if (authorProfile) {
      await addScoreEvent(authorProfile.id, 'post_saved', postId);
    }
  }

  return NextResponse.json({ saved: true });
}
