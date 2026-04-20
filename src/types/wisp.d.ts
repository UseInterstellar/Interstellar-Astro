declare module "@mercuryworkshop/wisp-js/server" {
  export const server: {
    routeRequest: (req: unknown, socket: unknown, head: unknown) => void;
    [key: string]: unknown;
  };
}
