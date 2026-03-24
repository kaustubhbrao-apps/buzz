'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, Briefcase, Users, BarChart3, Clock, ChevronRight } from 'lucide-react';
import { formatSalary, timeAgo } from '@/lib/utils';
import type { JobPost, CompanyProfile, JobApplication, PersonProfile } from '@/types/database';

interface DashboardJob extends JobPost {
  application_count: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isCompany, setIsCompany] = useState<boolean | null>(null);
  const [jobs, setJobs] = useState<DashboardJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth').then(r => r.json()),
      fetch('/api/jobs').then(r => r.json()),
    ])
      .then(([authData, jobsData]) => {
        if (authData.account_type !== 'company') {
          setIsCompany(false);
          setLoading(false);
          return;
        }
        setIsCompany(true);
        // Filter to only this company's jobs
        const companyId = authData.company_profile_id;
        const allJobs = (jobsData.jobs ?? []) as DashboardJob[];
        // If API doesn't filter by company, we show all since the user is a company
        // The company sees all their own jobs via the same userId check
        setJobs(allJobs.filter((j: DashboardJob) => {
          const company = j.company as CompanyProfile | undefined;
          return company?.user_id === authData.user_id;
        }));
        setLoading(false);
      })
      .catch(() => {
        setIsCompany(false);
        setLoading(false);
      });
  }, []);

  const loadApplications = async (jobId: string) => {
    if (selectedJobId === jobId) {
      setSelectedJobId(null);
      setApplications([]);
      return;
    }
    setSelectedJobId(jobId);
    setAppsLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/applications`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setAppsLoading(false);
    }
  };

  const updateStatus = async (jobId: string, applicationId: string, status: string) => {
    setUpdatingId(applicationId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/applications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: applicationId, status }),
      });
      if (res.ok) {
        setApplications(prev =>
          prev.map(a => a.id === applicationId ? { ...a, status: status as JobApplication['status'] } : a)
        );
      }
    } catch {
      // silently fail
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#0F0F0F]/30" />
      </div>
    );
  }

  if (isCompany === false) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="card-static p-8 text-center">
          <AlertCircle className="w-10 h-10 text-[#0F0F0F]/20 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-[#0F0F0F] mb-1">Company accounts only</h1>
          <p className="text-[13px] text-[#0F0F0F]/50 mb-4">
            The dashboard is only available for company accounts.
          </p>
          <button onClick={() => router.push('/jobs')} className="btn-secondary text-[12px] py-2">
            Browse jobs
          </button>
        </div>
      </div>
    );
  }

  const totalApplications = jobs.reduce((sum, j) => sum + (j.application_count ?? 0), 0);
  const respondedJobs = jobs.filter(j => (j.application_count ?? 0) > 0).length;
  const responseRate = jobs.length > 0 ? Math.round((respondedJobs / jobs.length) * 100) : 0;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F0F0F]">Dashboard</h1>
        <p className="text-[13px] text-[#0F0F0F]/50 mt-0.5">Manage your job posts and applications.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="card-static p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD60A]/15 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-[#0F0F0F]/60" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0F0F0F]">{jobs.length}</p>
              <p className="text-[11px] text-[#0F0F0F]/40">Active jobs</p>
            </div>
          </div>
        </div>

        <div className="card-static p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD60A]/15 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#0F0F0F]/60" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0F0F0F]">{totalApplications}</p>
              <p className="text-[11px] text-[#0F0F0F]/40">Total applications</p>
            </div>
          </div>
        </div>

        <div className="card-static p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD60A]/15 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#0F0F0F]/60" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0F0F0F]">{responseRate}%</p>
              <p className="text-[11px] text-[#0F0F0F]/40">Jobs with applicants</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs list */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-bold text-[#0F0F0F]">Your Jobs</h2>
        <button onClick={() => router.push('/jobs/post')} className="btn-primary text-[12px] py-2">
          Post a job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="card-static p-8 text-center">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-[14px] font-semibold text-[#0F0F0F] mb-1">No jobs posted</p>
          <p className="text-[12px] text-[#0F0F0F]/40 mb-4">Post your first job to start receiving proof-based applications.</p>
          <button onClick={() => router.push('/jobs/post')} className="btn-primary text-[12px] py-2">
            Post a job
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id}>
              <button
                onClick={() => loadApplications(job.id)}
                className="card-static p-5 w-full text-left hover:bg-[#FAFAFA] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-[#0F0F0F] mb-1">{job.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#0F0F0F]/50">
                      <span>{job.location_type === 'remote' ? 'Remote' : `${job.location_type} · ${job.city}`}</span>
                      <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(job.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#0F0F0F]">{job.application_count ?? 0}</p>
                      <p className="text-[11px] text-[#0F0F0F]/40">applicants</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-[#0F0F0F]/30 transition-transform ${selectedJobId === job.id ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </button>

              {/* Applications panel */}
              {selectedJobId === job.id && (
                <div className="ml-4 mt-2 mb-3 space-y-2">
                  {appsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-[#0F0F0F]/30" />
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="card-static p-5 text-center">
                      <p className="text-[13px] text-[#0F0F0F]/40">No applications yet.</p>
                    </div>
                  ) : (
                    applications.map(app => {
                      const applicant = app.applicant as PersonProfile | undefined;
                      return (
                        <div key={app.id} className="card-static p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-9 h-9 rounded-2xl bg-[#0F0F0F] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                {applicant?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '??'}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <Link href={`/${applicant?.handle}`} className="text-[13px] font-semibold text-[#0F0F0F] hover:underline truncate">
                                    {applicant?.full_name ?? 'Unknown'}
                                  </Link>
                                  <span className="text-[11px] text-[#0F0F0F]/40">Buzz {applicant?.buzz_score ?? 0}</span>
                                </div>
                                {applicant?.headline && (
                                  <p className="text-[12px] text-[#0F0F0F]/50 truncate">{applicant.headline}</p>
                                )}
                                {app.note && (
                                  <p className="text-[12px] text-[#0F0F0F]/60 mt-1 italic">&ldquo;{app.note}&rdquo;</p>
                                )}
                                <p className="text-[11px] text-[#0F0F0F]/30 mt-1">{timeAgo(app.applied_at)}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-3">
                              <StatusBadge status={app.status} />
                              {app.status === 'pending' && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => updateStatus(job.id, app.id, 'shortlisted')}
                                    disabled={updatingId === app.id}
                                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                                  >
                                    Shortlist
                                  </button>
                                  <button
                                    onClick={() => updateStatus(job.id, app.id, 'rejected')}
                                    disabled={updatingId === app.id}
                                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              {app.status === 'shortlisted' && (
                                <button
                                  onClick={() => updateStatus(job.id, app.id, 'hired')}
                                  disabled={updatingId === app.id}
                                  className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-[#FFD60A]/20 text-[#0F0F0F] hover:bg-[#FFD60A]/30 transition-colors"
                                >
                                  Hire
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-[#F5F5F5] text-[#0F0F0F]/50',
    shortlisted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    hired: 'bg-[#FFD60A]/20 text-[#0F0F0F]',
  };

  return (
    <span className={`chip text-[11px] ${styles[status] ?? styles.pending}`}>
      {status}
    </span>
  );
}
