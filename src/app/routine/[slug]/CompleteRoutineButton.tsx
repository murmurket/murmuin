// src/app/routine/[slug]/CompleteRoutineButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Stores completion with UUID (FK) and redirects using slug.
 */
export function CompleteRoutineButton({
  routineUuid,
  slug,
}: {
  routineUuid: string; // canonical FK → routines.id
  slug: string;        // for redirect/login return URL
}) {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleComplete = async () => {
    // Require sign-in (RLS insert policy demands auth)
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push(`/login?redirectTo=/routine/${encodeURIComponent(slug)}`);
      return;
    }

    // Send to server action/route that inserts into routine_logs
    const formData = new FormData();
    formData.append('routine_uuid', routineUuid);
    formData.append('feedback', 'completed'); // or leave empty/null if you prefer

    const res = await fetch('/actions/logRoutineCompletion', {
      method: 'POST',
      body: formData,
    });

    // Optional: handle non-200 gracefully
    if (!res.ok) {
      console.error('[CompleteRoutineButton] save failed', await res.text());
      return;
    }

    router.push('/history');
  };

  return (
    <button
      onClick={handleComplete}
      className="bg-green-600 text-white px-4 py-2 rounded"
    >
      ✅ I’ve completed this routine
    </button>
  );
}