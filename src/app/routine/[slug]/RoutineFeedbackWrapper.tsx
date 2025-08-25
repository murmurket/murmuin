// src/app/routine/[slug]/RoutineFeedbackWrapper.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import RoutineFeedbackForm from './RoutineFeedbackForm';
import { CompleteRoutineButton } from './CompleteRoutineButton';

/**
 * We keep URLs slug-based for UX, but store logs with the canonical UUID.
 * This wrapper receives the routine UUID from the page and passes it down.
 */
export default function RoutineFeedbackWrapper({ routineUuid, slug }: { routineUuid: string; slug: string; }) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setLoggedIn(!!data.session);
    })();
    return () => { mounted = false; };
  }, [supabase]);

  if (loggedIn === null) return null; // or a spinner

  return loggedIn ? (
    <RoutineFeedbackForm routineUuid={routineUuid} />
  ) : (
    <CompleteRoutineButton routineUuid={routineUuid} slug={slug} />
  );
}