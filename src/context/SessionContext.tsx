// src/context/SessionContext.tsx
'use client';

import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';

export const SessionContext = createContext<Session | null>(null);
export const useSession = () => useContext(SessionContext);