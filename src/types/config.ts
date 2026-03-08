// Configuration for the application
export interface Config {
  // Server configuration
  server?: {
    // The host/address to bind the HTTP server to
    // Default: "0.0.0.0" (all interfaces)
    host?: string;

    // The port to run the HTTP server on
    // Default: 8080
    port?: number;

    // Enable build obfuscation
    // Default: true
    obfuscate?: boolean;

    // Enable compression
    // Default: true
    compress?: boolean;
  };

  // Authentication configuration
  auth?: Auth;
}

// Authentication settings
export interface Auth {
  // Enable password protection
  // Default: false
  challenge?: boolean;

  // Users and their passwords
  // Example: "username": "password",
  users?: Record<string, string>;
}
