import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  // Mutable response — updated inside setAll when cookies are written
  let response = NextResponse.redirect(`${origin}/login?error=auth`);

  if (!code) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // First set on request so subsequent server reads see them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Then rebuild the response with updated request + set on response
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as any)
          );
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

  // Determine redirect destination
  let redirectTo = `${origin}/feed`;

  const { data: existingUser } = await supabase
    .from('users')
    .select('id, account_type')
    .eq('id', user.id)
    .single();

  if (!existingUser) {
    redirectTo = `${origin}/signup`;
  } else {
    const table = existingUser.account_type === 'company' ? 'company_profiles' : 'person_profiles';
    const { data: profile } = await supabase
      .from(table)
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      redirectTo = existingUser.account_type === 'company'
        ? `${origin}/onboarding/company/step1`
        : `${origin}/onboarding/person/step1`;
    }
  }

  // Copy all cookies from the response that setAll built onto the redirect
  const redirect = NextResponse.redirect(redirectTo);
  response.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie.name, cookie.value);
  });

  return redirect;
}
