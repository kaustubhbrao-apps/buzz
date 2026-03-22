import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get('thread_id');

  // Single thread messages
  if (threadId) {
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    const { data: thread } = await supabase
      .from('message_threads')
      .select('*')
      .eq('id', threadId)
      .single();

    let otherParticipant = null;
    if (thread) {
      const otherId = thread.participant_1 === user.id ? thread.participant_2 : thread.participant_1;
      const { data } = await supabase
        .from('person_profiles')
        .select('*')
        .eq('user_id', otherId)
        .single();
      otherParticipant = data;
    }

    // Mark as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('thread_id', threadId)
      .neq('sender_id', user.id);

    return NextResponse.json({
      messages,
      other_participant: otherParticipant,
      current_user_id: user.id,
    });
  }

  // Thread list
  const { data: threads } = await supabase
    .from('message_threads')
    .select('*')
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .order('updated_at', { ascending: false });

  const enriched = await Promise.all(
    (threads ?? []).map(async (thread) => {
      const otherId = thread.participant_1 === user.id ? thread.participant_2 : thread.participant_1;

      const [participantRes, lastMsgRes, unreadRes] = await Promise.all([
        supabase.from('person_profiles').select('*').eq('user_id', otherId).single(),
        supabase
          .from('messages')
          .select('*')
          .eq('thread_id', thread.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('thread_id', thread.id)
          .eq('read', false)
          .neq('sender_id', user.id),
      ]);

      return {
        ...thread,
        other_participant: participantRes.data,
        last_message: lastMsgRes.data,
        unread_count: unreadRes.count ?? 0,
      };
    })
  );

  return NextResponse.json({ threads: enriched });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { thread_id, content } = await request.json();

  // Verify participant
  const { data: thread } = await supabase
    .from('message_threads')
    .select('participant_1, participant_2')
    .eq('id', thread_id)
    .single();

  if (!thread || (thread.participant_1 !== user.id && thread.participant_2 !== user.id)) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({ thread_id, sender_id: user.id, content })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase
    .from('message_threads')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', thread_id);

  return NextResponse.json({ message });
}
