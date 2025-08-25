// src/app/page.tsx  ← Server Component (no framer-motion imports here)
import { createSupabaseServerClient } from "@/lib/supabase";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import EmotionCard from "@/components/emotion/EmotionCard";
import type { EmotionLog } from "@/types/emotion";
import { HeroTitle } from "@/components/motion/HeroTitle";
import { FadeIn } from "@/components/motion/FadeIn";

export const metadata: Metadata = {
  title: "EmoFlow - Your Emotional Tracker",
  description: "Track your emotions and explore self-care routines with AI.",
};

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const { data: emotionLogs, error } = await supabase
    .from("emotion_logs")
    .select(
      "id, created_at, main_emotion, mood_tags, gpt_comment, recommended_routine, input_text, user_id"
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const latest = emotionLogs?.[0] ?? null;

  return (
    <main className="max-w-2xl mx-auto px-6 py-10 space-y-10">
      <HeroTitle>🌿 Welcome back to EmoFlow</HeroTitle>

      {/* Latest emotion log */}
      <FadeIn delay={0.3}>
        {latest ? (
          <EmotionCard log={latest} isLatest />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 space-y-4">
            <p>No emotion logs yet.</p>
            <Link href="/emotion">
              <Button>+ Start Tracking Now</Button>
            </Link>
          </div>
        )}
      </FadeIn>

      {/* CTA to record a new emotion */}
      <FadeIn className="text-center" delay={0.4}>
        <Link href="/emotion">
          <Button className="text-lg px-6 py-3">+ Record New Emotion</Button>
        </Link>
      </FadeIn>

      {/* List of past emotion logs */}
      {emotionLogs && emotionLogs.length > 1 && (
        <FadeIn delay={0.5}>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            🕒 Recent Emotion Logs
          </h2>
          <div className="space-y-3">
            {emotionLogs.slice(1).map((log: EmotionLog) => (
              <EmotionCard key={log.id} log={log} />
            ))}
          </div>
        </FadeIn>
      )}

      {/* Display error if any */}
      {error && (
        <div className="text-red-500 text-sm text-center">
          ⚠️ Error fetching data: {error.message}
        </div>
      )}
    </main>
  );
}