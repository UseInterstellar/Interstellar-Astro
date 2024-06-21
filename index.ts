import fs from "node:fs";
import { createServer } from "node:http";
import type { Socket } from "node:net";
import path from "node:path";
import fastifyMiddie from "@fastify/middie";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import wisp from "wisp-server-node";
if (!fs.existsSync("dist")) {
	console.error("Please run `pnpm build` first");
	process.exit(1);
}
// @ts-ignore
const ssrHandler = (await import("./dist/server/entry.mjs")).handler;
const app = Fastify({
	serverFactory: (handler) =>
		createServer()
			.on("request", handler)
			.on(
				"upgrade",
				(req, socket: Socket, head) =>
					req.url?.startsWith("/srv") && wisp.routeRequest(req, socket, head),
			),
});
await app
	.register(fastifyStatic, {
		root: path.join(import.meta.dirname, "dist", "client"),
	})
	.register(fastifyMiddie);
app.use(ssrHandler);
app.listen({ port: 8080 }, () => {
	console.log("Listening on http://localhost:8080");
});
