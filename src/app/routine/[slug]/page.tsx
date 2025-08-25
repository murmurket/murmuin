// src/app/routine/[slug]/page.tsx
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import RoutineFeedbackWrapper from "./RoutineFeedbackWrapper";
import { CompleteRoutineButton } from './CompleteRoutineButton';

export const dynamic = "force-dynamic";
export const revalidate = 0;

// NOTE: If you already have a server-side helper, prefer importing it instead.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PageProps = { params: { slug: string } };

export default async function RoutinePage({ params }: PageProps) {
  const slug = decodeURIComponent(params?.slug ?? "");
  if (!slug) notFound();

  const { data, error } = await supabase
    .from("routines")
    .select("id, slug, title, description, steps, duration_min")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[routine] fetch error:", error);
    notFound();
  }
  if (!data) {
    console.warn("[routine] not found:", slug);
    notFound();
  }

  // Normalize steps (json or text[])
  const stepsArray: string[] = Array.isArray(data.steps)
    ? (data.steps as string[])
    : typeof data.steps === "object" && data.steps !== null
    ? Object.values(data.steps as Record<string, string>)
    : [];

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
      {data.description && <p className="text-gray-700 mb-4">{data.description}</p>}
      {data.duration_min != null && (
        <p className="text-sm text-gray-500 mb-2">Duration: {data.duration_min} min</p>
      )}

      {!!stepsArray.length && (
        <>
          <h2 className="text-xl font-semibold mt-4 mb-2">Steps</h2>
          <ol className="list-decimal list-inside space-y-1">
            {stepsArray.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </>
      )}

      {/* Use canonical DB id for feedback/logging */}
      <RoutineFeedbackWrapper routineUuid={data.id} slug={data.slug} />
      <CompleteRoutineButton routineUuid={data.id} slug={data.slug} />
    </div>
  );
}