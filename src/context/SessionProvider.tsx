// src/context/SessionProvider.tsx
'use client';

import { SessionContext } from './SessionContext';
import type { Session } from '@supabase/supabase-js';

export default function SessionProvider({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}