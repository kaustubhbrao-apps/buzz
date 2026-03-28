'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Image as ImageIcon, Video, Link2, PenLine, Loader2, X } from 'lucide-react';
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

  // Attachment state
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [attachmentType, setAttachmentType] = useState<'image' | 'video' | 'link' | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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

  const clearAttachment = () => {
    if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
    setAttachmentFile(null);
    setAttachmentPreview(null);
    setAttachmentType(null);
    setLinkUrl('');
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleFileSelect = (file: File, type: 'image' | 'video') => {
    if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
    setAttachmentFile(file);
    setAttachmentType(type);
    setAttachmentPreview(type === 'image' ? URL.createObjectURL(file) : null);
    setLinkUrl('');
  };

  const handlePost = async () => {
    if (!composeContent.trim() || posting) return;
    setPosting(true);
    try {
      let attachment_url: string | undefined;
      let attachment_type: string | undefined;

      // Upload file if present
      if (attachmentFile && (attachmentType === 'image' || attachmentType === 'video')) {
        const formData = new FormData();
        formData.append('file', attachmentFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) {
          setPosting(false);
          return;
        }
        const uploadData = await uploadRes.json();
        attachment_url = uploadData.url;
        attachment_type = uploadData.type;
      } else if (attachmentType === 'link' && linkUrl.trim()) {
        attachment_url = linkUrl.trim();
        attachment_type = 'link';
      }

      const post_type = (attachmentType === 'image' || attachmentType === 'video') ? 'work' : 'update';

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_type,
          content: composeContent.trim(),
          skills_tagged: [],
          ...(attachment_url && { attachment_url, attachment_type }),
        }),
      });
      if (res.ok) {
        setComposeContent('');
        setComposing(false);
        clearAttachment();
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

              {/* Attachment preview */}
              {attachmentType === 'image' && attachmentPreview && (
                <div className="relative inline-block">
                  <img src={attachmentPreview} alt="Preview" className="rounded-xl max-h-40 object-cover" />
                  <button onClick={clearAttachment} className="absolute top-1.5 right-1.5 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {attachmentType === 'video' && attachmentFile && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5F5F3] text-[12px] text-[#0F0F0F]/70">
                  <Video className="w-4 h-4 text-[#888]" />
                  <span className="truncate flex-1">{attachmentFile.name}</span>
                  <button onClick={clearAttachment} className="p-0.5 hover:bg-[#E0E0E0] rounded-full transition-colors">
                    <X className="w-3.5 h-3.5 text-[#888]" />
                  </button>
                </div>
              )}
              {attachmentType === 'link' && (
                <input
                  type="url"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  className="input text-[13px]"
                  placeholder="Paste a URL..."
                  autoFocus
                />
              )}

              {/* Toolbar + actions */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f, 'image'); }} />
                  <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f, 'video'); }} />
                  <button onClick={() => imageInputRef.current?.click()} className="btn-ghost p-2 text-[#888] hover:text-[#0F0F0F]" title="Add image">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => videoInputRef.current?.click()} className="btn-ghost p-2 text-[#888] hover:text-[#0F0F0F]" title="Add video">
                    <Video className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { if (attachmentType === 'link') { clearAttachment(); } else { clearAttachment(); setAttachmentType('link'); } }}
                    className={`btn-ghost p-2 transition-colors ${attachmentType === 'link' ? 'text-[#0F0F0F]' : 'text-[#888] hover:text-[#0F0F0F]'}`}
                    title="Add link"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setComposing(false); setComposeContent(''); clearAttachment(); }} className="btn-ghost text-[12px]">Cancel</button>
                  <button onClick={handlePost} disabled={!composeContent.trim() || posting} className="btn-primary py-2 px-4 text-[12px] disabled:opacity-50">
                    {posting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar src={profile?.avatar_url ?? null} name={profile?.full_name ?? 'You'} size="md" />
              <button onClick={() => setComposing(true)} className="flex-1 text-left px-4 py-2.5 rounded-full bg-[#F5F5F3] text-sm text-[#0F0F0F]/40 hover:bg-[#EEEEEC] transition-all">
                Share your work...
              </button>
              <button onClick={() => setComposing(true)} className="btn-primary py-2 px-4 text-[12px]">Post</button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#F0F0EE] rounded-2xl">
          {(['buzz', 'latest'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-[12px] font-semibold rounded-xl transition-all duration-150 ${
                tab === t ? 'bg-white text-[#0F0F0F] shadow-xs' : 'text-[#0F0F0F]/40 hover:text-[#0F0F0F]/60'
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
