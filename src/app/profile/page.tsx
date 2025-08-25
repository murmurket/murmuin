// src/app/profile/page.tsx
import { withAuth } from '@/lib/withAuth';
import { createSupabaseServerClient } from '@/lib/supabase';
import LogoutButton from '@/components/profile/LogoutButton';
import ProfileClient from '@/components/profile/ProfileClient';

export default async function ProfilePage() {
  const session = await withAuth();
  const user = session.user;

  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from('users')
    .select('display_name, username, avatar_url, timezone, plan')
    .eq('id', user.id)
    .single();

  const safeProfile = profile ?? {
    display_name: '',
    username: '',
    avatar_url: '',
    timezone: '',
    plan: '',
  };

  const { count } = await supabase
    .from('routine_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">👤 My Profile</h1>
      <p className="mb-2">📧 Email: <span className="font-mono">{user.email}</span></p>
      <p className="mb-6">🧘‍♀️ Routines completed: <strong>{count ?? 0}</strong></p>

      <ProfileClient
        userId={user.id}
        initialProfile={safeProfile}
      />

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}