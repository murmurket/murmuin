// src/types/emotion.ts

// Type definition for a single emotion log entry
export interface EmotionLog {
  id: string;
  created_at: string | null;
  main_emotion: string | null;
  mood_tags: string[] | null;
  gpt_comment: string | null;
  recommended_routine: string | null;
  input_text: string | null;
  user_id: string | null;
}

// Props for the EmotionCard component
export interface EmotionCardProps {
  log: EmotionLog;
  isLatest?: boolean;
}