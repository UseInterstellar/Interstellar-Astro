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
        interactive: "var(--interactive)",
        "interactive-secondary": "var(--interactive-secondary)",
        border: "var(--border)",
        accent: "var(--accent)",
        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",
      },
    },
  },
  daisyui: {
    prefix: "ds-",
  },
  plugins: [
    // require("daisyui")
  ],
};
