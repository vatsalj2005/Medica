import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0F0D",
        surface: "#111916",
        "surface-hover": "#1A2420",
        border: "#1F2D27",
        "border-hover": "#2A3D35",
        primary: "#10B981",
        "primary-dark": "#059669",
        "primary-light": "#34D399",
        secondary: "#14B8A6",
        accent: "#06B6D4",
        "text-primary": "#F0FDF4",
        "text-secondary": "#D1FAE5",
        "text-muted": "#6EE7B7",
        "text-dim": "#4ADE80",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.4s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "shimmer": "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      boxShadow: {
        "glow-sm": "0 0 10px rgba(16, 185, 129, 0.3)",
        "glow-md": "0 0 20px rgba(16, 185, 129, 0.4)",
        "glow-lg": "0 0 30px rgba(16, 185, 129, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
