'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { formatSalary, timeAgo } from '@/lib/utils';
import { ArrowLeft, MapPin, Banknote, Clock, BarChart3, Check, Loader2 } from 'lucide-react';
import type { JobPost, CompanyProfile } from '@/types/database';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then(r => {
        if (!r.ok) { setLoading(false); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setJob(data.job);
        setApplied(data.job.user_applied ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [jobId]);

  const handleApply = async () => {
    setApplying(true);
    setApplyError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setApplied(true);
      } else {
        const data = await res.json();
        setApplyError(data.error || 'Failed to apply.');
      }
    } catch {
      setApplyError('Something went wrong.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#0F0F0F]/30" />
      </div>
    );
  }

  if (!job) return <div className="text-center py-16"><p className="text-[#0F0F0F]/40">Job not found.</p></div>;

  const company = job.company as CompanyProfile;

  return (
    <div className="max-w-2xl">
      <Link href="/jobs" className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0F0F0F]/40 hover:text-[#0F0F0F] mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to jobs
      </Link>

      <div className="card-static p-6 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <Link href={`/${company.handle}`}>
            <Avatar src={company.logo_url} name={company.name} size="lg" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/${company.handle}`} className="font-bold text-[15px] text-[#0F0F0F] hover:underline">{company.name}</Link>
              {company.verified && <Badge variant="verified">Verified</Badge>}
            </div>
            <p className="text-[12px] text-[#0F0F0F]/50">⭐ {company.credibility_score.toFixed(1)} · {company.response_rate}% response · {company.total_hires} hires on Buzz</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#0F0F0F] mb-4">{job.title}</h1>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills_required.map(s => <span key={s} className="chip bg-[#F5F5F5] text-[#0F0F0F]/60">{s}</span>)}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-[#F5F5F5] rounded-xl p-3">
            <MapPin className="w-4 h-4 text-[#0F0F0F]/30 mb-1" />
            <p className="text-[12px] font-semibold text-[#0F0F0F]">{job.location_type === 'remote' ? 'Remote' : `${job.location_type} · ${job.city}`}</p>
          </div>
          <div className="bg-[#F5F5F5] rounded-xl p-3">
            <Banknote className="w-4 h-4 text-[#0F0F0F]/30 mb-1" />
            <p className="text-[12px] font-semibold text-[#0F0F0F]">{formatSalary(job.salary_min, job.salary_max)}</p>
          </div>
          <div className="bg-[#F5F5F5] rounded-xl p-3">
            <BarChart3 className="w-4 h-4 text-[#0F0F0F]/30 mb-1" />
            <p className="text-[12px] font-semibold text-[#0F0F0F]">{job.experience_level ?? 'Any level'}</p>
          </div>
          <div className="bg-[#F5F5F5] rounded-xl p-3">
            <Clock className="w-4 h-4 text-[#0F0F0F]/30 mb-1" />
            <p className="text-[12px] font-semibold text-[#0F0F0F]">{timeAgo(job.created_at)}</p>
          </div>
        </div>

        <div className="bg-[#FFD60A]/10 rounded-2xl p-5 mb-5">
          <p className="text-[11px] font-bold text-[#0F0F0F]/50 uppercase tracking-wider mb-1">Show us</p>
          <p className="text-[14px] text-[#0F0F0F]/80">{job.proof_requirement}</p>
        </div>

        {job.description && <p className="text-[14px] text-[#0F0F0F]/70 leading-relaxed mb-5">{job.description}</p>}

        {job.deadline && (
          <p className="text-[12px] text-[#0F0F0F]/40 mb-3">
            Deadline: {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}

        <p className="text-[12px] text-[#0F0F0F]/40 mb-5">{job.application_count} people have applied</p>

        {applyError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-[13px] text-red-700">{applyError}</p>
          </div>
        )}

        {applied ? (
          <button className="btn-secondary w-full py-3 flex items-center justify-center gap-2" disabled>
            <Check className="w-4 h-4" /> Applied
          </button>
        ) : (
          <button
            onClick={handleApply}
            disabled={applying}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {applying && <Loader2 className="w-4 h-4 animate-spin" />}
            {applying ? 'Applying...' : 'Apply with Work Wall'}
          </button>
        )}
      </div>
    </div>
  );
}
