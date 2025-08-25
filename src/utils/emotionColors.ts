// src/utils/emotionColors.ts

export const emotionColorMap: Record<
  string,
  { bg: string; text: string }
> = {
  joy: { bg: "bg-yellow-100", text: "text-yellow-800" },
  sadness: { bg: "bg-blue-100", text: "text-blue-800" },
  anger: { bg: "bg-red-100", text: "text-red-800" },
  fear: { bg: "bg-purple-100", text: "text-purple-800" },
  surprise: { bg: "bg-pink-100", text: "text-pink-800" },
  disgust: { bg: "bg-green-100", text: "text-green-800" },
  neutral: { bg: "bg-gray-100", text: "text-gray-700" },
  tired: { bg: "bg-indigo-100", text: "text-indigo-800" },
  love: { bg: "bg-rose-100", text: "text-rose-800" },
};