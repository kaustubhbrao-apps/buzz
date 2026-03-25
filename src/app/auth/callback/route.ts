import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Build a response we can attach cookies to
  const response = NextResponse.redirect(`${origin}/feed`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as any);
          });
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

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Check if user row exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, account_type')
    .eq('id', user.id)
    .single();

  if (!existingUser) {
    // New user — redirect to signup but keep the cookies
    response.headers.set('Location', `${origin}/signup`);
    return response;
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
    response.headers.set('Location', `${origin}${path}`);
    return response;
  }

  // Has profile — go to feed (already set as default redirect)
  return response;
}
