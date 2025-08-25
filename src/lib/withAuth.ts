// src/lib/withAuth.ts
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createSupabaseServerClient } from './supabase';
import type { Session } from '@supabase/supabase-js';

export async function withAuth(redirectPath: string = '/'): Promise<Session> {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const headersList = await headers();
    const currentPath = redirectPath || headersList.get('x-invoke-path') || '/';
    redirect(`/login?redirectTo=${currentPath}`);
  }

  return session;
}