'use client';

import { useState } from 'react';
import JobCard from '@/components/job/JobCard';
import JobFilters from '@/components/job/JobFilters';
import type { JobPost, CompanyProfile } from '@/types/database';

const C: CompanyProfile[] = [
  { id: 'c1', user_id: 'cu1', handle: 'razorpay', name: 'Razorpay', logo_url: null, cover_url: null, about: 'Payments infrastructure', industry: 'Fintech', size: '201_500', city: 'Bangalore', website: null, linkedin_url: null, verified: true, verification_method: 'domain', credibility_score: 4.6, response_rate: 89, total_hires: 24, created_at: '', updated_at: '' },
  { id: 'c2', user_id: 'cu2', handle: 'zerodha', name: 'Zerodha', logo_url: null, cover_url: null, about: 'Trading platform', industry: 'Fintech', size: '51_200', city: 'Bangalore', website: null, linkedin_url: null, verified: true, verification_method: 'domain', credibility_score: 4.8, response_rate: 94, total_hires: 18, created_at: '', updated_at: '' },
  { id: 'c3', user_id: 'cu3', handle: 'cred-club', name: 'CRED', logo_url: null, cover_url: null, about: 'Rewards for paying bills', industry: 'Fintech', size: '201_500', city: 'Bangalore', website: null, linkedin_url: null, verified: true, verification_method: 'domain', credibility_score: 4.2, response_rate: 72, total_hires: 31, created_at: '', updated_at: '' },
];

const J: JobPost[] = [
  { id: 'j1', company_id: 'c1', post_id: null, title: 'Senior Frontend Engineer', skills_required: ['React', 'TypeScript', 'Next.js'], location_type: 'hybrid', city: 'Bangalore', salary_min: 2500000, salary_max: 4000000, proof_requirement: 'Show us a production React app with >1000 users. Bonus: open source contributions.', description: null, apply_method: 'buzz_dm', external_url: null, deadline: '2026-04-15', experience_level: 'senior', status: 'active', created_at: '2026-03-20T10:00:00Z', updated_at: '', company: C[0], application_count: 12, user_applied: false },
  { id: 'j2', company_id: 'c2', post_id: null, title: 'Full Stack Developer', skills_required: ['Go', 'React', 'PostgreSQL'], location_type: 'remote', city: null, salary_min: 1800000, salary_max: 3000000, proof_requirement: 'Share a project where you built both the API and the frontend. Show us the architecture.', description: null, apply_method: 'buzz_dm', external_url: null, deadline: '2026-04-10', experience_level: 'mid', status: 'active', created_at: '2026-03-19T08:00:00Z', updated_at: '', company: C[1], application_count: 28, user_applied: false },
  { id: 'j3', company_id: 'c3', post_id: null, title: 'Product Designer', skills_required: ['UI Design', 'Figma', 'Motion Design'], location_type: 'onsite', city: 'Bangalore', salary_min: 2000000, salary_max: 3500000, proof_requirement: 'Show us 3 shipped product screens with before/after and the metrics impact.', description: null, apply_method: 'buzz_dm', external_url: null, deadline: null, experience_level: 'mid', status: 'active', created_at: '2026-03-18T12:00:00Z', updated_at: '', company: C[2], application_count: 45, user_applied: true },
];

export default function JobsPage() {
  const [filters, setFilters] = useState({});

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#0F0F0F]">Jobs</h1>
        <p className="text-[13px] text-[#0F0F0F]/50 mt-0.5">Real roles. Real proof required. No CV needed.</p>
      </div>

      <JobFilters filters={filters} onChange={setFilters} />

      <div className="space-y-3 mt-4">
        {J.map((job) => (
          <JobCard key={job.id} job={job} onApply={() => {}} userApplied={job.user_applied ?? false} />
        ))}
      </div>
    </div>
  );
}
