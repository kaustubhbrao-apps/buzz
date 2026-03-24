'use client';

import { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon, Video, Link2, PenLine, Loader2 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import PostCard from '@/components/post/PostCard';
import BuzzScore from '@/components/buzz/BuzzScore';
import type { Post, PersonProfile } from '@/types/database';

export default function FeedPage() {
  const [tab, setTab] = useState<'buzz' | 'latest'>('buzz');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [profile, setProfile] = useState<PersonProfile | null>(null);

  // Compose state
  const [composing, setComposing] = useState(false);
  const [composeContent, setComposeContent] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchPosts = useCallback(async (cursor?: string) => {
    const params = new URLSearchParams({ tab, limit: '20' });
    if (cursor) params.set('cursor', cursor);

    const res = await fetch(`/api/posts?${params}`);
    if (!res.ok) return { posts: [], nextCursor: null };
    return res.json();
  }, [tab]);

  // Load profile
  useEffect(() => {
    fetch('/api/profiles/person')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.profile) setProfile(d.profile); })
      .catch(() => {});
  }, []);

  // Load posts when tab changes
  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setNextCursor(null);
    fetchPosts().then(data => {
      setPosts(data.posts ?? []);
      setNextCursor(data.nextCursor ?? null);
      setLoading(false);
    });
  }, [fetchPosts]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    const data = await fetchPosts(nextCursor);
    setPosts(p => [...p, ...(data.posts ?? [])]);
    setNextCursor(data.nextCursor ?? null);
    setLoadingMore(false);
  };

  const handlePost = async () => {
    if (!composeContent.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_type: 'update',
          content: composeContent.trim(),
          skills_tagged: [],
        }),
      });
      if (res.ok) {
        setComposeContent('');
        setComposing(false);
        // Refresh feed
        const data = await fetchPosts();
        setPosts(data.posts ?? []);
        setNextCursor(data.nextCursor ?? null);
      }
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      <div className="space-y-3 min-w-0">
        {/* Compose */}
        <div className="card-static p-4">
          {composing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar src={profile?.avatar_url ?? null} name={profile?.full_name ?? 'You'} size="md" />
                <p className="text-[13px] font-semibold text-[#0F0F0F]">{profile?.full_name ?? 'You'}</p>
              </div>
              <textarea
                value={composeContent}
                onChange={e => setComposeContent(e.target.value)}
                className="input min-h-[100px] resize-none"
                placeholder="What did you build? What are you working on?"
                autoFocus
              />
              <div className="flex justify-between items-center">
                <button onClick={() => { setComposing(false); setComposeContent(''); }} className="btn-ghost text-[12px]">Cancel</button>
                <button onClick={handlePost} disabled={!composeContent.trim() || posting} className="btn-primary py-2 px-4 text-[12px] disabled:opacity-50">
                  {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar src={profile?.avatar_url ?? null} name={profile?.full_name ?? 'You'} size="md" />
              <button onClick={() => setComposing(true)} className="flex-1 text-left px-4 py-2.5 rounded-full bg-[#F5F5F5] text-sm text-[#0F0F0F]/40 hover:bg-[#EBEBEB] transition-all">
                Share your work...
              </button>
              <button onClick={() => setComposing(true)} className="btn-primary py-2 px-4 text-[12px]">Post</button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#F0F0F0] rounded-2xl">
          {(['buzz', 'latest'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-[12px] font-semibold rounded-xl transition-all duration-150 ${
                tab === t ? 'bg-white text-[#0F0F0F] shadow-sm' : 'text-[#0F0F0F]/40 hover:text-[#0F0F0F]/60'
              }`}>
              {t === 'buzz' ? '⚡ Buzz Feed' : '📅 Latest'}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#0F0F0F]/30" />
          </div>
        )}

        {/* Empty state */}
        {!loading && posts.length === 0 && (
          <div className="card-static p-8 text-center">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-[14px] font-semibold text-[#0F0F0F] mb-1">No posts yet</p>
            <p className="text-[12px] text-[#0F0F0F]/40">
              {tab === 'latest' ? 'Follow people to see their posts here.' : 'Be the first to share your work!'}
            </p>
          </div>
        )}

        {/* Posts */}
        {posts.map((post, i) => (
          <div key={post.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
            <PostCard post={post} />
          </div>
        ))}

        {/* Load more */}
        {nextCursor && !loading && (
          <button onClick={loadMore} disabled={loadingMore} className="w-full py-3 text-[12px] font-semibold text-[#0F0F0F]/40 hover:text-[#0F0F0F] transition-colors">
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        )}
      </div>

      {/* Right sidebar — sticky */}
      <div className="hidden lg:block">
        <div className="sticky top-5 space-y-3">
          {profile && (
            <div className="card-static p-5">
              <BuzzScore score={profile.buzz_score} band={profile.score_band} streak={profile.streak_count} monthlyDelta={0} showGrowCTA />
            </div>
          )}

          <div className="card-static p-5">
            <h3 className="text-[11px] font-bold text-[#0F0F0F]/40 uppercase tracking-widest mb-4">Trending</h3>
            {['React', 'AI/ML', 'Figma', 'Next.js', 'Python'].map((s, i) => (
              <div key={s} className="flex items-center gap-3 py-2 cursor-pointer group">
                <span className="text-[11px] text-[#0F0F0F]/20 font-mono w-3">{i + 1}</span>
                <span className="text-[13px] text-[#0F0F0F]/70 group-hover:text-[#0F0F0F] font-medium transition-colors">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
