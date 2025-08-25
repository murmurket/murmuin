'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { createClient } from '@supabase/supabase-js';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function HistoryClient({ userId }: { userId: string }) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function fetchData() {
      const { data, error } = await supabase
        .from('routine_logs')
        .select('routine_id, feedback, created_at')
        .eq('user_id', userId) // ✅ 로그인한 사용자에 해당하는 로그만 가져오기
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLogs(data);
      }
    }

    fetchData();
  }, [userId]);

  const routineCounts = logs.reduce((acc: Record<string, number>, log) => {
    acc[log.routine_id] = (acc[log.routine_id] || 0) + 1;
    return acc;
  }, {});

  const feedbackCounts = logs.reduce((acc: Record<string, number>, log) => {
    acc[log.feedback] = (acc[log.feedback] || 0) + 1;
    return acc;
  }, {});

  const routineData = Object.entries(routineCounts).map(([routine_id, count]) => ({
    name: routine_id.replace(/_/g, ' '),
    routine_id,
    count,
  }));

  const feedbackData = Object.entries(feedbackCounts).map(([feedback, count]) => ({
    name: feedback,
    value: count,
  }));

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🧘 My Routine History</h1>

      <h2 className="text-lg font-semibold mt-4 mb-2">Routine Completion Count</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={routineData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>

      <h2 className="text-lg font-semibold mt-6 mb-2">Feedback Distribution</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={feedbackData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {feedbackData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <h2 className="text-lg font-semibold mt-8 mb-2">Recent Activity</h2>
      <ul className="space-y-4">
        {logs.map((log, i) => (
          <li key={i} className="border p-4 rounded">
            <Link href={`/routine/${log.routine_id}`} className="font-semibold text-blue-600 hover:underline capitalize">
              {log.routine_id.replace(/_/g, ' ')}
            </Link>
            <p className="text-sm text-gray-500">
              🕒 {new Date(log.created_at).toLocaleString()}
            </p>
            <p className="text-sm mt-1">📝 Feedback: <span className="italic">{log.feedback}</span></p>
          </li>
        ))}
      </ul>
    </div>
  );
}