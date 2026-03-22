'use client';

import { useEffect, useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import ScoreBand from '@/components/buzz/ScoreBand';
import Button from '@/components/ui/Button';
import OpenToChips from '@/components/profile/OpenToChips';
import Link from 'next/link';
import type { PersonProfile } from '@/types/database';

export default function DiscoverPage() {
  const [query, setQuery] = useState('');
  const [profiles, setProfiles] = useState<PersonProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set('q', query);

      const res = await fetch(`/api/profiles/person?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles ?? []);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Discover</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Find React developers who've shipped a live product..."
        className="input mb-6"
      />

      {/* Spotlight */}
      <section className="mb-8">
        <h2 className="font-semibold mb-3">🔥 This week&apos;s spotlight</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {profiles.slice(0, 5).map((p) => (
            <Link
              key={p.id}
              href={`/${p.handle}`}
              className="card p-4 min-w-[200px] flex-shrink-0 hover:shadow-lg transition-shadow"
            >
              <Avatar src={p.avatar_url} name={p.full_name} size="lg" className="mx-auto mb-2" />
              <p className="font-medium text-sm text-center">{p.full_name}</p>
              <p className="text-xs text-buzz-muted text-center">{p.city}</p>
              <div className="flex justify-center mt-1">
                <ScoreBand band={p.score_band} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Results */}
      <section>
        {loading ? (
          <p className="text-buzz-muted text-sm">Searching...</p>
        ) : profiles.length === 0 ? (
          <p className="text-buzz-muted text-center py-8">No results. Try removing a filter.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profiles.map((p) => (
              <div key={p.id} className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar src={p.avatar_url} name={p.full_name} />
                  <div>
                    <Link href={`/${p.handle}`} className="font-medium text-sm hover:underline">{p.full_name}</Link>
                    <p className="text-xs text-buzz-muted">@{p.handle} · {p.city}</p>
                  </div>
                  <ScoreBand band={p.score_band} />
                </div>
                <OpenToChips openTo={p.open_to} />
                <div className="flex gap-2 mt-3">
                  <Button size="sm">Connect</Button>
                  <Link href={`/${p.handle}`}>
                    <Button variant="secondary" size="sm">View Profile</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
