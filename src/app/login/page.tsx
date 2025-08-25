'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get('redirectTo') || '/';

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback?redirectTo=${redirectTo}`,
      },
    });

    if (error) setMessage(`❌ ${error.message}`);
    else setMessage('📩 Magic link sent! Check your email.');
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Login with Magic Link</h1>
      <input
        type="email"
        placeholder="you@example.com"
        className="w-full border p-2 mb-4"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Send Magic Link
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}