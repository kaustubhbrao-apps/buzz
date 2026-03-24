import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  // Try server client first (cookies), then fall back to Authorization header
  let user = null;

  const supabase = await createClient();
  const { data: { user: cookieUser } } = await supabase.auth.getUser();
  user = cookieUser;

  if (!user) {
    // Fall back to Authorization header (for Vercel where cookies may not be ready)
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const admin = createAdminClient();
      const { data: { user: tokenUser } } = await admin.auth.getUser(token);
      user = tokenUser;
    }
  }

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { account_type } = await request.json();
  if (!['person', 'company'].includes(account_type)) {
    return NextResponse.json({ error: 'Invalid account type' }, { status: 400 });
  }

  // Use admin client to bypass RLS for user/profile creation
  const admin = createAdminClient();

  // Check if user row already exists
  const { data: existing } = await admin
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  // Create user row
  const { error: userError } = await admin
    .from('users')
    .insert({ id: user.id, email: user.email!, account_type });

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  // Create empty profile row
  const handle = user.email!.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') + Math.floor(Math.random() * 1000);

  if (account_type === 'person') {
    const { error: profileError } = await admin
      .from('person_profiles')
      .insert({
        user_id: user.id,
        handle,
        full_name: user.user_metadata?.full_name || user.email!.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
  } else {
    const { error: profileError } = await admin
      .from('company_profiles')
      .insert({
        user_id: user.id,
        handle,
        name: user.user_metadata?.full_name || user.email!.split('@')[0],
      });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, account_type });
}
