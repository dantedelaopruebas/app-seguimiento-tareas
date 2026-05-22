import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0a",
          subtle: "#0f0f0f",
          surface: "#141414",
          elevated: "#1a1a1a",
        },
        border: {
          DEFAULT: "#262626",
          subtle: "#1f1f1f",
          strong: "#333333",
        },
        fg: {
          DEFAULT: "#fafafa",
          muted: "#a3a3a3",
          subtle: "#737373",
          disabled: "#525252",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#7c7ff5",
          subtle: "rgba(99,102,241,0.12)",
        },
        priority: {
          urgent: "#ef4444",
          high: "#f59e0b",
          medium: "#3b82f6",
          low: "#6b7280",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "slide-up": "slide-up 180ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
