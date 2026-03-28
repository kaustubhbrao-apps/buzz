'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import ScoreBand from '@/components/buzz/ScoreBand';
import { Loader2 } from 'lucide-react';
import type { PersonProfile } from '@/types/database';

export default function DiscoverPage() {
  const [q, setQ] = useState('');
  const [profiles, setProfiles] = useState<PersonProfile[]>([]);
  const [spotlight, setSpotlight] = useState<PersonProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followLoading, setFollowLoading] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (query) params.set('q', query);
      const res = await fetch(`/api/discover?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles ?? []);
        if (data.spotlight) setSpotlight(data.spotlight);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { search(''); }, [search]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => search(q), 300);
    return () => clearTimeout(timeout);
  }, [q, search]);

  const toggleFollow = async (userId: string) => {
    setFollowLoading(userId);
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following_id: userId, following_type: 'person' }),
      });
      if (res.ok) {
        setFollowingIds(prev => {
          const next = new Set(prev);
          if (next.has(userId)) next.delete(userId); else next.add(userId);
          return next;
        });
      }
    } finally {
      setFollowLoading(null);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-[#0F0F0F] mb-1">Discover</h1>
      <p className="text-[13px] text-[#0F0F0F]/50 mb-5">Find talent by skill, city, or work.</p>

      <input value={q} onChange={e => setQ(e.target.value)} className="input mb-6" placeholder="Search people, skills, cities..." />

      {/* Spotlight */}
      {!q && spotlight.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[13px] font-bold text-[#0F0F0F] mb-3">⚡ This week&apos;s spotlight</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {spotlight.map(p => (
              <Link key={p.id} href={`/${p.handle}`} className="card-static p-4 min-w-[160px] text-center flex-shrink-0 hover:shadow-md transition-all">
                <Avatar src={p.avatar_url} name={p.full_name} size="lg" className="mx-auto mb-2" />
                <p className="text-[12px] font-semibold text-[#0F0F0F] truncate">{p.full_name}</p>
                <p className="text-[11px] text-[#0F0F0F]/40 truncate">{p.city}</p>
                <div className="flex justify-center mt-1"><ScoreBand band={p.score_band} /></div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <h2 className="text-[13px] font-bold text-[#0F0F0F] mb-3">
        {q ? `Results for "${q}"` : 'All people'}
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#0F0F0F]/30" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="card-static p-8 text-center">
          <p className="text-[13px] text-[#0F0F0F]/40">No people found{q ? ` for "${q}"` : ''}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {profiles.map(p => (
            <div key={p.id} className="card-static p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar src={p.avatar_url} name={p.full_name} size="md" />
                <div className="min-w-0">
                  <Link href={`/${p.handle}`} className="text-[13px] font-semibold text-[#0F0F0F] hover:underline truncate block">{p.full_name}</Link>
                  <p className="text-[11px] text-[#0F0F0F]/40 truncate">{p.headline}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ScoreBand band={p.score_band} />
                  <span className="text-[11px] text-[#0F0F0F]/30">{p.city}</span>
                </div>
                <button
                  onClick={() => toggleFollow(p.user_id)}
                  disabled={followLoading === p.user_id}
                  className={`text-[11px] font-bold rounded-full px-3 py-1 transition-all active:scale-95 ${
                    followingIds.has(p.user_id)
                      ? 'bg-[#F5F5F3] text-[#0F0F0F]/50 border border-[#EAEAE8]'
                      : 'text-[#0F0F0F] bg-[#FFD60A] hover:bg-[#FFC800]'
                  }`}>
                  {followingIds.has(p.user_id) ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
