import { OPEN_TO_LABELS } from '@/lib/utils';
import type { OpenToType } from '@/types/database';

interface OpenToChipsProps {
  openTo: OpenToType[];
}

export default function OpenToChips({ openTo }: OpenToChipsProps) {
  const visible = openTo.filter((t) => t !== 'not_looking');
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      <span className="text-xs text-buzz-muted">Open to:</span>
      {visible.map((type) => (
        <span
          key={type}
          className="chip bg-buzz-yellow/15 text-buzz-dark"
        >
          {OPEN_TO_LABELS[type]}
        </span>
      ))}
    </div>
  );
}
