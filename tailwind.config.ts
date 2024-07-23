module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        secondary: "hsl(var(--background-secondary))",
        interactive: {
          DEFAULT: "hsl(var(--interactive))",
          secondary: "hsl(var(--interactive-secondary))",
        },
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))",
        text: {
          DEFAULT: "hsl(var(--text))",
          secondary: "hsl(var(--text-secondary))",
        },
      },
    },
  },
};
