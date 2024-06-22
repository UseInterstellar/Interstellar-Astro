import fs from "node:fs";
import { createServer } from "node:http";
import type { Socket } from "node:net";
import path from "node:path";
import fastifyMiddie from "@fastify/middie";
import fastifyStatic from "@fastify/static";
import { createBareServer } from "@tomphttp/bare-server-node";
import { build } from "astro";
import Fastify from "fastify";
import wisp from "wisp-server-node";
const bare = createBareServer("/o/");
const app = Fastify({
	serverFactory: (handler) =>
		createServer()
			.on("request", (req, res) =>
				bare.shouldRoute(req) ? bare.routeRequest(req, res) : handler(req, res),
			)
			.on("upgrade", (req, socket: Socket, head) =>
				bare.shouldRoute(req)
					? bare.routeUpgrade(req, socket, head)
					: req.url?.startsWith("/wisp")
						? wisp.routeRequest(req, socket, head)
						: socket.destroy(),
			),
});
if (!fs.existsSync("dist")) {
	console.error("Interstellar's not built yet! Building now...");
	await build({}).catch((err) => {
		console.error(err);
		process.exit(1);
	});
}
// @ts-ignore
const ssrHandler = (await import("./dist/server/entry.mjs")).handler;
await app
	.register(fastifyStatic, {
		root: path.join(import.meta.dirname, "dist", "client"),
	})
	.register(fastifyMiddie);
app.use(ssrHandler);
app.listen(
	{ port: Number.parseInt(process.env.PORT as string) || 8080 },
	() => {
		console.log("Listening on http://localhost:8080");
	},
);
