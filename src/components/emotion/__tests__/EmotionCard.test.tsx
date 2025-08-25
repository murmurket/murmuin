// src/components/emotion/__tests__/EmotionCard.test.tsx

import { render, screen } from "@testing-library/react";
import EmotionCard from "../EmotionCard";
import type { EmotionLog } from "@/types/emotion";

const mockLog: EmotionLog = {
  id: "1",
  created_at: "2025-08-20T12:00:00Z",
  main_emotion: "joy",
  mood_tags: ["grateful", "energized"],
  gpt_comment: "Keep up the good vibes!",
  recommended_routine: "Go for a walk",
  input_text: "I'm feeling great today",
  user_id: "user_123",
};

describe("EmotionCard", () => {
  it("renders emotion data correctly", () => {
    render(<EmotionCard log={mockLog} />);

    expect(screen.getByText("joy")).toBeInTheDocument();
    expect(screen.getByText("💡 Go for a walk")).toBeInTheDocument();
    expect(screen.getByText(/Tags:/)).toHaveTextContent("Tags: grateful, energized");
  });

  it("renders latest style when isLatest is true", () => {
    const { container } = render(<EmotionCard log={mockLog} isLatest />);
    expect(container.firstChild).toHaveClass("bg-emerald-50");
  });
});