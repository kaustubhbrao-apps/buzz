import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addScoreEvent } from '@/lib/score.server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { reaction_type } = await request.json();
  const postId = params.id;

  // Check existing reaction
  const { data: existing } = await supabase
    .from('reactions')
    .select('reaction_type')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    if (existing.reaction_type === reaction_type) {
      // Un-react
      await supabase
        .from('reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
    } else {
      // Change reaction
      await supabase
        .from('reactions')
        .update({ reaction_type })
        .eq('post_id', postId)
        .eq('user_id', user.id);
    }
  } else {
    // New reaction
    await supabase
      .from('reactions')
      .insert({ post_id: postId, user_id: user.id, reaction_type });

    // Score for post author
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
        if (reaction_type === 'hire') {
          await addScoreEvent(authorProfile.id, 'hire_reaction', postId);
          await supabase.from('notifications').insert({
            recipient_id: post.author_id,
            type: 'hire_reaction',
            reference_id: postId,
            actor_id: user.id,
          });
        } else if (reaction_type === 'collab') {
          await addScoreEvent(authorProfile.id, 'collab_reaction', postId);
        }
        // All reactions count — inspired and learned give points via post_saved event type
      }
    }
  }

  // Return updated counts
  const { data: reactions } = await supabase
    .from('reactions')
    .select('reaction_type')
    .eq('post_id', postId);

  const counts = {
    inspired: (reactions ?? []).filter((r) => r.reaction_type === 'inspired').length,
    learned: (reactions ?? []).filter((r) => r.reaction_type === 'learned').length,
    collab: (reactions ?? []).filter((r) => r.reaction_type === 'collab').length,
    hire: (reactions ?? []).filter((r) => r.reaction_type === 'hire').length,
  };

  return NextResponse.json({ reaction_counts: counts });
}
