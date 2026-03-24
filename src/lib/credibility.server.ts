import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Company Credibility Engine
 *
 * credibility_score (0-100) is calculated from:
 * - Response rate: % of applications responded to (40 pts max)
 * - Response speed: avg time to respond in hours (30 pts max)
 * - Hire rate: % of jobs that resulted in a hire (20 pts max)
 * - No-ghost bonus: 0 ignored applications = 10 pts
 */

interface CredibilityBreakdown {
  credibility_score: number;
  response_rate: number;
  total_hires: number;
  avg_response_hours: number;
}

export async function recalculateCredibility(companyId: string): Promise<CredibilityBreakdown> {
  const admin = createAdminClient();

  // Get all jobs for this company
  const { data: jobs } = await admin
    .from('job_posts')
    .select('id')
    .eq('company_id', companyId);

  const jobIds = (jobs ?? []).map(j => j.id);

  if (jobIds.length === 0) {
    return { credibility_score: 0, response_rate: 0, total_hires: 0, avg_response_hours: 0 };
  }

  // Get all applications across all jobs
  const { data: applications } = await admin
    .from('job_applications')
    .select('id, status, applied_at, responded_at, job_id')
    .in('job_id', jobIds);

  const allApps = applications ?? [];
  if (allApps.length === 0) {
    return { credibility_score: 0, response_rate: 0, total_hires: 0, avg_response_hours: 0 };
  }

  const totalApps = allApps.length;
  const respondedApps = allApps.filter(a => a.responded_at !== null);
  const hiredApps = allApps.filter(a => a.status === 'hired');
  const jobsWithHires = new Set(hiredApps.map(a => a.job_id)).size;

  // Response rate (0-1)
  const responseRate = totalApps > 0 ? respondedApps.length / totalApps : 0;

  // Average response time in hours
  let avgResponseHours = 0;
  if (respondedApps.length > 0) {
    const totalHours = respondedApps.reduce((sum, app) => {
      const applied = new Date(app.applied_at).getTime();
      const responded = new Date(app.responded_at!).getTime();
      return sum + (responded - applied) / (1000 * 60 * 60);
    }, 0);
    avgResponseHours = totalHours / respondedApps.length;
  }

  // Hire rate: jobs with at least one hire / total jobs
  const hireRate = jobIds.length > 0 ? jobsWithHires / jobIds.length : 0;

  // Check for ignored applications (pending for > 7 days)
  const now = Date.now();
  const ignoredApps = allApps.filter(a => {
    if (a.status !== 'pending') return false;
    const applied = new Date(a.applied_at).getTime();
    const daysSince = (now - applied) / (1000 * 60 * 60 * 24);
    return daysSince > 7;
  });

  // Calculate score components
  // Response rate: 0-40 pts
  const responsePoints = Math.round(responseRate * 40);

  // Response speed: 0-30 pts (< 4 hours = 30, < 24h = 25, < 48h = 20, < 72h = 10, else 0)
  let speedPoints = 0;
  if (respondedApps.length > 0) {
    if (avgResponseHours < 4) speedPoints = 30;
    else if (avgResponseHours < 24) speedPoints = 25;
    else if (avgResponseHours < 48) speedPoints = 20;
    else if (avgResponseHours < 72) speedPoints = 10;
    else speedPoints = 5;
  }

  // Hire rate: 0-20 pts
  const hirePoints = Math.round(hireRate * 20);

  // No-ghost bonus: 10 pts if no ignored applications
  const ghostPoints = ignoredApps.length === 0 ? 10 : 0;

  const credibilityScore = Math.min(100, responsePoints + speedPoints + hirePoints + ghostPoints);

  // Update the company profile
  await admin
    .from('company_profiles')
    .update({
      credibility_score: credibilityScore,
      response_rate: Math.round(responseRate * 100) / 100,
      total_hires: hiredApps.length,
      updated_at: new Date().toISOString(),
    })
    .eq('id', companyId);

  return {
    credibility_score: credibilityScore,
    response_rate: responseRate,
    total_hires: hiredApps.length,
    avg_response_hours: avgResponseHours,
  };
}

/**
 * Get a label for the credibility score
 */
export function getCredibilityLabel(score: number): { label: string; emoji: string; color: string } {
  if (score >= 85) return { label: 'Excellent', emoji: '🟢', color: '#16A34A' };
  if (score >= 65) return { label: 'Good', emoji: '🔵', color: '#2563EB' };
  if (score >= 40) return { label: 'Fair', emoji: '🟡', color: '#D97706' };
  if (score > 0) return { label: 'Poor', emoji: '🔴', color: '#DC2626' };
  return { label: 'New', emoji: '⚪', color: '#9CA3AF' };
}
