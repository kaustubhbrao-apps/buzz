'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Repeat2, Bookmark, MoreHorizontal } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import ScoreBand from '@/components/buzz/ScoreBand';
import PostAttachment from './PostAttachment';
import { timeAgo, REACTION_CONFIG } from '@/lib/utils';
import type { Post, PersonProfile, CompanyProfile, ReactionType } from '@/types/database';

const REACTIONS: ReactionType[] = ['inspired', 'learned', 'collab', 'hire'];

export default function PostCard({ post }: { post: Post }) {
  const [saved, setSaved] = useState(post.is_saved ?? false);
  const [counts, setCounts] = useState(post.reaction_counts ?? { inspired: 0, learned: 0, collab: 0, hire: 0 });
  const [active, setActive] = useState<ReactionType | null>(post.user_reaction ?? null);
  const [expanded, setExpanded] = useState(false);

  const author = post.author as PersonProfile | CompanyProfile | undefined;
  const isPerson = post.author_type === 'person';
  const name = isPerson ? (author as PersonProfile)?.full_name : (author as CompanyProfile)?.name;
  const handle = isPerson ? (author as PersonProfile)?.handle : (author as CompanyProfile)?.handle;
  const avatar = isPerson ? (author as PersonProfile)?.avatar_url : (author as CompanyProfile)?.logo_url;
  const headline = isPerson ? (author as PersonProfile)?.headline : null;
  const isWork = post.post_type === 'work';

  const react = async (type: ReactionType) => {
    const un = active === type;
    setCounts(p => ({ ...p, ...(active ? { [active]: p[active] - 1 } : {}), ...(un ? {} : { [type]: p[type] + 1 }) }));
    setActive(un ? null : type);
    try {
      await fetch(`/api/posts/${post.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction_type: type }),
      });
    } catch {}
  };

  const toggleSave = async () => {
    setSaved(!saved);
    try {
      await fetch(`/api/posts/${post.id}/save`, { method: 'POST' });
    } catch {}
  };

  const content = post.content ?? '';
  const isLong = content.length > 280;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <article className="card-static overflow-hidden">
      {isWork && <div className="h-0.5 bg-[#FFD60A]" />}

      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/${handle}`}><Avatar src={avatar} name={name ?? 'U'} size="md" /></Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link href={`/${handle}`} className="font-semibold text-[13px] text-[#0F0F0F] hover:underline truncate">{name}</Link>
              {isPerson && (author as PersonProfile)?.score_band && <ScoreBand band={(author as PersonProfile).score_band} showLabel={false} />}
              {isWork && <span className="chip bg-[#FFD60A] text-[#0F0F0F]">work</span>}
            </div>
            <p className="text-[12px] text-[#888]">{headline && `${headline} · `}{timeAgo(post.created_at)}</p>
          </div>
          <button className="text-[#0F0F0F]/20 hover:text-[#0F0F0F]/50 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {content && (
          <div className="mb-4">
            <p className={`text-[14px] leading-[1.75] text-[#1a1a1a] whitespace-pre-wrap ${!expanded && isLong ? 'line-clamp-4' : ''}`}>{content}</p>
            {isLong && !expanded && (
              <button onClick={() => setExpanded(true)} className="text-[13px] font-semibold text-[#0F0F0F] mt-1">more</button>
            )}
          </div>
        )}

        {post.skills_tagged?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.skills_tagged.map((s) => (
              <span key={s} className="chip bg-[#F5F5F5] text-[#0F0F0F]/60">{s}</span>
            ))}
          </div>
        )}
      </div>

      {post.attachment_url && post.attachment_type && <PostAttachment url={post.attachment_url} type={post.attachment_type} />}

      {(total > 0 || (post.comment_count ?? 0) > 0) && (
        <div className="px-5 py-2 flex items-center justify-between text-[11px] text-[#0F0F0F]/40">
          <span>{total > 0 && `${total} reactions`}</span>
          <div className="flex gap-3">
            {(post.comment_count ?? 0) > 0 && <span>{post.comment_count} comments</span>}
          </div>
        </div>
      )}

      <div className="px-3 py-2 border-t border-[#F0F0F0]">
        <div className="flex items-center">
          {REACTIONS.map((type) => {
            const c = REACTION_CONFIG[type];
            const isOn = active === type;
            return (
              <button key={type} onClick={() => react(type)} title={c.label}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                  isOn ? 'text-[#0F0F0F] bg-[#FFD60A]/20' : 'text-[#666] hover:text-[#0F0F0F] hover:bg-[#F5F5F5]'
                }`}>
                <span className="text-base">{c.emoji}</span>
                <span className="hidden sm:inline text-[12px]">{c.label}</span>
                {counts[type] > 0 && <span className="text-[11px] font-semibold opacity-60">{counts[type]}</span>}
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-0.5">
            <button className="p-2.5 rounded-xl text-[#888] hover:text-[#0F0F0F] hover:bg-[#F5F5F5] transition-all">
              <MessageCircle className="w-[18px] h-[18px]" />
            </button>
            <button className="p-2.5 rounded-xl text-[#888] hover:text-[#0F0F0F] hover:bg-[#F5F5F5] transition-all">
              <Repeat2 className="w-[18px] h-[18px]" />
            </button>
            <button onClick={toggleSave}
              className={`p-2.5 rounded-xl transition-all ${saved ? 'text-[#FFD60A]' : 'text-[#888] hover:text-[#0F0F0F] hover:bg-[#F5F5F5]'}`}>
              <Bookmark className={`w-[18px] h-[18px] ${saved ? 'fill-[#FFD60A]' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
