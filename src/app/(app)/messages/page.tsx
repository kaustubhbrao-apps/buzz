'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Tabs from '@/components/ui/Tabs';
import Avatar from '@/components/ui/Avatar';
import { timeAgo } from '@/lib/utils';
import type { MessageThread, PersonProfile, CompanyProfile } from '@/types/database';

export default function MessagesPage() {
  const [tab, setTab] = useState('all');
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/messages')
      .then((r) => r.json())
      .then((data) => { setThreads(data.threads ?? []); setLoading(false); });
  }, []);

  const filtered = threads.filter((t) => {
    if (tab === 'requests') return t.thread_type === 'direct';
    if (tab === 'jobs') return t.thread_type === 'job_application';
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Messages</h1>

      <Tabs
        tabs={[
          { id: 'all', label: 'All' },
          { id: 'requests', label: 'Requests' },
          { id: 'jobs', label: 'Job threads' },
        ]}
        activeTab={tab}
        onChange={setTab}
      />

      <div className="mt-4">
        {loading ? (
          <p className="text-buzz-muted text-sm py-8 text-center">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-buzz-muted text-center py-8">No messages yet.</p>
        ) : (
          filtered.map((thread) => {
            const other = thread.other_participant as PersonProfile | CompanyProfile | undefined;
            const name = other
              ? 'full_name' in other ? other.full_name : other.name
              : 'User';
            const avatar = other
              ? 'avatar_url' in other ? other.avatar_url : other.logo_url
              : null;

            return (
              <Link
                key={thread.id}
                href={`/messages/${thread.id}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-buzz-border transition-colors"
              >
                <Avatar src={avatar} name={name} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{name}</p>
                  {thread.last_message && (
                    <p className="text-xs text-buzz-muted truncate">{thread.last_message.content}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px] text-buzz-muted">{timeAgo(thread.updated_at)}</p>
                  {(thread.unread_count ?? 0) > 0 && (
                    <span className="inline-block bg-buzz-yellow text-buzz-dark text-[10px] rounded-full w-5 h-5 leading-5 text-center mt-1">
                      {thread.unread_count}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
