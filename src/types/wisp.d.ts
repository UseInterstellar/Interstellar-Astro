/**
 * Type definitions for @mercuryworkshop/wisp-js
 */

declare module "@mercuryworkshop/wisp-js/server" {
  import type { IncomingMessage } from "node:http";
  import type { Socket } from "node:net";

  interface WispServer {
    routeRequest(req: IncomingMessage, socket: Socket, head: Buffer): void;
  }

  export const server: WispServer;
}
