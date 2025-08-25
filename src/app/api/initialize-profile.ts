import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Response('Unauthorized', { status: 401 });

  const { timezone } = await req.json();

  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!existing) {
    await supabase.from('users').insert({
      id: session.user.id,
      email: session.user.email,
      timezone,
      role: 'user',
      plan: 'free',
    });
  }

  return new Response('OK');
}