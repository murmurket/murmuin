'use client';

import { useState } from 'react';
import { useRouter } from "next/navigation";

export default function EmotionPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    main_emotion: string;
    mood_tags: string[];
    gpt_comment: string;
    recommended_routine: string;
  }>(null);

  const router = useRouter();

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      const data = await res.json();
      setResult(data);

      if (data.recommended_routine) {
      router.push(`/routine/${data.recommended_routine}`);
      //return; // 추가하면 불필요한 setResult 방지 가능
    }
    } catch (err) {
      console.error('Failed to analyze emotion:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">How are you feeling today?</h1>
      
      <textarea
        className="w-full p-3 border rounded mb-4"
        rows={4}
        placeholder="Describe your feelings..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={handleAnalyze}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Analyze Emotion'}
      </button>

      {result && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Analysis Result</h2>
          <p><strong>Main Emotion:</strong> {result.main_emotion}</p>
          <p><strong>Tags:</strong> {result.mood_tags.join(', ')}</p>
          <p><strong>Comment:</strong> {result.gpt_comment}</p>
          <p><strong>Recommended Routine:</strong> {result.recommended_routine}</p>
        </div>
      )}
    </div>
  );
}