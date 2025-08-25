// src/app/routine/[id]/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import RoutineFeedbackWrapper from './RoutineFeedbackWrapper';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function RoutinePage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Routine not found:', error);
    notFound();
  }

  const { title, description, steps, duration_min } = data;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-700 mb-4">{description}</p>
      <p className="text-sm text-gray-500 mb-2">Duration: {duration_min} min</p>

      <h2 className="text-xl font-semibold mt-4 mb-2">Steps</h2>
      <ol className="list-decimal list-inside space-y-1">
        {steps.map((step: string, i: number) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <RoutineFeedbackWrapper routineId={id} />
    </div>
  );
}