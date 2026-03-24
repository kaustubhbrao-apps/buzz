'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import JobCard from '@/components/job/JobCard';
import JobFilters from '@/components/job/JobFilters';
import type { JobPost, LocationType, ExperienceLevel } from '@/types/database';

interface Filters {
  skill?: string;
  city?: string;
  locationType?: LocationType;
  experienceLevel?: ExperienceLevel;
}

export default function JobsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.skill) params.set('skill', filters.skill);
      if (filters.city) params.set('city', filters.city);
      if (filters.locationType) params.set('locationType', filters.locationType);
      if (filters.experienceLevel) params.set('experienceLevel', filters.experienceLevel);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApply = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, user_applied: true } : j));
      }
    } catch {
      // silently fail
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#0F0F0F]">Jobs</h1>
        <p className="text-[13px] text-[#0F0F0F]/50 mt-0.5">Real roles. Real proof required. No CV needed.</p>
      </div>

      <JobFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#0F0F0F]/30" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="card-static p-8 text-center mt-4">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-[14px] font-semibold text-[#0F0F0F] mb-1">No jobs found</p>
          <p className="text-[12px] text-[#0F0F0F]/40">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onApply={() => handleApply(job.id)} userApplied={job.user_applied ?? false} />
          ))}
        </div>
      )}
    </div>
  );
}
