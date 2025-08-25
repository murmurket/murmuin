// src/app/routine/[id]/RoutineFeedbackWrapper.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import RoutineFeedbackForm from './RoutineFeedbackForm';
import { CompleteRoutineButton } from './CompleteRoutineButton';

export default function RoutineFeedbackWrapper({ routineId }: { routineId: string }) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setLoggedIn(!!data.session);
    };

    checkSession();
  }, [supabase]);

  if (loggedIn === null) return null; // or loading spinner

  return loggedIn ? (
    <RoutineFeedbackForm routineId={routineId} />
  ) : (
    <CompleteRoutineButton routineId={routineId} />
  );
}