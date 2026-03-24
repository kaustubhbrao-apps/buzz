'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { formatSalary, timeAgo } from '@/lib/utils';
import { ArrowLeft, MapPin, Banknote, Clock, BarChart3, Check } from 'lucide-react';
import type { JobPost, CompanyProfile } from '@/types/database';

const JOBS: Record<string, JobPost> = {
  j1: { id: 'j1', company_id: 'c1', post_id: null, title: 'Senior Frontend Engineer', skills_required: ['React', 'TypeScript', 'Next.js'], location_type: 'hybrid', city: 'Bangalore', salary_min: 2500000, salary_max: 4000000, proof_requirement: 'Show us a production React app with >1000 users. Bonus: open source contributions.', description: 'Join the payments team building the next-gen checkout experience. You will work on high-traffic, latency-sensitive UI that processes millions of transactions daily.', apply_method: 'buzz_dm', external_url: null, deadline: '2026-04-15', experience_level: 'senior', status: 'active', created_at: '2026-03-20T10:00:00Z', updated_at: '', company: { id: 'c1', user_id: 'cu1', handle: 'razorpay', name: 'Razorpay', logo_url: null, cover_url: null, about: null, industry: 'Fintech', size: '201_500', city: 'Bangalore', website: null, linkedin_url: null, verified: true, verification_method: 'domain', credibility_score: 4.6, response_rate: 89, total_hires: 24, created_at: '', updated_at: '' }, application_count: 12, user_applied: false },
  j2: { id: 'j2', company_id: 'c2', post_id: null, title: 'Full Stack Developer', skills_required: ['Go', 'React', 'PostgreSQL'], location_type: 'remote', city: null, salary_min: 1800000, salary_max: 3000000, proof_requirement: 'Share a project where you built both the API and the frontend. Show us the architecture.', description: 'Work on trading infrastructure serving millions of orders daily. We value simplicity, performance, and clean code.', apply_method: 'buzz_dm', external_url: null, deadline: '2026-04-10', experience_level: 'mid', status: 'active', created_at: '2026-03-19T08:00:00Z', updated_at: '', company: { id: 'c2', user_id: 'cu2', handle: 'zerodha', name: 'Zerodha', logo_url: null, cover_url: null, about: null, industry: 'Fintech', size: '51_200', city: 'Bangalore', website: null, linkedin_url: null, verified: true, verification_method: 'domain', credibility_score: 4.8, response_rate: 94, total_hires: 18, created_at: '', updated_at: '' }, application_count: 28, user_applied: false },
};

export default function JobDetailPage() {
  const params = useParams();
  const job = JOBS[params.id as string];
  const [applied, setApplied] = useState(false);

  if (!job) return <div className="text-center py-16"><p className="text-[#0F0F0F]/40">Job not found.</p></div>;

  const company = job.company as CompanyProfile;

  return (
    <div className="max-w-2xl">
      <Link href="/jobs" className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0F0F0F]/40 hover:text-[#0F0F0F] mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to jobs
      </Link>

      <div className="card-static p-6 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <Avatar src={company.logo_url} name={company.name} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px] text-[#0F0F0F]">{company.name}</span>
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
            <p className="text-[12px] font-semibold text-[#0F0F0F]">{job.experience_level}</p>
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

        <p className="text-[12px] text-[#0F0F0F]/40 mb-5">{job.application_count} people have applied</p>

        {applied ? (
          <button className="btn-secondary w-full py-3 flex items-center justify-center gap-2" disabled>
            <Check className="w-4 h-4" /> Applied
          </button>
        ) : (
          <button onClick={() => setApplied(true)} className="btn-primary w-full py-3">Apply with Work Wall</button>
        )}
      </div>
    </div>
  );
}
