'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import { timeAgo } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { MessageThread } from '@/types/database';

const TABS = ['All', 'Requests', 'Jobs'];

export default function MessagesPage() {
  const [tab, setTab] = useState('All');
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/messages')
      .then(r => r.ok ? r.json() : { threads: [] })
      .then(data => {
        setThreads(data.threads ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = threads.filter(t => {
    if (tab === 'Jobs') return t.thread_type === 'job_application';
    if (tab === 'Requests') return false;
    return true;
  });

  const getName = (t: MessageThread) => {
    const p = t.other_participant as Record<string, string> | undefined;
    return p?.full_name ?? p?.name ?? 'Unknown';
  };

  const getAvatar = (t: MessageThread) => {
    const p = t.other_participant as Record<string, string> | undefined;
    return p?.avatar_url ?? p?.logo_url ?? null;
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-[#0F0F0F] mb-5">Messages</h1>

      <div className="flex gap-1 p-1 bg-[#F0F0EE] rounded-2xl mb-4">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-[12px] font-semibold rounded-xl transition-all duration-150 ${tab === t ? 'bg-white text-[#0F0F0F] shadow-xs' : 'text-[#0F0F0F]/40'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#0F0F0F]/30" />
        </div>
      ) : (
        <div className="card-static overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-[13px] text-[#0F0F0F]/40 text-center py-12">No messages yet.</p>
          ) : filtered.map(t => (
            <Link key={t.id} href={`/messages/${t.id}`}
              className="flex items-center gap-3 p-4 hover:bg-[#FAFAF8] transition-all border-b border-[#EAEAE8] last:border-0">
              <Avatar src={getAvatar(t)} name={getName(t)} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-semibold text-[13px] text-[#0F0F0F] truncate">{getName(t)}</p>
                  {t.last_message && (
                    <span className="text-[11px] text-[#0F0F0F]/30 flex-shrink-0">{timeAgo(t.last_message.created_at)}</span>
                  )}
                </div>
                <p className="text-[12px] text-[#0F0F0F]/50 truncate">{t.last_message?.content ?? 'No messages'}</p>
              </div>
              {(t.unread_count ?? 0) > 0 && (
                <span className="w-5 h-5 bg-[#FFD60A] text-[#0F0F0F] text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {t.unread_count}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
