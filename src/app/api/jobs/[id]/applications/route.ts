import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { recalculateCredibility } from '@/lib/credibility.server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify the user owns the company that posted this job
  const { data: job } = await supabase
    .from('job_posts')
    .select('id, company_id, company:company_profiles!job_posts_company_id_fkey(user_id)')
    .eq('id', jobId)
    .single();

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  const companyUserId = ((job.company as unknown) as { user_id: string } | null)?.user_id;
  if (companyUserId !== user.id) {
    return NextResponse.json({ error: 'Only the job owner can view applications' }, { status: 403 });
  }

  // Fetch applications with applicant profiles
  const { data: applications, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      applicant:person_profiles!job_applications_applicant_id_fkey(
        id, user_id, handle, full_name, avatar_url, headline, city, buzz_score, score_band, streak_count
      )
    `)
    .eq('job_id', jobId)
    .order('applied_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ applications: applications ?? [] });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify person account
  const { data: userData } = await supabase
    .from('users')
    .select('account_type')
    .eq('id', user.id)
    .single();

  if (userData?.account_type !== 'person') {
    return NextResponse.json({ error: 'Only person accounts can apply' }, { status: 403 });
  }

  // Check not already applied
  const { data: existing } = await supabase
    .from('job_applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('applicant_id', user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Already applied' }, { status: 400 });
  }

  const body = await request.json();

  const { data: application, error } = await supabase
    .from('job_applications')
    .insert({
      job_id: jobId,
      applicant_id: user.id,
      note: body.note ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ application });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify the user owns the company that posted this job
  const { data: job } = await supabase
    .from('job_posts')
    .select('id, company_id, company:company_profiles!job_posts_company_id_fkey(user_id)')
    .eq('id', jobId)
    .single();

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  const companyUserId = ((job.company as unknown) as { user_id: string } | null)?.user_id;
  if (companyUserId !== user.id) {
    return NextResponse.json({ error: 'Only the job owner can update applications' }, { status: 403 });
  }

  const body = await request.json();
  const { application_id, status } = body;

  if (!application_id || !status) {
    return NextResponse.json({ error: 'application_id and status are required' }, { status: 400 });
  }

  const validStatuses = ['pending', 'shortlisted', 'rejected', 'hired'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
  }

  const { data: application, error } = await supabase
    .from('job_applications')
    .update({
      status,
      responded_at: new Date().toISOString(),
    })
    .eq('id', application_id)
    .eq('job_id', jobId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Recalculate company credibility after every status change
  await recalculateCredibility(job.company_id);

  return NextResponse.json({ application });
}
