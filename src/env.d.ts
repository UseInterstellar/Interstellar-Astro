/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
declare global {
  const __COMMIT_DATE__: string;
  function $scramjetLoadController(): { ScramjetController: new (config: unknown) => { init(): void } };
  interface Window {
    connection: BareMuxConnection | undefined;
    _0?: Record<string, string>;
    _1?: Record<string, string>;
    _2?: Record<string, string>;
    _3?: string;
    __scramjet$config?: {
      prefix: string;
      codec: { encode(url: string): string; decode(url: string): string };
    };
  }
}
import type { BareMuxConnection } from "@mercuryworkshop/bare-mux";
