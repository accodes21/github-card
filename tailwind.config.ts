import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      backgroundImage: {
        "light-radial":
          "radial-gradient(circle at 50% 50%, #f0f0f0 20%, transparent 21%, transparent 49%, #f0f0f0 50%)",
        "dark-radial":
          "radial-gradient(circle at 50% 50%, #222 20%, transparent 21%, transparent 49%, #222 50%)",
      },
      animation: {
        blur: "blurAnimate 5s ease-in-out infinite alternate",
      },
      keyframes: {
        blurAnimate: {
          "0%": { backdropFilter: "blur(1px)" },
          "100%": { backdropFilter: "blur(5px)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
