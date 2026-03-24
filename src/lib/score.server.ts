import type { ScoreEventType } from '@/types/database';
import { createClient } from '@/lib/supabase/server';
import { SCORE_POINTS } from './score';

export async function addScoreEvent(
  personId: string,
  eventType: ScoreEventType,
  referenceId?: string
) {
  const supabase = await createClient();
  const points = SCORE_POINTS[eventType];

  const { data, error } = await supabase.from('score_events').insert({
    person_id: personId,
    event_type: eventType,
    points,
    reference_id: referenceId ?? null,
  });

  if (error) throw error;
  return data;
}

export async function checkAndAwardStreak(personId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('person_profiles')
    .select('streak_count, streak_last_post')
    .eq('id', personId)
    .single();

  if (!profile) return;

  const today = new Date().toISOString().split('T')[0];
  const lastPost = profile.streak_last_post;
  let newStreak = 1;

  if (lastPost) {
    const lastDate = new Date(lastPost);
    const diff = Math.floor(
      (new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 1) {
      newStreak = profile.streak_count + 1;
    } else if (diff === 0) {
      newStreak = profile.streak_count;
    }
  }

  await supabase
    .from('person_profiles')
    .update({ streak_count: newStreak, streak_last_post: today })
    .eq('id', personId);

  if (newStreak > 0 && newStreak % 7 === 0) {
    await addScoreEvent(personId, 'streak_7');
  }
}

export async function checkProfileComplete(personId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('person_profiles')
    .select('*, person_skills(skill_id)')
    .eq('id', personId)
    .single();

  if (!profile || profile.profile_complete) return;

  const hasRequired =
    profile.full_name &&
    profile.headline &&
    profile.city &&
    profile.avatar_url &&
    profile.open_to?.length > 0 &&
    (profile.person_skills as unknown[])?.length > 0;

  if (hasRequired) {
    await supabase
      .from('person_profiles')
      .update({ profile_complete: true })
      .eq('id', personId);

    const { data: existing } = await supabase
      .from('score_events')
      .select('id')
      .eq('person_id', personId)
      .eq('event_type', 'profile_complete')
      .limit(1);

    if (!existing?.length) {
      await addScoreEvent(personId, 'profile_complete');
    }
  }
}
