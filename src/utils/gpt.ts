// src/utils/gpt.ts

export const summarizeGptComment = (text: string): string => {
  return text.length > 80 ? text.slice(0, 80) + "..." : text;
};