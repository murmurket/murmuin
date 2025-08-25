// src/lib/routine.ts
const fallbackRoutineMap: Record<string, string> = {
  anxious: "gentle_flow",
  tense: "gentle_flow",
  restless: "evening_wind_down",
  sad: "evening_wind_down",
  tired: "sun_salutation_a",
  down: "creative_flow",
  lonely: "travel_friendly_standing_flow",
  unmotivated: "sun_salutation_a",
  stuck: "creative_flow",
};

export function findFallbackRoutine(moodTags: string[]): string {
  for (const tag of moodTags) {
    const match = fallbackRoutineMap[tag.toLowerCase()];
    if (match) return match;
  }
  return "gentle_flow"; // default fallback
}