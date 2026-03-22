import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileHeader from '@/components/profile/ProfileHeader';
import SkillsSection from '@/components/profile/SkillsSection';
import WorkWall from '@/components/post/WorkWall';
import EndorsementsSection from '@/components/profile/EndorsementsSection';
import CompanyHeader from '@/components/company/CompanyHeader';
import type { Metadata } from 'next';

interface Props {
  params: { handle: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data: person } = await supabase
    .from('person_profiles')
    .select('full_name, headline')
    .eq('handle', params.handle)
    .single();

  if (person) {
    return {
      title: `${person.full_name} — Buzz`,
      description: person.headline ?? `${person.full_name} on Buzz`,
      openGraph: { title: `${person.full_name} — Buzz`, description: person.headline ?? '' },
    };
  }

  const { data: company } = await supabase
    .from('company_profiles')
    .select('name, about')
    .eq('handle', params.handle)
    .single();

  if (company) {
    return {
      title: `${company.name} — Buzz`,
      description: company.about ?? `${company.name} on Buzz`,
    };
  }

  return { title: 'Profile — Buzz' };
}

export default async function ProfilePage({ params }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Try person profile
  const { data: person } = await supabase
    .from('person_profiles')
    .select('*')
    .eq('handle', params.handle)
    .single();

  if (person) {
    const isOwner = user?.id === person.user_id;

    // Fetch related data
    const [skillsRes, postsRes, endorsementsRes, connectionRes, followRes] = await Promise.all([
      supabase
        .from('person_skills')
        .select('skill_id, skills(*)')
        .eq('person_id', person.id),
      supabase
        .from('posts')
        .select('*')
        .eq('author_id', person.user_id)
        .eq('post_type', 'work')
        .order('created_at', { ascending: false }),
      supabase
        .from('endorsements')
        .select('*, author:person_profiles!endorsements_author_id_fkey(*)')
        .eq('recipient_id', person.id)
        .order('created_at', { ascending: false }),
      user
        ? supabase
            .from('connections')
            .select('status')
            .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .or(`requester_id.eq.${person.user_id},recipient_id.eq.${person.user_id}`)
            .eq('status', 'accepted')
            .limit(1)
        : { data: [] },
      user
        ? supabase
            .from('follows')
            .select('follower_id')
            .eq('follower_id', user.id)
            .eq('following_id', person.user_id)
            .limit(1)
        : { data: [] },
    ]);

    const skills = (skillsRes.data ?? []).map((ps: Record<string, unknown>) => ps.skills).filter(Boolean);
    const posts = postsRes.data ?? [];
    const endorsements = endorsementsRes.data ?? [];
    const isConnected = (connectionRes.data?.length ?? 0) > 0;
    const isFollowing = (followRes.data?.length ?? 0) > 0;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <ProfileHeader
          profile={person}
          isOwner={isOwner}
          isConnected={isConnected}
          isFollowing={isFollowing}
        />
        <SkillsSection skills={skills as never[]} personId={person.id} isOwner={isOwner} />
        <div>
          <h3 className="font-semibold mb-3">Work Wall</h3>
          <WorkWall posts={posts} isOwner={isOwner} />
        </div>
        <EndorsementsSection endorsements={endorsements as never[]} isOwner={isOwner} />
      </div>
    );
  }

  // Try company profile
  const { data: company } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('handle', params.handle)
    .single();

  if (company) {
    const isAdmin = user?.id === company.user_id;

    const { count: followerCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', company.user_id);

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="card p-6">
          <CompanyHeader
            company={company}
            isAdmin={isAdmin}
            followerCount={followerCount ?? 0}
          />
        </div>
        {company.about && (
          <div className="card p-6 mt-4">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm">{company.about}</p>
          </div>
        )}
      </div>
    );
  }

  notFound();
}
