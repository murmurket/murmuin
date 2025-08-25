// src/app/api/initialize-profile/route.ts
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { timezone } = await req.json();

  // 1. 이미 존재하는지 확인
  const { data: existing, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Failed to check user existence:', checkError.message);
    return NextResponse.json({ error: 'Failed to check profile' }, { status: 500 });
  }

  if (existing) {
    // 2. 이미 있으면 update만 수행 (timezone만 갱신)
    await supabase.from('users').update({ timezone }).eq('id', userId);
    return NextResponse.json({ status: 'updated' });
  } else {
    // 3. 없으면 insert 수행
    const { email, user_metadata } = session.user;
    const display_name = user_metadata.full_name || user_metadata.name || '';
    const avatar_url = user_metadata.avatar_url || '';

    const { error: insertError } = await supabase.from('users').insert({
      id: userId,
      display_name,
      avatar_url,
      timezone,
      role: 'user',
      plan: 'free',
      username: null
    });

    if (insertError) {
      console.error('Failed to insert profile:', insertError.message);
      return NextResponse.json({ error: 'Failed to insert profile' }, { status: 500 });
    }

    return NextResponse.json({ status: 'inserted' });
  }
}
