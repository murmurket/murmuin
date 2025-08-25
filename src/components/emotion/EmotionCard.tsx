// src/components/emotion/EmotionCard.tsx

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getEmotionEmoji } from "@/utils/emotionMap";
import { emotionColorMap } from "@/utils/emotionColors";
import { formatDate } from "@/utils/format";
import type { EmotionCardProps } from "@/types/emotion";

export default function EmotionCard({ log, isLatest = false }: EmotionCardProps) {
  const emotion = log.main_emotion ?? "unknown";
  const colors = emotionColorMap[emotion] ?? {
    bg: "bg-gray-100",
    text: "text-gray-800",
  };

  return (
    <Card
      className={
        isLatest
          ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900 dark:border-emerald-600"
          : "bg-white dark:bg-gray-800"
      }
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className={`text-base ${colors.text}`}>
              <span className={`mr-1 ${colors.bg}`}>{getEmotionEmoji(emotion)}</span>
              <strong className="capitalize">{emotion}</strong>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                {formatDate(log.created_at ?? "")}
              </span>
            </p>
            {log.mood_tags?.length && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Tags: {log.mood_tags.join(", ")}
              </p>
            )}
          </div>
          {log.recommended_routine && (
            <span className="text-sm text-green-600 dark:text-green-400">
              💡 {log.recommended_routine}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
