import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: userData } = await supabase
    .from('users')
    .select('account_type')
    .eq('id', user.id)
    .single();

  if (userData?.account_type !== 'person') {
    return NextResponse.json({ error: 'Only person accounts can apply' }, { status: 403 });
  }

  // Check buzz score
  const { data: profile } = await supabase
    .from('person_profiles')
    .select('buzz_score')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.buzz_score < 200) {
    return NextResponse.json(
      { error: 'Your score is below 200. Build your Work Wall first.' },
      { status: 403 }
    );
  }

  // Check not already applied
  const { data: existing } = await supabase
    .from('job_applications')
    .select('id')
    .eq('job_id', params.id)
    .eq('applicant_id', user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Already applied' }, { status: 400 });
  }

  const body = await request.json();

  const { data: application, error } = await supabase
    .from('job_applications')
    .insert({
      job_id: params.id,
      applicant_id: user.id,
      note: body.note ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Create message thread with company
  const { data: job } = await supabase
    .from('job_posts')
    .select('company:company_profiles!job_posts_company_id_fkey(user_id)')
    .eq('id', params.id)
    .single();

  const companyUserId = (job?.company as { user_id: string } | null)?.user_id;

  if (companyUserId) {
    const { data: thread } = await supabase
      .from('message_threads')
      .insert({
        participant_1: user.id,
        participant_2: companyUserId,
        thread_type: 'job_application',
        job_id: params.id,
      })
      .select()
      .single();

    if (thread) {
      await supabase.from('messages').insert({
        thread_id: thread.id,
        sender_id: user.id,
        content: `Applied for this role.${body.note ? ` Note: ${body.note}` : ''}`,
      });

      return NextResponse.json({
        applicationId: application.id,
        threadId: thread.id,
      });
    }
  }

  return NextResponse.json({ applicationId: application.id });
}
