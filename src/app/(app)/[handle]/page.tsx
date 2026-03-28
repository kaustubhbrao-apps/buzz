'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, UserPlus, UserCheck, MessageCircle, Loader2, Globe, Building2, Users, BadgeCheck, ExternalLink, ArrowLeft } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import BuzzScore from '@/components/buzz/BuzzScore';
import ScoreBand from '@/components/buzz/ScoreBand';
import PostCard from '@/components/post/PostCard';
import JobCard from '@/components/job/JobCard';
import CredibilityBadge from '@/components/company/CredibilityBadge';
import { COMPANY_SIZE_LABELS } from '@/lib/utils';
import type { PersonProfile, CompanyProfile, Post, JobPost, Endorsement } from '@/types/database';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const handle = params.handle as string;

  const [profileType, setProfileType] = useState<'person' | 'company'>('person');
  const [profile, setProfile] = useState<PersonProfile | CompanyProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
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
        setProfileType(data.profile_type ?? 'person');
        setProfile(data.profile);
        setPosts(data.posts ?? []);
        setJobs(data.jobs ?? []);
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
        body: JSON.stringify({
          following_id: profile.user_id,
          following_type: profileType,
        }),
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
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#0F0F0F]/30" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">🔍</p>
          <h1 className="text-xl font-bold text-[#0F0F0F] mb-1">Profile not found</h1>
          <p className="text-[13px] text-[#0F0F0F]/50">@{handle} doesn&apos;t exist yet.</p>
        </div>
      </div>
    );
  }

  if (profileType === 'company') {
    return <CompanyProfileView
      company={profile as CompanyProfile}
      posts={posts}
      jobs={jobs}
      isOwner={isOwner}
      isFollowing={isFollowing}
      followerCount={followerCount}
      followLoading={followLoading}
      toggleFollow={toggleFollow}
      router={router}
    />;
  }

  // Person profile
  const personProfile = profile as PersonProfile;
  const workPosts = posts.filter(p => p.post_type === 'work');

  return (
    <div>
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[13px] text-[#888] hover:text-[#0F0F0F] mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="card-static p-6 mb-4">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <Avatar src={personProfile.avatar_url} name={personProfile.full_name} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-[#0F0F0F]">{personProfile.full_name}</h1>
                <ScoreBand band={personProfile.score_band} />
              </div>
              <p className="text-[13px] text-[#0F0F0F]/40 mb-2">@{personProfile.handle}</p>
              {personProfile.headline && <p className="text-[14px] text-[#0F0F0F]/70 mb-3">{personProfile.headline}</p>}
              <div className="flex flex-wrap gap-3 text-[12px] text-[#0F0F0F]/50 mb-4">
                {personProfile.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{personProfile.city}</span>}
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Joined {new Date(personProfile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                <span>{followerCount} followers</span>
              </div>

              {personProfile.open_to.filter(t => t !== 'not_looking').length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {personProfile.open_to.filter(t => t !== 'not_looking').map(t => (
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
              <BuzzScore score={personProfile.buzz_score} band={personProfile.score_band} streak={personProfile.streak_count} monthlyDelta={0} />
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
                  {isOwner ? 'Share your first work to get started!' : `${personProfile.full_name} hasn't posted yet.`}
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
                {personProfile.streak_count > 0 && <p>{personProfile.streak_count} day streak 🔥</p>}
                <p>{endorsements.length} endorsements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Company Profile View                                                */
/* ------------------------------------------------------------------ */

function CompanyProfileView({
  company,
  posts,
  jobs,
  isOwner,
  isFollowing,
  followerCount,
  followLoading,
  toggleFollow,
  router,
}: {
  company: CompanyProfile;
  posts: Post[];
  jobs: JobPost[];
  isOwner: boolean;
  isFollowing: boolean;
  followerCount: number;
  followLoading: boolean;
  toggleFollow: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div>
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[13px] text-[#888] hover:text-[#0F0F0F] mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Cover + Logo */}
        <div className="card-static overflow-hidden mb-4">
          {/* Cover photo */}
          {company.cover_url ? (
            <div className="h-44 sm:h-52 overflow-hidden">
              <img src={company.cover_url} alt={`${company.name} cover`} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-44 sm:h-52 bg-gradient-to-br from-[#FFD60A]/40 via-[#FFD60A]/20 to-[#0F0F0F]/10" />
          )}

          <div className="px-6 pb-6">
            {/* Logo overlapping cover */}
            <div className="-mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl border-4 border-white bg-white overflow-hidden flex-shrink-0">
                <Avatar src={company.logo_url} name={company.name} size="xl" className="w-full h-full rounded-xl" />
              </div>
            </div>

            {/* Company name + badges */}
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-[#0F0F0F]">{company.name}</h1>
              {company.verified && <Badge variant="verified">Verified</Badge>}
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap gap-3 text-[12px] text-[#0F0F0F]/50 mb-3">
              {company.industry && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />{company.industry}
                </span>
              )}
              {company.size && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />{COMPANY_SIZE_LABELS[company.size]}
                </span>
              )}
              {company.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />{company.city}
                </span>
              )}
              <span>{followerCount} followers</span>
            </div>

            {/* Credibility badge inline */}
            <div className="mb-4">
              <CredibilityBadge score={company.credibility_score} responseRate={company.response_rate} totalHires={company.total_hires} size="sm" />
            </div>

            {/* Website link */}
            {company.website && (
              <a
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0F0F0F]/70 hover:text-[#0F0F0F] transition-colors mb-4"
              >
                <Globe className="w-3.5 h-3.5" />
                {company.website.replace(/^https?:\/\//, '')}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {isOwner ? (
                <>
                  <button onClick={() => router.push('/settings')} className="btn-secondary text-[12px] py-2">
                    Edit page
                  </button>
                  <button onClick={() => router.push('/jobs/post')} className="btn-primary text-[12px] py-2">
                    Post a job
                  </button>
                  <button onClick={() => router.push('/dashboard')} className="btn-secondary text-[12px] py-2">
                    Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={toggleFollow}
                    disabled={followLoading}
                    className={`text-[12px] py-2 flex items-center gap-1.5 ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {isFollowing ? (
                      <><UserCheck className="w-3.5 h-3.5" />Following</>
                    ) : (
                      <><UserPlus className="w-3.5 h-3.5" />Follow</>
                    )}
                  </button>
                  <button onClick={() => router.push('/messages')} className="btn-ghost text-[12px] flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />Message
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* About section */}
        {company.about && (
          <div className="card-static p-5 mb-4">
            <h2 className="text-[13px] font-bold text-[#0F0F0F] mb-2">About</h2>
            <p className="text-[14px] text-[#0F0F0F]/70 leading-relaxed whitespace-pre-wrap">{company.about}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          <div className="space-y-4">
            {/* Active Jobs */}
            {jobs.length > 0 && (
              <div>
                <h2 className="text-[13px] font-bold text-[#0F0F0F] mb-3">Active Jobs</h2>
                <div className="space-y-3">
                  {jobs.map(job => (
                    <Link key={job.id} href={`/jobs/${job.id}`} className="block">
                      <JobCard job={job} onApply={() => {}} userApplied={job.user_applied ?? false} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {jobs.length === 0 && isOwner && (
              <div className="card-static p-8 text-center">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-[14px] font-semibold text-[#0F0F0F] mb-1">No active jobs</p>
                <p className="text-[12px] text-[#0F0F0F]/40 mb-4">Post your first job to start receiving proof-based applications.</p>
                <button onClick={() => router.push('/jobs/post')} className="btn-primary text-[12px] py-2">Post a job</button>
              </div>
            )}

            {/* Posts */}
            {posts.length > 0 && (
              <div>
                <h2 className="text-[13px] font-bold text-[#0F0F0F] mb-3">Posts</h2>
                <div className="space-y-3">
                  {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {posts.length === 0 && (
              <div className="card-static p-8 text-center">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-[14px] font-semibold text-[#0F0F0F] mb-1">No posts yet</p>
                <p className="text-[12px] text-[#0F0F0F]/40">
                  {isOwner ? 'Share updates to build your company presence.' : `${company.name} hasn't posted yet.`}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-3">
            {/* Credibility Score Card */}
            <CredibilityBadge score={company.credibility_score} responseRate={company.response_rate} totalHires={company.total_hires} size="md" />

            <div className="card-static p-5">
              <h3 className="text-[11px] font-bold text-[#0F0F0F]/40 uppercase tracking-widest mb-3">Overview</h3>
              <div className="space-y-2 text-[12px] text-[#0F0F0F]/60">
                <p>{jobs.length} active jobs</p>
                <p>{posts.length} posts</p>
                <p>{followerCount} followers</p>
                {company.linkedin_url && (
                  <a
                    href={company.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#0F0F0F]/70 hover:text-[#0F0F0F] transition-colors"
                  >
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {company.verified && (
              <div className="card-static p-5">
                <div className="flex items-center gap-2 mb-2">
                  <BadgeCheck className="w-4 h-4 text-green-600" />
                  <h3 className="text-[11px] font-bold text-[#0F0F0F]/40 uppercase tracking-widest">Verified</h3>
                </div>
                <p className="text-[12px] text-[#0F0F0F]/50">
                  This company has been verified via {company.verification_method === 'domain' ? 'domain ownership' : 'LinkedIn'}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
