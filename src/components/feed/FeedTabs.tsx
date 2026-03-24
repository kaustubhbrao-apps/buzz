'use client';

import { cn } from '@/lib/utils';

export default function FeedTabs({ activeTab, onChange }: { activeTab: 'buzz' | 'latest'; onChange: (tab: 'buzz' | 'latest') => void }) {
  return (
    <div className="card-static flex overflow-hidden">
      {[
        { id: 'buzz' as const, label: '🔥 Buzz Feed' },
        { id: 'latest' as const, label: '📅 Latest' },
      ].map((tab) => (
        <button key={tab.id} onClick={() => onChange(tab.id)}
          className={cn(
            'flex-1 px-4 py-3.5 text-sm font-semibold text-center transition-all duration-200 border-b-2',
            activeTab === tab.id ? 'border-violet-500 text-violet-600 bg-violet-50/50' : 'border-transparent text-[#A8A29E] hover:text-[#57534E] hover:bg-[#FAF9F7]'
          )}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
