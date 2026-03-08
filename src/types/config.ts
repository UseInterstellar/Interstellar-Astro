export interface Config {
  server?: {
    // The port to run the HTTP server on
    // Default: 8080
    port?: number;
    obfuscate?: boolean;
    compress?: boolean;
  };
  auth?: Auth;
}

export interface Auth {
  challenge?: boolean;
  users?: Record<string, string>;
}
