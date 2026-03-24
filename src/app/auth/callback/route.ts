import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user row exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, account_type')
          .eq('id', user.id)
          .single();

        if (!existingUser) {
          // New user — send to signup to pick account type
          return NextResponse.redirect(`${origin}/signup`);
        }

        // Check if profile is set up
        const table = existingUser.account_type === 'company' ? 'company_profiles' : 'person_profiles';
        const { data: profile } = await supabase
          .from(table)
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!profile) {
          // Has user row but no profile — send to onboarding
          const path = existingUser.account_type === 'company'
            ? '/onboarding/company/step1'
            : '/onboarding/person/step1';
          return NextResponse.redirect(`${origin}${path}`);
        }

        return NextResponse.redirect(`${origin}/feed`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
