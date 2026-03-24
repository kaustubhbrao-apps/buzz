import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Connection, ConnectionStatus } from '@/types/database';

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

  const { error } = await supabase.from('connections')
    // @ts-ignore supabase-js type inference limitation
    .insert({ requester_id: user.id, recipient_id, note: note.trim() });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { connectionId, action } = await request.json();

  // Get connection first to know participants
  const { data } = await supabase
    .from('connections')
    .select('requester_id, recipient_id')
    .eq('id', connectionId)
    .eq('recipient_id', user.id)
    .single();

  const conn = data as unknown as Pick<Connection, 'requester_id' | 'recipient_id'> | null;
  if (!conn) return NextResponse.json({ error: 'Connection not found' }, { status: 404 });

  const newStatus = (action === 'accept' ? 'accepted' : 'declined') as ConnectionStatus;
  const { error } = await supabase.from('connections')
    // @ts-ignore supabase-js type inference limitation
    .update({ status: newStatus }).eq('id', connectionId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Create message thread if accepted
  if (action === 'accept') {
    await supabase.from('message_threads').insert({
      participant_1: conn.requester_id,
      participant_2: conn.recipient_id,
      thread_type: 'direct',
    });
  }

  return NextResponse.json({ success: true });
}
