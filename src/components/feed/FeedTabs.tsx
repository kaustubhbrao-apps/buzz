'use client';

import { cn } from '@/lib/utils';

interface FeedTabsProps {
  activeTab: 'buzz' | 'latest';
  onChange: (tab: 'buzz' | 'latest') => void;
}

export default function FeedTabs({ activeTab, onChange }: FeedTabsProps) {
  return (
    <div className="flex border-b border-buzz-border">
      <button
        onClick={() => onChange('buzz')}
        title="Work posts only. Ranked by quality and reactions."
        className={cn(
          'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
          activeTab === 'buzz'
            ? 'border-buzz-yellow text-buzz-dark'
            : 'border-transparent text-buzz-muted hover:text-buzz-text'
        )}
      >
        🔥 Buzz Feed
      </button>
      <button
        onClick={() => onChange('latest')}
        title="Everything from people you follow, newest first."
        className={cn(
          'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
          activeTab === 'latest'
            ? 'border-buzz-yellow text-buzz-dark'
            : 'border-transparent text-buzz-muted hover:text-buzz-text'
        )}
      >
        📅 Latest
      </button>
    </div>
  );
}
