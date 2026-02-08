import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#d4af37",
          dark: "#b8941e",
          light: "#f4e4bc",
        },
        mystic: {
          bg: "#0f0a1e",
          card: "#19142d",
          purple: "#6b3fa0",
          "deep-blue": "#1a1040",
        },
      },
      fontFamily: {
        serif: ["Cinzel", "Noto Serif JP", "serif"],
        sans: ["Noto Sans JP", "Hiragino Kaku Gothic ProN", "sans-serif"],
      },
      animation: {
        twinkle: "twinkle 3s infinite ease-in-out",
        float: "float 4s infinite ease-in-out",
        glow: "glow 3s infinite ease-in-out",
        shimmer: "shimmer 2s infinite linear",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(212, 175, 55, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
