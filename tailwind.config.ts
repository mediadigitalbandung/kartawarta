import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#1B4332",
          light: "#2D6A4F",
        },
        canopy: "#2D6A4F",
        sage: "#52B788",
        gold: {
          DEFAULT: "#D4A017",
          light: "#F0C040",
        },
        wheat: "#F0C040",
        press: "#111110",
        newsprint: "#FAFCF8",
        paper: "#F3F5F0",
        ink: "#6B7280",
        border: {
          DEFAULT: "#E5E7EB",
          dark: "#D1D5DB",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        mono: ['"DM Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        kicker: ["10px", { lineHeight: "1.4", letterSpacing: "0.08em", fontWeight: "500" }],
        meta: ["11px", { lineHeight: "1.4", fontWeight: "400" }],
        caption: ["10px", { lineHeight: "1.4", fontWeight: "400" }],
      },
      borderWidth: {
        thin: "0.5px",
      },
      borderRadius: {
        card: "4px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "fade-up": "fadeUp 0.5s ease-out",
        "scroll-x": "scrollX 35s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
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
