import node from "@astrojs/node";
import tailwind from "@astrojs/tailwind";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
// @ts-expect-error shut
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
// @ts-expect-error shut
import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { defineConfig } from "astro/config";
import { viteStaticCopy } from "vite-plugin-static-copy";
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
          server.httpServer?.on("upgrade", (req, socket, head) =>
            req.url?.startsWith("/f")
              ? wisp.routeRequest(req, socket, head)
              : undefined,
          );
        },
      },
      viteStaticCopy({
        targets: [
          {
            src: `${epoxyPath}/**/*.mjs`.replace(/\\/g, "/"),
            dest: "assets/bundled",
            overwrite: false,
            rename: (name) => `ex-${name}.mjs`,
          },
          {
            src: `${baremuxPath}/**/*.js`.replace(/\\/g, "/"),
            dest: "assets/bundled",
            overwrite: false,
            rename: (name) => `bm-${name}.js`,
          },
          {
            src: `${uvPath}/**/*.js`.replace(/\\/g, "/"),
            dest: "assets/bundled",
            overwrite: false,
            rename: (name) =>
              `${name.replace("uv", "v").replace(/[aeiou]/gi, "")}.js`,
          },
        ],
      }),
    ],
  },
});
