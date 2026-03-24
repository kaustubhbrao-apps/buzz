import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addScoreEvent, checkAndAwardStreak } from '@/lib/score.server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') ?? 'buzz';
  const cursor = searchParams.get('cursor');
  const limit = parseInt(searchParams.get('limit') ?? '20');

  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:person_profiles!posts_author_id_fkey(id, user_id, handle, full_name, avatar_url, score_band),
      reactions(reaction_type),
      comments(id),
      saved_posts!left(user_id)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (tab === 'buzz') {
    query = query
      .not('attachment_url', 'is', null)
      .eq('post_type', 'work');
  } else {
    if (user) {
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);
      const ids = (following ?? []).map((f) => f.following_id);
      if (ids.length > 0) {
        query = query.in('author_id', ids);
      }
    }
  }

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data: posts, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const enriched = (posts ?? []).map((post) => {
    const reactions = (post.reactions as { reaction_type: string }[]) ?? [];
    const reaction_counts = {
      inspired: reactions.filter((r) => r.reaction_type === 'inspired').length,
      learned: reactions.filter((r) => r.reaction_type === 'learned').length,
      collab: reactions.filter((r) => r.reaction_type === 'collab').length,
      hire: reactions.filter((r) => r.reaction_type === 'hire').length,
    };
    const user_reaction = user
      ? reactions.find((r) => (r as Record<string, string>).user_id === user.id)?.reaction_type ?? null
      : null;
    const comment_count = ((post.comments as unknown[]) ?? []).length;
    const saved = (post.saved_posts as { user_id: string }[]) ?? [];
    const is_saved = user ? saved.some((s) => s.user_id === user.id) : false;

    return {
      ...post,
      reactions: undefined,
      comments: undefined,
      saved_posts: undefined,
      reaction_counts,
      user_reaction,
      comment_count,
      is_saved,
    };
  });

  const nextCursor = enriched.length === limit
    ? enriched[enriched.length - 1].created_at
    : null;

  return NextResponse.json({ posts: enriched, nextCursor });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { post_type, content, attachment_url, attachment_type, skills_tagged, repost_of } = body;

  if (post_type === 'work' && !attachment_url) {
    return NextResponse.json(
      { error: 'Work posts require an attachment.' },
      { status: 400 }
    );
  }

  const { data: userData } = await supabase
    .from('users')
    .select('account_type')
    .eq('id', user.id)
    .single();

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      author_type: userData?.account_type ?? 'person',
      post_type,
      content,
      attachment_url,
      attachment_type,
      skills_tagged: skills_tagged ?? [],
      repost_of: repost_of ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Score events for work posts
  if (post_type === 'work' && userData?.account_type === 'person') {
    const { data: profile } = await supabase
      .from('person_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      await addScoreEvent(profile.id, 'work_post', post.id);
      await checkAndAwardStreak(profile.id);
    }
  }

  return NextResponse.json({ post });
}
