'use client';

import { cn, REACTION_CONFIG } from '@/lib/utils';
import type { ReactionType } from '@/types/database';

interface ReactionBarProps {
  postId: string;
  reactionCounts: Record<ReactionType, number>;
  userReaction: ReactionType | null;
  onReact: (type: ReactionType) => void;
}

const REACTION_ORDER: ReactionType[] = ['inspired', 'learned', 'collab', 'hire'];

export default function ReactionBar({
  reactionCounts,
  userReaction,
  onReact,
}: ReactionBarProps) {
  return (
    <div className="flex items-center gap-1">
      {REACTION_ORDER.map((type) => {
        const config = REACTION_CONFIG[type];
        const count = reactionCounts[type] ?? 0;
        const isActive = userReaction === type;

        return (
          <button
            key={type}
            onClick={() => onReact(type)}
            title={config.label}
            className={cn(
              'inline-flex items-center gap-1 rounded-chip px-2.5 py-1 text-xs transition-all',
              isActive
                ? 'bg-buzz-yellow/20 text-buzz-dark font-medium'
                : 'text-buzz-muted hover:bg-gray-100'
            )}
          >
            <span>{config.emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
