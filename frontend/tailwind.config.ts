import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./context/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#080e08",
        surface: "#0f1a0f",
        "surface-2": "#162016",
        border: "#1e321e",
        "border-2": "#254525",
        primary: "#22c55e",
        "primary-hover": "#16a34a",
        "primary-dim": "#14532d",
        success: "#4ade80",
        error: "#f87171",
        warning: "#fbbf24",
        "text-primary": "#e8f5e8",
        "text-muted": "#6aaa6a",
        "text-dim": "#3d6b3d",
      },
      keyframes: {
        fadeUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideInRight: { from: { opacity: "0", transform: "translateX(20px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        slideInLeft: { from: { opacity: "0", transform: "translateX(-20px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        pulse: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        toastSlide: { from: { opacity: "0", transform: "translateX(100%)" }, to: { opacity: "1", transform: "translateX(0)" } },
      },
      animation: {
        "fade-up": "fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fadeIn 0.25s ease both",
        "slide-in-right": "slideInRight 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "slide-in-left": "slideInLeft 0.35s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 1.8s linear infinite",
        "pulse-slow": "pulse 2s ease-in-out infinite",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16,1,0.3,1) both",
        "toast-slide": "toastSlide 0.35s cubic-bezier(0.16,1,0.3,1) both",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
};
export default config;
