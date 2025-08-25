// src/utils/emotionMap.ts

export const emotionEmojiMap: Record<string, string> = {
  joy: "😄",
  sadness: "😢",
  anger: "😠",
  fear: "😨",
  surprise: "😲",
  disgust: "🤢",
  neutral: "😐",
  tired: "😴",
  love: "❤️",
};

// Optional: fallback getter
export const getEmotionEmoji = (emotion: string): string =>
  emotionEmojiMap[emotion.toLowerCase()] ?? "🙂";