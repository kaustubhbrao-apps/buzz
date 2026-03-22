import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: job, error } = await supabase
    .from('job_posts')
    .select('*, company:company_profiles!job_posts_company_id_fkey(*), job_applications(id, applicant_id)')
    .eq('id', params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  const applications = (job.job_applications as { id: string; applicant_id: string }[]) ?? [];

  return NextResponse.json({
    job: {
      ...job,
      job_applications: undefined,
      application_count: applications.length,
      user_applied: user ? applications.some((a) => a.applicant_id === user.id) : false,
    },
  });
}
