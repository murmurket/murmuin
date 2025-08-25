// src/lib/gpt.ts
export async function analyzeEmotion(input: string) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });

  return res.json();
}