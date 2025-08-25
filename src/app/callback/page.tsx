'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CallbackPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  useEffect(() => {
    const handleSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace('/login?error=magic_link_failed');
        return;
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      await fetch('/api/initialize-profile/route', {
        method: 'POST',
        body: JSON.stringify({ timezone }),
      });

    const redirectTo = searchParams.get('redirectTo') || '/';

      router.replace(redirectTo);
    };

    handleSession();
  }, [router, supabase, redirectTo]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-gray-600">🔐 Logging you in...</p>
    </div>
  );
}