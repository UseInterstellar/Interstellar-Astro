import node from "@astrojs/node";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	output: "server",
	adapter: node({
		mode: "middleware",
	}),
	integrations: [tailwind({ applyBaseStyles: false })],
	prefetch: {
		defaultStrategy: "viewport",
		prefetchAll: true,
	},
});
