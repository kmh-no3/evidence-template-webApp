import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b1220",
        foreground: "#e6edf3",
        primary: {
          DEFAULT: "#9dd1ff",
          dark: "#58a6ff",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.10)",
          light: "rgba(255,255,255,0.08)",
        },
        card: {
          DEFAULT: "rgba(255,255,255,0.04)",
          hover: "rgba(255,255,255,0.06)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
