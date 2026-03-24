import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options as any)
              );
            } catch {
              // Can fail in edge cases
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth code exchange error:', error.message);
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }

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
        const path = existingUser.account_type === 'company'
          ? '/onboarding/company/step1'
          : '/onboarding/person/step1';
        return NextResponse.redirect(`${origin}${path}`);
      }

      return NextResponse.redirect(`${origin}/feed`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
