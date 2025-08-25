// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  // Use class strategy for dark mode (next-themes / shadcn compatible)
  darkMode: "class",
  content: [
    // Your project lives under src/, so scan there
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx,mdx}",
    "./src/content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Keep your Geist fonts
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      // Add variable-driven colors required by globals.css
      colors: {
        // These map Tailwind color names to your CSS variables (OKLCH)
        // This enables classes like bg-background, text-foreground,
        // border-border, outline-ring/50, etc.
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        border: "oklch(var(--border) / <alpha-value>)",
        input: "oklch(var(--input) / <alpha-value>)",
        ring: "oklch(var(--ring) / <alpha-value>)",

        // (Optional) If you later use these tokens in classes:
        card: "oklch(var(--card) / <alpha-value>)",
        "card-foreground": "oklch(var(--card-foreground) / <alpha-value>)",
        popover: "oklch(var(--popover) / <alpha-value>)",
        "popover-foreground":
          "oklch(var(--popover-foreground) / <alpha-value>)",

        // ⬇️ Your existing palettes remain intact
        primary: {
          DEFAULT: "#44403c", // stone-700
          foreground: "#f5f5f4", // stone-50
        },
        accent: {
          DEFAULT: "#10b981", // emerald-500
          light: "#6ee7b7", // emerald-300
          dark: "#047857", // emerald-800
        },
        emotion: {
          joy: "#facc15", // yellow-400
          sadness: "#60a5fa", // blue-400
          anger: "#f87171", // red-400
          fear: "#a78bfa", // violet-400
          surprise: "#fb923c", // orange-400
          disgust: "#34d399", // green-400
          neutral: "#a1a1aa", // zinc-400
          tired: "#818cf8", // indigo-400
          love: "#f472b6", // pink-400
        },
      },
      // (Optional) Keep border radius synced with your CSS var
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    // e.g. require("tailwindcss-animate") if you use it
  ],
};

export default config;