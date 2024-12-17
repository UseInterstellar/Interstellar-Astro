// Configuration for the application
export interface Config {
  // Server configuration
  server?: {
    // The port to run the HTTP server on
    // Default: 8080
    port?: number;
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
