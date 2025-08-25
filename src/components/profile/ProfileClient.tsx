'use client';

import { useEffect, useState, useCallback } from 'react';

const isValidUsername = (username: string) => /^[a-z0-9_]{3,20}$/.test(username);

export default function ProfileClient({
  userId,
  initialProfile,
}: {
  userId: string;
  initialProfile: {
    display_name: string;
    username: string;
    avatar_url: string;
    timezone: string;
    plan: string;
  };
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'valid' | 'invalid' | 'taken' | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleChange = (key: string, value: string) => {
    setProfile({ ...profile, [key]: value });
    if (key === 'username') {
      setUsernameStatus(null);
      if (typingTimeout) clearTimeout(typingTimeout);
      const timeout = setTimeout(() => checkUsername(value), 500);
      setTypingTimeout(timeout);
    }
  };

  const checkUsername = useCallback(async (username: string) => {
    if (!isValidUsername(username)) {
      setUsernameStatus('invalid');
      return;
    }
    const res = await fetch(`/api/check-username?username=${username}`);
    if (res.status === 200) {
      setUsernameStatus('valid');
    } else {
      setUsernameStatus('taken');
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/update-profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    }).then(async (res) => {
      if (res.status === 409) {
        alert('❌ Username already taken');
      } else {
        alert('✅ Profile updated');
      }
    });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <input
        className="w-full border p-2 rounded"
        placeholder="Display Name"
        value={profile.display_name}
        onChange={(e) => handleChange('display_name', e.target.value)}
      />
      <input
        className="w-full border p-2 rounded"
        placeholder="Username"
        value={profile.username || ''}
        onChange={(e) => handleChange('username', e.target.value)}
      />
      {usernameStatus === 'invalid' && (
        <p className="text-sm text-red-500">❌ Invalid username format</p>
      )}
      {usernameStatus === 'taken' && (
        <p className="text-sm text-red-500">❌ Username already taken</p>
      )}
      {usernameStatus === 'valid' && (
        <p className="text-sm text-green-600">✅ Username available</p>
      )}
      <input
        className="w-full border p-2 rounded"
        placeholder="Avatar URL"
        value={profile.avatar_url}
        onChange={(e) => handleChange('avatar_url', e.target.value)}
      />
      <label className="block text-sm text-gray-600 mb-1">Timezone (auto-detected)</label>
      <input
        className="w-full border p-2 rounded bg-gray-100 text-gray-500 cursor-not-allowed disabled readOnly"
        value={profile.timezone}
        readOnly
        disabled
      />
      <input
        className="w-full border p-2 rounded readOnly"
        placeholder="Plan"
        value={profile.plan}
        readOnly
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
}