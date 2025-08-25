// ✅ src/actions/logRoutineCompletion.ts
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function logRoutineCompletion(routine_id: string, feedback: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.from('routine_logs').insert([
    {
      routine_id,
      feedback, // ✅ 이제 오류 없음
    },
  ]);

  if (error) console.error('Routine logging failed:', error);
  else revalidatePath('/history');
}