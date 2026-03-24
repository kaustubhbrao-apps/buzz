import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const limit = parseInt(searchParams.get('limit') ?? '20');

  let query = supabase
    .from('person_profiles')
    .select('*')
    .eq('profile_complete', true)
    .order('buzz_score', { ascending: false })
    .limit(limit);

  if (q) {
    // Search across name, headline, and city
    query = query.or(`full_name.ilike.%${q}%,headline.ilike.%${q}%,city.ilike.%${q}%`);
  }

  const { data: profiles, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Spotlight: top 4 by buzz_score (only when no search query)
  let spotlight = null;
  if (!q) {
    const { data } = await supabase
      .from('person_profiles')
      .select('*')
      .eq('profile_complete', true)
      .order('buzz_score', { ascending: false })
      .limit(4);
    spotlight = data;
  }

  return NextResponse.json({ profiles: profiles ?? [], spotlight });
}
