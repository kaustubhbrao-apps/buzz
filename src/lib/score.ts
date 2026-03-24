import type { ScoreBand, ScoreEventType } from '@/types/database';

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
