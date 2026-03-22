'use client';

import { BAND_CONFIG } from '@/lib/score';
import type { ScoreBand } from '@/types/database';
import Link from 'next/link';

interface BuzzScoreProps {
  score: number;
  band: ScoreBand;
  percentile?: number;
  monthlyDelta?: number;
  streak?: number;
  showGrowCTA?: boolean;
}

const BAND_RANGES: Record<ScoreBand, [number, number]> = {
  seedling: [0, 199],
  charged: [200, 499],
  buzzing: [500, 799],
  elite: [800, 1199],
  legend: [1200, 2000],
};

export default function BuzzScore({
  score,
  band,
  percentile,
  monthlyDelta,
  streak,
  showGrowCTA,
}: BuzzScoreProps) {
  const config = BAND_CONFIG[band];
  const [min, max] = BAND_RANGES[band];
  const progress = Math.min(((score - min) / (max - min)) * 100, 100);

  if (score === 0) {
    return (
      <div className="text-sm text-buzz-muted">
        Post your first work to start building your score.
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-semibold text-buzz-muted uppercase tracking-wider mb-2">
        ⚡ Buzz Score
      </p>

      <div className="score-bar mb-2">
        <div
          className="score-fill"
          style={{ width: `${progress}%`, backgroundColor: config.color }}
        />
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold">{score}</span>
        <span className="text-sm">
          {config.emoji} {config.label}
        </span>
      </div>

      {percentile && (
        <p className="text-xs text-buzz-muted">Top {percentile}%</p>
      )}

      {monthlyDelta !== undefined && monthlyDelta > 0 && (
        <p className="text-xs text-buzz-success">+{monthlyDelta} pts this month</p>
      )}

      {streak !== undefined && streak > 0 && (
        <p className="text-xs">🔥 {streak} day streak</p>
      )}

      {showGrowCTA && (
        <Link href="/feed" className="text-xs text-buzz-muted hover:underline mt-1 block">
          How to grow your score →
        </Link>
      )}
    </div>
  );
}
