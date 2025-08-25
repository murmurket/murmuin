import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const username = req.nextUrl.searchParams.get('username');

  if (!username || !/^[a-z0-9_]{3,20}$/.test(username)) {
    return NextResponse.json({ available: false, error: 'Invalid username' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('❌ Failed to check username:', error.message);
    return NextResponse.json({ available: false, error: 'Internal error' }, { status: 500 });
  }

  const available = !data;
  return NextResponse.json({ available });
}