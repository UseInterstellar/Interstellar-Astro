module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        background: {
          DEFAULT: "var(--background)",
          secondary: "var(--background-secondary)",
          settings: "var(--background-settings)",
        },
        interactive: {
          DEFAULT: "var(--interactive)",
          secondary: "var(--interactive-secondary)",
        },
        border: "var(--border)",
        accent: {
          DEFAULT: "var(--accent)",
          secondary: "var(--accent-secondary)",
        },
        text: {
          DEFAULT: "var(--text)",
          secondary: "var(--text-secondary)",
          placeholder: "var(--text-placeholder)",
        },
        dropdown: "var(--dropdown)",
      },
    },
  },
};
