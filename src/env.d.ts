/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
declare global {
  const __COMMIT_DATE__: string;
  interface Window {
    __uv$config: {
      prefix: string;
      encodeUrl: (str: string) => string;
      decodeUrl: (str: string) => string;
    };
    __uv$location?: Location;
    connection: BareMuxConnection | undefined;
  }
}
import type { BareMuxConnection } from "@mercuryworkshop/bare-mux";
