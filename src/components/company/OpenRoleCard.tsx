'use client';

import Button from '@/components/ui/Button';
import { formatSalary, timeAgo } from '@/lib/utils';
import type { JobPost } from '@/types/database';

interface OpenRoleCardProps {
  job: JobPost;
  onApply: () => void;
  userApplied?: boolean;
}

export default function OpenRoleCard({ job, onApply, userApplied }: OpenRoleCardProps) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold">{job.title}</h3>

      <div className="flex flex-wrap gap-1.5 mt-2">
        {job.skills_required?.map((skill) => (
          <span key={skill} className="chip bg-gray-100 text-buzz-text">{skill}</span>
        ))}
      </div>

      <p className="text-sm text-buzz-muted mt-2">
        {job.location_type === 'remote' ? '🌍 Remote' : `📍 ${job.location_type} · ${job.city}`}
        {' · '}
        {formatSalary(job.salary_min, job.salary_max)}
        {' · '}
        {timeAgo(job.created_at)}
      </p>

      <p className="text-sm text-buzz-muted italic mt-2">
        Show us: {job.proof_requirement}
      </p>

      <div className="mt-3">
        {userApplied ? (
          <Button variant="secondary" size="sm" disabled>Applied ✓</Button>
        ) : (
          <Button size="sm" onClick={onApply}>Apply with Work Wall</Button>
        )}
      </div>
    </div>
  );
}
