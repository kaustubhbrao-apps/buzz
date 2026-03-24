'use client';

import { cn, REACTION_CONFIG } from '@/lib/utils';
import type { ReactionType } from '@/types/database';

const REACTION_ORDER: ReactionType[] = ['inspired', 'learned', 'collab', 'hire'];

export default function ReactionBar({ reactionCounts, userReaction, onReact }: {
  postId: string; reactionCounts: Record<ReactionType, number>; userReaction: ReactionType | null; onReact: (type: ReactionType) => void;
}) {
  return (
    <div className="flex items-center">
      {REACTION_ORDER.map((type) => {
        const config = REACTION_CONFIG[type];
        const count = reactionCounts[type] ?? 0;
        const isActive = userReaction === type;
        return (
          <button key={type} onClick={() => onReact(type)} title={config.label}
            className={cn(
              'flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200',
              isActive ? 'text-violet-600 bg-violet-50' : 'text-[#A8A29E] hover:bg-[#FAF9F7] hover:text-[#57534E]'
            )}>
            <span className="text-sm">{config.emoji}</span>
            <span className="hidden sm:inline">{config.label}</span>
            {count > 0 && <span className="opacity-50">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
