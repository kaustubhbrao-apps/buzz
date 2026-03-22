import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*, author:person_profiles!comments_author_id_fkey(id, full_name, handle, avatar_url, score_band)')
    .eq('post_id', params.id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { content } = await request.json();

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({ post_id: params.id, author_id: user.id, content })
    .select('*, author:person_profiles!comments_author_id_fkey(id, full_name, handle, avatar_url)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment });
}
