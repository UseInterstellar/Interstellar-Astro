import node from "@astrojs/node";
import tailwind from "@astrojs/tailwind";
// @ts-expect-error shut
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { createBareServer } from "@tomphttp/bare-server-node";
import { defineConfig } from "astro/config";
import { viteStaticCopy } from "vite-plugin-static-copy";
import wisp from "wisp-server-node";
// https://astro.build/config
export default defineConfig({
  output: "hybrid",
  adapter: node({
    mode: "middleware",
  }),
  integrations: [tailwind({ applyBaseStyles: false })],
  prefetch: {
    defaultStrategy: "viewport",
    prefetchAll: true,
  },
  image: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/UseInterstellar/**",
      },
    ],
  },
  vite: {
    plugins: [
      // this absurdity is made possible by astro not letting you use a custom http server :)
      {
        name: "vite-wisp-server",
        configureServer(server) {
          const bare = createBareServer("/o/");
          server.httpServer?.on("upgrade", (req, socket, head) =>
            bare.shouldRoute(req)
              ? bare.routeUpgrade(req, socket, head)
              : req.url?.startsWith("/f")
                ? wisp.routeRequest(req, socket, head)
                : undefined,
          );
          server.middlewares.use((req, res, next) =>
            bare.shouldRoute(req) ? bare.routeRequest(req, res) : next(),
          );
        },
      },
      viteStaticCopy({
        targets: [
          {
            src: `${epoxyPath}/**/*`.replace(/\\/g, "/"),
            dest: "assets/ex",
            overwrite: false,
          },
        ],
      }),
    ],
  },
});
