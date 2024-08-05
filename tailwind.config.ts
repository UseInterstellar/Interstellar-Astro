module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        secondary: "var(--background-secondary)",
        interactive: {
          DEFAULT: "var(--interactive)",
          secondary: "var(--interactive-secondary)",
        },
        border: "var(--border)",
        accent: "var(--accent)",
        text: {
          DEFAULT: "var(--text)",
          secondary: "var(--text-secondary)",
        },
      },
    },
  },
};
