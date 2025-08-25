// src/app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { safeJSONParse } from "@/lib/utils";
import { findFallbackRoutine } from "@/lib/routine";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("[analyze] Missing env(s):", {
    OPENAI: !!OPENAI_API_KEY,
    SUPABASE_URL: !!SUPABASE_URL,
    SRK: !!SUPABASE_SERVICE_ROLE_KEY,
  });
}

// OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  // @ts-ignore
  timeout: 30_000,
  maxRetries: 2,
});

// Supabase (Service Role: server-only usage)
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

function extractJsonBlock(s: string): string {
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const i = s.indexOf("{");
  const j = s.lastIndexOf("}");
  if (i !== -1 && j !== -1 && j > i) return s.slice(i, j + 1).trim();
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
    if (!OPENAI_API_KEY)
      return NextResponse.json(
        { error: "Server is misconfigured: OPENAI_API_KEY is missing." },
        { status: 500 }
      );
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)
      return NextResponse.json(
        { error: "Server is misconfigured: Supabase env vars are missing." },
        { status: 500 }
      );

    const body = await req.json().catch(() => null);
    const input = (body as any)?.input?.toString().trim();
    if (!input) {
      return NextResponse.json(
        { error: "Missing 'input' string in request body." },
        { status: 400 }
      );
    }

    // 1) Ask model
    const prompt = `
Analyze the user's emotion from this input. Respond ONLY with JSON:
{
  "main_emotion": string,
  "mood_tags": string[],
  "gpt_comment": string
}
Input: "${input}"
`.trim();

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const jsonText = extractJsonBlock(raw);
    const parsed = safeJSONParse<Analysis>(jsonText) ?? {};

    // 2) Normalize result
    const emotion = (parsed.main_emotion || "unknown").toLowerCase().trim();
    const tags =
      Array.isArray(parsed.mood_tags) && parsed.mood_tags.length > 0
        ? parsed.mood_tags.filter((t) => typeof t === "string")
        : FALLBACK_TAGS[emotion] ?? [];

    const recommendedSlug = findFallbackRoutine(tags);

    const result = {
      main_emotion: emotion,
      mood_tags: tags,
      gpt_comment:
        typeof parsed.gpt_comment === "string" && parsed.gpt_comment.trim()
          ? parsed.gpt_comment
          : "I'm here with you. Let's try to breathe and be present.",
      // keep returning slug to the client (human-friendly)
      recommended_routine: recommendedSlug,
    };

    // 3) Translate slug -> uuid (so the DB can store immutable FK)
    const { data: routineRow, error: routineErr } = await supabase
      .from("routines")
      .select("id")
      .eq("slug", recommendedSlug)
      .maybeSingle();

    if (routineErr) {
      console.warn("[analyze] slug->uuid lookup error:", routineErr);
    }
    const routineUuid: string | null = routineRow?.id ?? null;

    // 4) Insert log
    //    - Always store the slug in `recommended_routine` (existing text column)
    //    - If you added a UUID column (`recommended_routine_uuid`), we also populate it.
    const payload: Record<string, any> = {
      input_text: input,
      main_emotion: result.main_emotion,
      mood_tags: result.mood_tags,
      gpt_comment: result.gpt_comment,
      recommended_routine: recommendedSlug, // slug (for readability / backward compatibility)
    };
    if (routineUuid) {
      // Will be ignored by Postgres if the column doesn't exist
      payload.recommended_routine_uuid = routineUuid;
    }

    const { error: dbErr } = await supabase.from("emotion_logs").insert([payload]);

    if (dbErr) {
      console.error("[analyze] supabase insert error:", dbErr);
      return NextResponse.json(
        { ...result, routine_id: routineUuid, warning: "Saved analysis, but failed to persist log." },
        { status: 207 }
      );
    }

    // 5) Return both (slug for UX, uuid for internal follow-ups if you need)
    return NextResponse.json({ ...result, routine_id: routineUuid }, { status: 200 });
  } catch (e: any) {
    const status: number | undefined =
      e?.status ?? e?.response?.status ?? e?.cause?.status;

    if (status === 429) {
      const retryAfter =
        Number(e?.response?.headers?.get?.("retry-after")) ||
        Number(e?.headers?.get?.("retry-after")) ||
        30;
      return new NextResponse(
        JSON.stringify({
          error:
            "⚠️ Emotion analysis temporarily unavailable (quota or rate limit exceeded). Please try again soon.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.max(1, retryAfter)),
          },
        }
      );
    }

    if (status === 401 || status === 403) {
      return NextResponse.json(
        { error: "OpenAI authentication failed. Check API key/permissions." },
        { status: status ?? 401 }
      );
    }

    if (status === 400 || status === 404) {
      const detail =
        e?.response?.data?.error?.message ||
        e?.message ||
        "Invalid request (model or parameters).";
      return NextResponse.json({ error: detail }, { status: status ?? 400 });
    }

    const msg =
      e?.response?.data?.error?.message ||
      e?.message ||
      "Failed to analyze emotion.";
    console.error("[analyze] fatal:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}