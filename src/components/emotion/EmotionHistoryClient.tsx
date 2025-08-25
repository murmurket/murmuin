// src/components/emotion/EmotionHistoryClient.tsx
'use client';

import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];

export default function EmotionHistoryClient({ logs }: { logs: { main_emotion: string; created_at: string }[] }) {
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [logs]);

  const timelineData = sortedLogs.map((log, i) => ({
    index: i + 1,
    emotion: log.main_emotion,
    created_at: new Date(log.created_at).toLocaleDateString(),
  }));

  const emotionCountMap = sortedLogs.reduce((acc: Record<string, number>, log) => {
    acc[log.main_emotion] = (acc[log.main_emotion] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(emotionCountMap).map(([emotion, count]) => ({
    name: emotion,
    value: count,
  }));

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📘 My Emotion History</h1>

      <h2 className="text-lg font-semibold mb-2">Emotion Trend Over Time</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={timelineData}>
          <XAxis dataKey="created_at" />
          <YAxis hide />
          <Tooltip />
          <Line dataKey="emotion" type="monotone" stroke="#3b82f6" dot={true} />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="text-lg font-semibold mt-6 mb-2">Emotion Distribution</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <h2 className="text-lg font-semibold mt-8 mb-2">Recent Logs</h2>
      <ul className="space-y-2 text-sm">
        {sortedLogs.slice().reverse().map((log, i) => (
          <li key={i} className="border p-3 rounded">
            <span className="font-medium capitalize">{log.main_emotion}</span>
            <span className="ml-2 text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}