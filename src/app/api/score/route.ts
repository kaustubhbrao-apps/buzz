import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SCORE_POINTS } from '@/lib/score';
import type { ScoreEventType } from '@/types/database';

const VALID_EVENTS = Object.keys(SCORE_POINTS);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { event_type, reference_id } = await request.json();

  if (!VALID_EVENTS.includes(event_type)) {
    return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('person_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const points = SCORE_POINTS[event_type as ScoreEventType];

  await supabase.from('score_events').insert({
    person_id: profile.id,
    event_type,
    points,
    reference_id: reference_id ?? null,
  });

  // Fetch updated score (trigger already ran)
  const { data: updated } = await supabase
    .from('person_profiles')
    .select('buzz_score, score_band')
    .eq('id', profile.id)
    .single();

  return NextResponse.json({
    success: true,
    newScore: updated?.buzz_score ?? 0,
    newBand: updated?.score_band ?? 'seedling',
  });
}
