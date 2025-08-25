// src/app/history/page.tsx
import { withAuth } from '@/lib/withAuth';
import HistoryClient from '@/components/history/HistoryClient';

export default async function HistoryPage() {
  const session = await withAuth(); // ✅ 서버에서 세션 확인
  const userId = session.user.id;

  return <HistoryClient userId={userId} />;
}