'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Share2, Bookmark } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import ScoreBand from '@/components/buzz/ScoreBand';
import PostAttachment from './PostAttachment';
import ReactionBar from './ReactionBar';
import { timeAgo } from '@/lib/utils';
import type { Post, PersonProfile, CompanyProfile, ReactionType } from '@/types/database';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [saved, setSaved] = useState(post.is_saved ?? false);
  const [reactionCounts, setReactionCounts] = useState(
    post.reaction_counts ?? { inspired: 0, learned: 0, collab: 0, hire: 0 }
  );
  const [userReaction, setUserReaction] = useState<ReactionType | null>(post.user_reaction ?? null);
  const [expanded, setExpanded] = useState(false);

  const author = post.author as PersonProfile | CompanyProfile | undefined;
  const isPerson = post.author_type === 'person';
  const name = isPerson
    ? (author as PersonProfile)?.full_name
    : (author as CompanyProfile)?.name;
  const handle = isPerson
    ? (author as PersonProfile)?.handle
    : (author as CompanyProfile)?.handle;
  const avatar = isPerson
    ? (author as PersonProfile)?.avatar_url
    : (author as CompanyProfile)?.logo_url;

  const handleReact = async (type: ReactionType) => {
    const isUnreact = userReaction === type;

    setReactionCounts((prev) => ({
      ...prev,
      ...(userReaction ? { [userReaction]: prev[userReaction] - 1 } : {}),
      ...(isUnreact ? {} : { [type]: prev[type] + 1 }),
    }));
    setUserReaction(isUnreact ? null : type);

    await fetch(`/api/posts/${post.id}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reaction_type: type }),
    });
  };

  const handleSave = async () => {
    setSaved(!saved);
    await fetch(`/api/posts/${post.id}/save`, { method: 'POST' });
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
  };

  const content = post.content ?? '';
  const isLong = content.length > 300;

  return (
    <div className="card p-4">
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        <Link href={`/${handle}`}>
          <Avatar src={avatar} name={name ?? 'User'} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/${handle}`} className="font-semibold text-sm truncate hover:underline">
              {name}
            </Link>
            {isPerson && (author as PersonProfile)?.score_band && (
              <ScoreBand band={(author as PersonProfile).score_band} showLabel={false} />
            )}
          </div>
          <p className="text-xs text-buzz-muted">
            @{handle} · {timeAgo(post.created_at)}
          </p>
        </div>
      </div>

      {/* Content */}
      {content && (
        <div className="mb-3">
          <p className={`text-sm whitespace-pre-wrap ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
            {content}
          </p>
          {isLong && !expanded && (
            <button onClick={() => setExpanded(true)} className="text-sm text-buzz-muted hover:underline">
              read more
            </button>
          )}
        </div>
      )}

      {/* Attachment */}
      {post.attachment_url && post.attachment_type && (
        <div className="mb-3">
          <PostAttachment url={post.attachment_url} type={post.attachment_type} />
        </div>
      )}

      {/* Skills tagged */}
      {post.skills_tagged?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.skills_tagged.map((skill) => (
            <span key={skill} className="chip border border-buzz-yellow text-buzz-dark text-[11px]">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Reactions */}
      <ReactionBar
        postId={post.id}
        reactionCounts={reactionCounts}
        userReaction={userReaction}
        onReact={handleReact}
      />

      {/* Footer */}
      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-buzz-border">
        <button className="btn-ghost text-xs flex items-center gap-1">
          <MessageSquare className="w-4 h-4" />
          {post.comment_count ?? 0}
        </button>
        <button onClick={handleShare} className="btn-ghost text-xs flex items-center gap-1">
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button
          onClick={handleSave}
          className="btn-ghost text-xs flex items-center gap-1 ml-auto"
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-buzz-yellow text-buzz-yellow' : ''}`} />
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}
