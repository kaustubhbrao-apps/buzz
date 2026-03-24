import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // If company account, also fetch company_profile id
  let company_profile_id: string | null = null;
  if (userData?.account_type === 'company') {
    const { data: companyProfile } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    company_profile_id = companyProfile?.id ?? null;
  }

  return NextResponse.json({
    user: { ...(userData ?? {}), email: user.email },
    user_id: user.id,
    account_type: userData?.account_type ?? null,
    company_profile_id,
  });
}
