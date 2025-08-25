// src/app/actions/logRoutineCompletion/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'; // ✅
/* import type { Database } from '@/types/supabase'; // 있다면 제네릭으로 넣어도 됨 */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const routine_uuid = String(formData.get('routine_uuid') ?? '');
    const feedback = formData.get('feedback')?.toString() || null;
    if (!routine_uuid) {
      return NextResponse.json({ error: 'Missing routine_uuid' }, { status: 400 });
    }

    // ✅ App Router route handler 전용 클라이언트 (쿠키 자동 브릿지)
    const supabase = createRouteHandlerClient({ cookies /* as any<Database> if you use types */ });

    const { data: { user } = { user: null } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase.from('routine_logs').insert({
      routine_uuid,       // UUID FK → routines.id
      user_id: user.id,   // with check (user_id = auth.uid())
      feedback,
    });
    if (error) {
      console.error('[logRoutineCompletion] insert error:', error);
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error('[logRoutineCompletion] fatal:', e?.message || e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}