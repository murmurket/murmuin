// src/app/routine/page.tsx  (예시: 루틴 목록 페이지)
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function RoutineListPage() {
  const { data: routines } = await supabase
    .from("routines")
    .select("id, slug, title");

  if (!routines?.length) return <p>No routines available.</p>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Available Routines</h1>
      <ul className="space-y-2">
        {routines.map((r) => (
          <li key={r.id} className="p-3 border rounded">
            <h2 className="font-semibold">{r.title}</h2>
            <Link
              href={`/routine/${encodeURIComponent(r.slug)}`}
              className="text-blue-600 hover:underline"
            >
              View
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}