import { BAND_CONFIG } from '@/lib/score';
import type { ScoreBand as ScoreBandType } from '@/types/database';

interface ScoreBandProps {
  band: ScoreBandType;
  showLabel?: boolean;
}

export default function ScoreBand({ band, showLabel = true }: ScoreBandProps) {
  const config = BAND_CONFIG[band];

  return (
    <span
      className="chip"
      style={{
        backgroundColor: `${config.color}26`,
        color: config.color,
      }}
    >
      {config.emoji}
      {showLabel && <span className="ml-1">{config.label}</span>}
    </span>
  );
}
