'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Calendar, UserPlus, UserCheck, MessageCircle, Loader2 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import BuzzScore from '@/components/buzz/BuzzScore';
import ScoreBand from '@/components/buzz/ScoreBand';
import PostCard from '@/components/post/PostCard';
import type { PersonProfile, Post, Endorsement } from '@/types/database';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const handle = params.handle as string;

  const [profile, setProfile] = useState<PersonProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/profiles/${handle}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setProfile(data.profile);
        setPosts(data.posts ?? []);
        setEndorsements(data.endorsements ?? []);
        setIsOwner(data.is_owner);
        setIsFollowing(data.is_following);
        setFollowerCount(data.follower_count);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [handle]);

  const toggleFollow = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following_id: profile.user_id, following_type: 'person' }),
      });
      if (res.ok) {
        setIsFollowing(!isFollowing);
        setFollowerCount(c => isFollowing ? c - 1 : c + 1);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#0F0F0F]/30" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">🔍</p>
          <h1 className="text-xl font-bold text-[#0F0F0F] mb-1">Profile not found</h1>
          <p className="text-[13px] text-[#0F0F0F]/50">@{handle} doesn&apos;t exist yet.</p>
        </div>
      </div>
    );
  }

  const workPosts = posts.filter(p => p.post_type === 'work');

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-3xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="card-static p-6 mb-4">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-[#0F0F0F]">{profile.full_name}</h1>
                <ScoreBand band={profile.score_band} />
              </div>
              <p className="text-[13px] text-[#0F0F0F]/40 mb-2">@{profile.handle}</p>
              {profile.headline && <p className="text-[14px] text-[#0F0F0F]/70 mb-3">{profile.headline}</p>}
              <div className="flex flex-wrap gap-3 text-[12px] text-[#0F0F0F]/50 mb-4">
                {profile.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.city}</span>}
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                <span>{followerCount} followers</span>
              </div>

              {profile.open_to.filter(t => t !== 'not_looking').length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {profile.open_to.filter(t => t !== 'not_looking').map(t => (
                    <span key={t} className="chip bg-[#FFD60A]/15 text-[#0F0F0F]/70">{t.replace('_', ' ')}</span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                {isOwner ? (
                  <>
                    <button onClick={() => router.push('/settings')} className="btn-secondary text-[12px] py-2">Edit profile</button>
                  </>
                ) : (
                  <>
                    <button onClick={toggleFollow} disabled={followLoading}
                      className={`text-[12px] py-2 flex items-center gap-1.5 ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}>
                      {isFollowing ? <><UserCheck className="w-3.5 h-3.5" />Following</> : <><UserPlus className="w-3.5 h-3.5" />Follow</>}
                    </button>
                    <button onClick={() => router.push('/messages')} className="btn-ghost text-[12px] flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5" />Message
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <BuzzScore score={profile.buzz_score} band={profile.score_band} streak={profile.streak_count} monthlyDelta={0} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          <div className="space-y-4">
            {/* Work Wall */}
            {workPosts.length > 0 && (
              <div className="card-static p-5">
                <h2 className="text-[13px] font-bold text-[#0F0F0F] mb-3">Work Wall</h2>
                <div className="space-y-3">
                  {workPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {/* All posts */}
            {posts.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-[13px] font-bold text-[#0F0F0F]">All Posts</h2>
                {posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {posts.length === 0 && (
              <div className="card-static p-8 text-center">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-[14px] font-semibold text-[#0F0F0F] mb-1">No posts yet</p>
                <p className="text-[12px] text-[#0F0F0F]/40">
                  {isOwner ? 'Share your first work to get started!' : `${profile.full_name} hasn't posted yet.`}
                </p>
              </div>
            )}

            {/* Endorsements */}
            {endorsements.length > 0 && (
              <div className="card-static p-5">
                <h2 className="text-[13px] font-bold text-[#0F0F0F] mb-3">What people say</h2>
                <div className="space-y-3">
                  {endorsements.map((e) => (
                    <div key={e.id} className="bg-[#FAF9F7] rounded-xl p-4">
                      <p className="text-[13px] text-[#0F0F0F]/70 italic mb-2">&ldquo;{e.content}&rdquo;</p>
                      <p className="text-[11px] font-semibold text-[#0F0F0F]/50">— {e.author?.full_name ?? 'Anonymous'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity sidebar */}
          <div className="hidden lg:block space-y-3">
            <div className="card-static p-5">
              <h3 className="text-[11px] font-bold text-[#0F0F0F]/40 uppercase tracking-widest mb-3">Activity</h3>
              <div className="space-y-2 text-[12px] text-[#0F0F0F]/60">
                <p>{posts.length} posts</p>
                <p>{workPosts.length} work posts</p>
                {profile.streak_count > 0 && <p>{profile.streak_count} day streak 🔥</p>}
                <p>{endorsements.length} endorsements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
