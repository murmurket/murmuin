// src/app/api/update-profile/route.ts
import { createSupabaseServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { display_name, username, avatar_url } = body;

  // username 중복 체크
  if (username) {
    const { data: existing, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', session.user.id) // 자기 자신 제외
        .maybeSingle();

    if (existing) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }
  }

  const { error } = await supabase
    .from('users')
    .update({ display_name, username, avatar_url })
    .eq('id', session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}