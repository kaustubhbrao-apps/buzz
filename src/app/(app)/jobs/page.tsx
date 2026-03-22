'use client';

import { useCallback, useEffect, useState } from 'react';
import JobCard from '@/components/job/JobCard';
import JobFilters from '@/components/job/JobFilters';
import ApplyModal from '@/components/job/ApplyModal';
import { SkeletonCard } from '@/components/ui/Skeleton';
import type { JobPost, PersonProfile } from '@/types/database';

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [applyJob, setApplyJob] = useState<JobPost | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
    const res = await fetch(`/api/jobs?${params}`);
    if (res.ok) {
      const data = await res.json();
      setJobs(data.jobs ?? []);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Real roles. Real proof required.</h1>
      <p className="text-buzz-muted text-sm mb-6">
        Every job on Buzz tells you exactly what work to show. No CV. No cover letter.
      </p>

      <JobFilters filters={filters} onChange={setFilters} />

      <div className="space-y-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : jobs.length === 0 ? (
          <p className="text-center text-buzz-muted py-8">No jobs match your filters.</p>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApply={() => setApplyJob(job)}
              userApplied={job.user_applied ?? false}
            />
          ))
        )}
      </div>

      {applyJob && (
        <ApplyModal
          job={applyJob}
          applicantProfile={{} as PersonProfile}
          isOpen
          onClose={() => setApplyJob(null)}
          onSuccess={fetchJobs}
        />
      )}
    </div>
  );
}
