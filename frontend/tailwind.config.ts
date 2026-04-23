import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0f1117",
        surface: "#1a1d27",
        border: "#2a2d3a",
        primary: "#6366f1",
        secondary: "#8b5cf6",
        success: "#22c55e",
        error: "#ef4444",
        warning: "#f59e0b",
        "text-primary": "#f1f5f9",
        "text-muted": "#94a3b8",
      },
    },
  },
  plugins: [],
};
export default config;
