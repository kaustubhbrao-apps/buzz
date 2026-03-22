import type { ScoreBand, ScoreEventType } from '@/types/database';
import { createClient } from '@/lib/supabase/server';

export const SCORE_POINTS: Record<ScoreEventType, number> = {
  work_post: 20,
  post_saved: 10,
  hire_reaction: 25,
  collab_reaction: 15,
  endorsement: 30,
  employer_endorsement: 50,
  spotlight: 75,
  hire_confirmed: 200,
  streak_7: 25,
  profile_complete: 30,
  versatile_skills: 50,
};

export function getBand(score: number): ScoreBand {
  if (score >= 1200) return 'legend';
  if (score >= 800) return 'elite';
  if (score >= 500) return 'buzzing';
  if (score >= 200) return 'charged';
  return 'seedling';
}

export const BAND_CONFIG: Record<ScoreBand, { label: string; emoji: string; color: string }> = {
  seedling: { label: 'Seedling', emoji: '🌱', color: '#9E9E9E' },
  charged: { label: 'Charged', emoji: '⚡', color: '#2471A3' },
  buzzing: { label: 'Buzzing', emoji: '🔥', color: '#E67E22' },
  elite: { label: 'Elite', emoji: '💎', color: '#7D3C98' },
  legend: { label: 'Legend', emoji: '👑', color: '#F5C518' },
};

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
