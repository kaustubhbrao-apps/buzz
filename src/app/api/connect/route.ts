import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { recipient_id, note } = await request.json();

  if (!note || note.trim().length < 10) {
    return NextResponse.json(
      { error: "Add a note. Tell them why you're connecting." },
      { status: 400 }
    );
  }

  // Check no existing connection
  const { data: existing } = await supabase
    .from('connections')
    .select('id')
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .or(`requester_id.eq.${recipient_id},recipient_id.eq.${recipient_id}`)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'Connection already exists' }, { status: 400 });
  }

  const { data: connection, error } = await supabase
    .from('connections')
    .insert({ requester_id: user.id, recipient_id, note: note.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ connection });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { connectionId, action } = await request.json();

  const { data: connection, error } = await supabase
    .from('connections')
    .update({ status: action === 'accept' ? 'accepted' : 'declined' })
    .eq('id', connectionId)
    .eq('recipient_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Create message thread if accepted
  if (action === 'accept' && connection) {
    await supabase.from('message_threads').insert({
      participant_1: connection.requester_id,
      participant_2: connection.recipient_id,
      thread_type: 'direct',
    });
  }

  return NextResponse.json({ connection });
}
