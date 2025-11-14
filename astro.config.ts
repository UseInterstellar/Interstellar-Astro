import { execSync } from "node:child_process";
import path from "node:path";
import node from "@astrojs/node";
import tailwind from "@astrojs/tailwind";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
// @ts-expect-error shut
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
// @ts-expect-error shut
import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import compress from "@playform/compress";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { defineConfig } from "astro/config";
import { viteStaticCopy } from "vite-plugin-static-copy";
import INConfig from "./config";

const integrations = [tailwind({ applyBaseStyles: false })];

if (INConfig.server?.compress !== false) {
  integrations.push(
    compress({
      CSS: false,
      HTML: true,
      Image: false,
      JavaScript: true,
      SVG: true,
    }),
  );
}

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "middleware",
  }),
  integrations,
  prefetch: {
    defaultStrategy: "viewport",
    prefetchAll: false,
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
    define: {
      __COMMIT_DATE__: JSON.stringify(execSync("git show --no-patch --format=%ci").toString().trim()),
    },
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
    plugins: [
      {
        name: "vite-wisp-server",
        configureServer(server) {
          server.httpServer?.on("upgrade", (req, socket, head) => (req.url?.startsWith("/f") ? wisp.routeRequest(req, socket, head) : undefined));
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
            rename: (name) => `${name.replace("uv", "v").replace(/[aeiou]/gi, "")}.js`,
          },
        ],
      }),
    ],
  },
});
