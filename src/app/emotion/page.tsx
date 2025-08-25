// src/app/emotion/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AnalyzeResult = {
  main_emotion: string;
  mood_tags: string[];
  gpt_comment: string;
  recommended_routine: string;
};

export default function EmotionPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const router = useRouter();

  const handleAnalyze = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send trimmed input to avoid accidental spaces/newlines
        body: JSON.stringify({ input: trimmed }),
      });

      // Handle non-2xx HTTP responses
      // ... inside handleAnalyze()
      if (!res.ok) {
        // read the body once as text; try json parse for {error}
        const text = await res.text();
        let msg = `Analyze failed (${res.status})`;
        try {
          const json = JSON.parse(text);
          if (json?.error) msg = json.error;
        } catch {
          if (text?.trim()) msg = text.trim();
        }
        throw new Error(msg);
      }

      const data = await res.json();

      // Normalize the shape to be safe for rendering
      const safe: AnalyzeResult = {
        main_emotion:
          typeof data?.main_emotion === "string"
            ? data.main_emotion
            : "unknown",
        mood_tags: Array.isArray(data?.mood_tags)
          ? data.mood_tags.filter((t: unknown) => typeof t === "string")
          : [],
        gpt_comment:
            typeof data?.gpt_comment === "string"
              ? data.gpt_comment
              : "I'm here with you. Let's try to breathe and be present.",
        recommended_routine:
          typeof data?.recommended_routine === "string"
            ? data.recommended_routine
            : "",
      };

      setResult(safe);

      // Optional: navigate to routine detail if present
      if (safe.recommended_routine) {
        router.push(`/routine/${encodeURIComponent(safe.recommended_routine)}`);
        return;
      }
    } catch (err: unknown) {
      console.error("Failed to analyze emotion:", err);
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
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
        disabled={loading || !input.trim()}
      >
        {loading ? "Analyzing..." : "Analyze Emotion"}
      </button>

      {errorMsg && (
        <p className="mt-4 text-red-600 text-sm">⚠️ {errorMsg}</p>
      )}

      {result && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Analysis Result</h2>
          <p>
            <strong>Main Emotion:</strong> {result.main_emotion}
          </p>
          <p>
            <strong>Tags:</strong>{" "}
            {Array.isArray(result.mood_tags) && result.mood_tags.length > 0
              ? result.mood_tags.join(", ")
              : "—"}
          </p>
          <p>
            <strong>Comment:</strong> {result.gpt_comment}
          </p>
          <p>
            <strong>Recommended Routine:</strong>{" "}
            {result.recommended_routine || "—"}
          </p>
        </div>
      )}
    </div>
  );
}