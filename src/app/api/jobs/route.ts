import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const skill = searchParams.get('skill');
  const city = searchParams.get('city');
  const locationType = searchParams.get('locationType');
  const experienceLevel = searchParams.get('experienceLevel');

  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('job_posts')
    .select(`
      *,
      company:company_profiles!job_posts_company_id_fkey(*),
      job_applications(id, applicant_id)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (skill) query = query.contains('skills_required', [skill]);
  if (city) query = query.ilike('city', `%${city}%`);
  if (locationType) query = query.eq('location_type', locationType);
  if (experienceLevel) query = query.eq('experience_level', experienceLevel);

  const { data: jobs, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const enriched = (jobs ?? []).map((job) => {
    const applications = (job.job_applications as { id: string; applicant_id: string }[]) ?? [];
    return {
      ...job,
      job_applications: undefined,
      application_count: applications.length,
      user_applied: user ? applications.some((a) => a.applicant_id === user.id) : false,
    };
  });

  return NextResponse.json({ jobs: enriched });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: userData } = await supabase
    .from('users')
    .select('account_type')
    .eq('id', user.id)
    .single();

  if (userData?.account_type !== 'company') {
    return NextResponse.json({ error: 'Only companies can post jobs' }, { status: 403 });
  }

  const { data: company } = await supabase
    .from('company_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!company) return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });

  const body = await request.json();

  if (!body.salary_min || !body.salary_max) {
    return NextResponse.json(
      { error: 'Please enter a salary range. Transparency builds trust.' },
      { status: 400 }
    );
  }

  if (!body.proof_requirement) {
    return NextResponse.json(
      { error: 'Proof requirement is required.' },
      { status: 400 }
    );
  }

  const { data: job, error } = await supabase
    .from('job_posts')
    .insert({
      company_id: company.id,
      title: body.title,
      skills_required: body.skills_required ?? [],
      location_type: body.location_type,
      city: body.city,
      salary_min: body.salary_min,
      salary_max: body.salary_max,
      proof_requirement: body.proof_requirement,
      description: body.description,
      apply_method: body.apply_method ?? 'buzz_dm',
      external_url: body.external_url,
      deadline: body.deadline,
      experience_level: body.experience_level,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ job });
}
