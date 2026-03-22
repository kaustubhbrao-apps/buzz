'use client';

import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatSalary, timeAgo } from '@/lib/utils';
import { Bookmark } from 'lucide-react';
import type { JobPost, CompanyProfile } from '@/types/database';

interface JobCardProps {
  job: JobPost;
  onApply: () => void;
  userApplied: boolean;
}

export default function JobCard({ job, onApply, userApplied }: JobCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const company = job.company as CompanyProfile | undefined;

  return (
    <div className="card p-5 hover:shadow-lg transition-shadow">
      {/* Company row */}
      <div className="flex items-center gap-2 mb-2">
        <Avatar src={company?.logo_url} name={company?.name ?? 'Company'} size="sm" />
        <span className="text-sm font-medium">{company?.name}</span>
        {company?.verified && <Badge variant="verified">Verified</Badge>}
        {company?.credibility_score ? (
          <span className="text-xs text-buzz-muted">⭐ {company.credibility_score.toFixed(1)}</span>
        ) : null}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2">{job.title}</h3>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {job.skills_required?.map((skill) => (
          <span key={skill} className="chip bg-gray-100 text-buzz-text">{skill}</span>
        ))}
      </div>

      {/* Details */}
      <div className="text-sm text-buzz-muted space-y-1 mb-3">
        <p>
          {job.location_type === 'remote' ? '🌍 Remote' : `📍 ${job.location_type} · ${job.city}`}
        </p>
        <p>💰 {formatSalary(job.salary_min, job.salary_max)}</p>
        <p>{timeAgo(job.created_at)}</p>
      </div>

      {/* Proof requirement */}
      <p className="text-sm text-buzz-muted italic mb-4">
        <span className="font-medium not-italic text-buzz-text">Show us:</span>{' '}
        {job.proof_requirement}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {userApplied ? (
          <Button variant="secondary" size="sm" disabled>Applied ✓</Button>
        ) : (
          <Button size="sm" onClick={onApply}>Apply with Work Wall</Button>
        )}
        <button
          onClick={() => setBookmarked(!bookmarked)}
          className="ml-auto text-buzz-muted hover:text-buzz-text"
        >
          <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-buzz-yellow text-buzz-yellow' : ''}`} />
        </button>
      </div>
    </div>
  );
}
