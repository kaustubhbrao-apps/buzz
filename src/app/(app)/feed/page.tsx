'use client';

import { useCallback, useEffect, useState } from 'react';
import FeedTabs from '@/components/feed/FeedTabs';
import FeedEmpty from '@/components/feed/FeedEmpty';
import PostCard from '@/components/post/PostCard';
import PostCreate from '@/components/post/PostCreate';
import { SkeletonCard } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import type { Post } from '@/types/database';

export default function FeedPage() {
  const [tab, setTab] = useState<'buzz' | 'latest'>('buzz');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (reset = false) => {
    setLoading(true);
    const params = new URLSearchParams({ tab, limit: '20' });
    if (!reset && cursor) params.set('cursor', cursor);

    const res = await fetch(`/api/posts?${params}`);
    const data = await res.json();

    if (reset) {
      setPosts(data.posts ?? []);
    } else {
      setPosts((prev) => [...prev, ...(data.posts ?? [])]);
    }
    setCursor(data.nextCursor ?? null);
    setHasMore(!!data.nextCursor);
    setLoading(false);
  }, [tab, cursor]);

  useEffect(() => {
    setCursor(null);
    fetchPosts(true);
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {/* Create bar */}
      <button
        onClick={() => setShowCreate(true)}
        className="card w-full p-4 text-left text-buzz-muted text-sm mb-4 hover:shadow-lg transition-shadow"
      >
        Share your work...
      </button>

      {showCreate && (
        <PostCreate
          onClose={() => setShowCreate(false)}
          onSuccess={() => fetchPosts(true)}
          authorProfile={{} as never}
        />
      )}

      <FeedTabs activeTab={tab} onChange={setTab} />

      <div className="space-y-4 mt-4">
        {loading && posts.length === 0 ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : posts.length === 0 ? (
          <FeedEmpty tab={tab} />
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {hasMore && (
              <div className="text-center">
                <Button variant="secondary" size="sm" onClick={() => fetchPosts()} loading={loading}>
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
