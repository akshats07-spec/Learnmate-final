/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Modern Executive Neutral Palette (Linear / Vercel inspired)
        ink: "#08090E",
        panel: "#0D1017",
        surface: "#121620",
        card: "#111520",
        "card-hover": "#161B26",
        line: "rgba(255, 255, 255, 0.08)",
        "line-bright": "rgba(255, 255, 255, 0.16)",
        muted: "#94A3B8",
        subtle: "#64748B",
        // Primary Electric Indigo
        violet: { 
          DEFAULT: "#6366F1", 
          dim: "#4F46E5", 
          bright: "#818CF8", 
          glow: "rgba(99, 102, 241, 0.12)" 
        },
        // Accents
        mint: { DEFAULT: "#10B981", dim: "#059669", light: "#34D399" },
        amber: { DEFAULT: "#F59E0B", dim: "#D97706" },
        rose: { DEFAULT: "#F43F5E", dim: "#E11D48" },
        sky: { DEFAULT: "#0EA5E9", dim: "#0284C7" },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Fira Code", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)",
        elevated: "0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -2px rgba(0, 0, 0, 0.4)",
        modal: "0 20px 40px -8px rgba(0, 0, 0, 0.7), 0 8px 16px -4px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease both",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
export default config;
