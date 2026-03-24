import { BAND_CONFIG } from '@/lib/score';
import type { ScoreBand as ScoreBandType } from '@/types/database';

export default function ScoreBand({ band, showLabel = true }: { band: ScoreBandType; showLabel?: boolean }) {
  const config = BAND_CONFIG[band];
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px]">
      <span>{config.emoji}</span>
      {showLabel && <span className="font-semibold text-[#999]">{config.label}</span>}
    </span>
  );
}
