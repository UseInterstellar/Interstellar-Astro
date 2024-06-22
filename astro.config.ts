import node from "@astrojs/node";
import tailwind from "@astrojs/tailwind";
import { createBareServer } from "@tomphttp/bare-server-node";
import { defineConfig } from "astro/config";
import wisp from "wisp-server-node";
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
  vite: {
    plugins: [
      // this absurdity is made possible by astro not letting you use a custom http server :)
      {
        name: "vite-wisp-server",
        configureServer(server) {
          const bare = createBareServer("/o/");
          server.httpServer?.on("upgrade", (req, socket, head) => {
            if (req.url?.startsWith("/wisp")) {
              wisp.routeRequest(req, socket, head);
            } else if (bare.shouldRoute(req)) {
              bare.routeUpgrade(req, socket, head);
            }
          });
          server.middlewares.use((req, res, next) => {
            if (bare.shouldRoute(req)) {
              bare.routeRequest(req, res);
            } else {
              next();
            }
          });
        },
      },
    ],
  },
});
