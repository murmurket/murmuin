// src/app/emotion-history/page.tsx
import { withAuth } from '@/lib/withAuth';
import EmotionHistoryClient from '@/components/emotion/EmotionHistoryClient';
import { createSupabaseServerClient } from '@/lib/supabase';

export default async function EmotionHistoryPage() {
  const session = await withAuth();
  const userId = session.user.id;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('emotion_logs')
    .select('main_emotion, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  return <EmotionHistoryClient logs={data ?? []} />;
}
