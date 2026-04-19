import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-card": "var(--bg-card)",
        "purple-primary": "var(--purple-primary)",
        "purple-light": "var(--purple-light)",
        "accent-yes": "var(--accent-yes)",
        "accent-no": "var(--accent-no)",
        "accent-gold": "var(--accent-gold)",
      },
      fontFamily: {
        sans: ["Pretendard", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
