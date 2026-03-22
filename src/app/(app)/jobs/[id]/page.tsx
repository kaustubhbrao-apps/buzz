'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import CredibilityRating from '@/components/company/CredibilityRating';
import ApplyModal from '@/components/job/ApplyModal';
import { formatSalary, timeAgo } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { JobPost, PersonProfile, CompanyProfile } from '@/types/database';

export default function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<JobPost | null>(null);
  const [showApply, setShowApply] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/jobs/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setJob(data.job ?? null); setLoading(false); });
  }, [params.id]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-buzz-border rounded w-1/2" /><div className="h-4 bg-buzz-border rounded w-1/3" /></div>;
  if (!job) return <p className="text-center text-buzz-muted py-8">Job not found.</p>;

  const company = job.company as CompanyProfile | undefined;

  return (
    <div>
      <Link href="/jobs" className="inline-flex items-center gap-1 text-sm text-buzz-muted hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to jobs
      </Link>

      {/* Company header */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar src={company?.logo_url} name={company?.name ?? ''} size="lg" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{company?.name}</span>
            {company?.verified ? <Badge variant="verified">Verified</Badge> : <Badge variant="unverified">Unverified</Badge>}
          </div>
          {company && (
            <CredibilityRating score={company.credibility_score} responseRate={company.response_rate} totalHires={company.total_hires} />
          )}
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">{job.title}</h1>

      <div className="space-y-2 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {job.skills_required?.map((s) => <span key={s} className="chip bg-gray-100 text-buzz-text">{s}</span>)}
        </div>
        <p className="text-sm">📍 {job.location_type === 'remote' ? 'Remote' : `${job.location_type} · ${job.city}`}</p>
        <p className="text-sm">💰 {formatSalary(job.salary_min, job.salary_max)}</p>
        {job.experience_level && <p className="text-sm">📊 {job.experience_level}</p>}
        <p className="text-xs text-buzz-muted">{timeAgo(job.created_at)}</p>
      </div>

      <div className="card p-4 mb-4 border-l-4 border-buzz-yellow">
        <p className="font-medium text-sm mb-1">Show us:</p>
        <p className="text-sm text-buzz-muted">{job.proof_requirement}</p>
      </div>

      {job.description && <p className="text-sm mb-6">{job.description}</p>}

      {job.user_applied ? (
        <Button variant="secondary" disabled fullWidth>Applied ✓</Button>
      ) : (
        <Button onClick={() => setShowApply(true)} fullWidth>Apply with Work Wall</Button>
      )}

      {showApply && (
        <ApplyModal
          job={job}
          applicantProfile={{} as PersonProfile}
          isOpen
          onClose={() => setShowApply(false)}
          onSuccess={() => setJob((j) => j ? { ...j, user_applied: true } : j)}
        />
      )}
    </div>
  );
}
