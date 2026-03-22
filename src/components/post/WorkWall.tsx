'use client';

import { useState } from 'react';
import PostAttachment from './PostAttachment';
import Button from '@/components/ui/Button';
import type { Post } from '@/types/database';

interface WorkWallProps {
  posts: Post[];
  isOwner: boolean;
  emptyState?: React.ReactNode;
}

export default function WorkWall({ posts, isOwner, emptyState }: WorkWallProps) {
  const [visibleCount, setVisibleCount] = useState(9);
  const visible = posts.slice(0, visibleCount);

  if (posts.length === 0) {
    if (emptyState) return <>{emptyState}</>;
    if (isOwner) {
      return (
        <div className="text-center py-12">
          <p className="text-buzz-muted mb-2">Your Work Wall is empty.</p>
          <p className="text-buzz-muted text-sm mb-4">
            Post your first project to start building your score.
          </p>
          <a href="/feed" className="btn-primary inline-block text-sm">
            Post your first work →
          </a>
        </div>
      );
    }
    return <p className="text-center text-buzz-muted py-8">No posts yet.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {visible.map((post) => (
          <div
            key={post.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-buzz-border group cursor-pointer"
          >
            {post.attachment_url && post.attachment_type ? (
              <div className="w-full h-full">
                <PostAttachment url={post.attachment_url} type={post.attachment_type} />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-2">
                <p className="text-xs text-buzz-muted line-clamp-4 text-center">
                  {post.content}
                </p>
              </div>
            )}

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white text-xs text-center">
                {post.skills_tagged?.slice(0, 2).map((s) => (
                  <span key={s} className="chip bg-white/20 text-white mr-1 mb-1">{s}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length > visibleCount && (
        <div className="text-center mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setVisibleCount((p) => p + 9)}
          >
            Load more work
          </Button>
        </div>
      )}
    </div>
  );
}
