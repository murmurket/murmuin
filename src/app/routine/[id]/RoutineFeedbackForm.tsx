'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function RoutineFeedbackForm({ routineId }: { routineId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFeedback = async (feedback: string) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('routine_id', routineId);
    formData.append('feedback', feedback);

    try {
      const res = await fetch('/actions/logRoutineCompletion', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Feedback failed');

      toast.success('Thanks! Your feedback was saved ✅');
      router.push('/history'); // ✅ 히스토리 페이지로 이동
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const options = [
    { value: 'completed', label: '✅ Completed' },
    { value: 'relaxing', label: '😌 Relaxing' },
    { value: 'too_hard', label: '💦 Too hard' },
    { value: 'too_easy', label: '🧘 Too easy' },
    { value: 'skipped', label: '❌ Skipped' },
  ];

  return (
    <div className="mt-6">
      <p className="text-sm font-medium mb-2">How was it?</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((btn) => (
          <button
            key={btn.value}
            onClick={() => handleFeedback(btn.value)}
            className="border px-4 py-2 rounded hover:bg-green-100 disabled:opacity-50"
            disabled={loading}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}