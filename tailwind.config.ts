import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter"],
      },
      colors: {
        background: "var(--background)",
      },
    },
  },
  plugins: [],
};
export default config;
