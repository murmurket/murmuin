// src/app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { safeJSONParse } from "@/lib/utils";
import { findFallbackRoutine } from "@/lib/routine";
import { createClient } from "@supabase/supabase-js";

// Ensure env exists early (fail-fast in dev)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("[analyze] Missing required env vars.");
}

export const runtime = "nodejs"; // explicit
export const dynamic = "force-dynamic"; // this endpoint is dynamic by nature

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

// naive JSON extraction from a string that may contain markdown fences
function extractJsonBlock(s: string): string {
  // strip markdown fences ```json ... ```
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  // or first {...} block
  const firstBrace = s.indexOf("{");
  const lastBrace = s.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return s.slice(firstBrace, lastBrace + 1).trim();
  }
  return s.trim();
}

type Analysis = {
  main_emotion?: string;
  mood_tags?: string[];
  gpt_comment?: string;
};

const FALLBACK_TAGS: Record<string, string[]> = {
  anxious: ["anxious", "tense", "restless"],
  sad: ["sad", "down", "hopeless"],
  tired: ["tired", "lethargic"],
  happy: ["happy", "content"],
  unknown: [],
};

export async function POST(req: NextRequest) {
  try {
    // 1) Validate input
    const body = await req.json().catch(() => null);
    const input = (body as any)?.input?.toString().trim();
    if (!input) {
      return NextResponse.json(
        { error: "Missing 'input' string in request body." },
        { status: 400 },
      );
    }

    // 2) Ask the model (keep it concise; we’ll parse strictly)
    const prompt = `
Analyze the user's emotion from this input. Respond ONLY with JSON:
{
  "main_emotion": string,
  "mood_tags": string[],
  "gpt_comment": string
}
Input: "${input}"
`.trim();

    // Using Chat Completions for compatibility with your current setup
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const jsonText = extractJsonBlock(raw);
    const parsed = safeJSONParse<Analysis>(jsonText) ?? {};

    // 3) Normalize fields with safe fallbacks
    const emotion = (parsed.main_emotion || "unknown").toLowerCase().trim();
    const tags =
      Array.isArray(parsed.mood_tags) && parsed.mood_tags.length > 0
        ? parsed.mood_tags
        : FALLBACK_TAGS[emotion] ?? [];

    const result = {
      main_emotion: emotion,
      mood_tags: tags,
      gpt_comment:
        parsed.gpt_comment ??
        "I'm here with you. Let's try to breathe and be present.",
      recommended_routine: findFallbackRoutine(tags),
    };

    // 4) Persist to Supabase (service role bypasses RLS safely on server)
    await supabase.from("emotion_logs").insert([
      {
        input_text: input,
        main_emotion: result.main_emotion,
        mood_tags: result.mood_tags, // text[]
        gpt_comment: result.gpt_comment,
        recommended_routine: result.recommended_routine,
        // Optionally attach user_id here if you authenticate the request
        // user_id: ...
      },
    ]);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("[analyze] error:", err);
    return NextResponse.json(
      { error: "Failed to analyze emotion." },
      { status: 500 },
    );
  }
}