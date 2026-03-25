import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0a",
          secondary: "#141414",
          tertiary: "#1a1a1a",
          card: "#1e1e1e",
          hover: "#252525",
          elevated: "#2a2a2a",
        },
        brand: {
          DEFAULT: "#0d7c4a",
          dark: "#095e38",
          light: "#10b068",
        },
        gold: {
          DEFAULT: "#c9a84c",
          dark: "#a68a3a",
          light: "#dfc06a",
          pale: "#f5ecd0",
        },
        accent: {
          blue: "#0ea5e9",
          green: "#10b068",
          yellow: "#c9a84c",
          purple: "#a855f7",
        },
        text: {
          primary: "#ffffff",
          secondary: "#a1a1aa",
          muted: "#71717a",
          dim: "#52525b",
        },
        border: {
          DEFAULT: "#27272a",
          light: "#3f3f46",
          hover: "#52525b",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', "system-ui", "sans-serif"],
        serif: ['"Merriweather"', "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "fade-up": "fadeUp 0.5s ease-out",
        "slide-left": "slideLeft 0.3s ease-out",
        "slide-right": "slideRight 0.3s ease-out",
        shimmer: "shimmer 2s infinite linear",
        "scroll-x": "scrollX 30s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideLeft: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideRight: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        scrollX: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
