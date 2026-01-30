export interface Config {
  server?: {
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
