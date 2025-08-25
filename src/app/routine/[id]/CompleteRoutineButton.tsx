// src/app/routine/[id]/CompleteRoutineButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function CompleteRoutineButton({ routineId }: { routineId: string }) {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleComplete = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push('/login?redirectTo=/routine/' + routineId);
      return;
    }

    // 루틴 수행 기록 API 호출
    await fetch('/api/log-completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routineId }),
    });

    router.push('/history');
  };

  return (
    <button onClick={handleComplete} className="bg-green-600 text-white px-4 py-2 rounded">
      ✅ I’ve completed this routine
    </button>
  );
}