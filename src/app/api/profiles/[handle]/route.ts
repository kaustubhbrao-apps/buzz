import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Try person profile
  const { data: profile } = await supabase
    .from('person_profiles')
    .select('*')
    .eq('handle', handle)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Get posts by this user
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      reactions(reaction_type),
      comments(id),
      saved_posts!left(user_id)
    `)
    .eq('author_id', profile.user_id)
    .order('created_at', { ascending: false })
    .limit(20);

  const enrichedPosts = (posts ?? []).map((post) => {
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
      author: profile,
      reaction_counts,
      user_reaction,
      comment_count,
      is_saved,
    };
  });

  // Get endorsements
  const { data: endorsements } = await supabase
    .from('endorsements')
    .select('*, author:person_profiles!endorsements_author_id_fkey(id, full_name, handle, avatar_url, score_band)')
    .eq('recipient_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Check if current user is the owner
  const is_owner = user?.id === profile.user_id;

  // Get follower/following counts
  const [{ count: follower_count }, { count: following_count }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.user_id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.user_id),
  ]);

  // Check if current user follows this person
  let is_following = false;
  if (user && !is_owner) {
    const { data: follow } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', profile.user_id)
      .maybeSingle();
    is_following = !!follow;
  }

  return NextResponse.json({
    profile,
    posts: enrichedPosts,
    endorsements: endorsements ?? [],
    is_owner,
    is_following,
    follower_count: follower_count ?? 0,
    following_count: following_count ?? 0,
  });
}
