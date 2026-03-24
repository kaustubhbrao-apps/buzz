'use client';

import { BAND_CONFIG } from '@/lib/score';
import type { ScoreBand } from '@/types/database';

const RANGES: Record<ScoreBand, [number, number]> = {
  seedling: [0, 199], charged: [200, 499], buzzing: [500, 799], elite: [800, 1199], legend: [1200, 2000],
};

export default function BuzzScore({ score, band, monthlyDelta, streak, showGrowCTA }: {
  score: number; band: ScoreBand; percentile?: number; monthlyDelta?: number; streak?: number; showGrowCTA?: boolean;
}) {
  const config = BAND_CONFIG[band];
  const [min, max] = RANGES[band];
  const pct = Math.min(((score - min) / (max - min)) * 100, 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-[#0F0F0F]/40 uppercase tracking-widest">Buzz Score</span>
        <span className="text-[11px] text-[#0F0F0F]/50">{config.emoji} {config.label}</span>
      </div>
      <div className="text-4xl font-bold text-[#0F0F0F] tracking-tight">{score}</div>
      <div className="score-bar mt-3 mb-2">
        <div className="score-fill bg-[#FFD60A]" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center gap-3 text-[11px]">
        {monthlyDelta !== undefined && monthlyDelta > 0 && <span className="text-[#0F0F0F] font-semibold">+{monthlyDelta} this month</span>}
        {streak !== undefined && streak > 0 && <span className="text-[#0F0F0F]/50">🔥 {streak}d streak</span>}
      </div>
      {showGrowCTA && <button className="mt-3 text-[11px] font-semibold text-[#0F0F0F] underline underline-offset-2">How to grow →</button>}
    </div>
  );
}
