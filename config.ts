import type { Config } from "@/types/config";

const config: Config = {
  // Server Configuration
  server: {
    host: "0.0.0.0", // Host/interface to bind (use "127.0.0.1" or "localhost" for local-only)
    port: 8080, // The port on which Interstellar runs (Default: 8080)
    obfuscate: false, // Set to false to disable obfuscation
    compress: false, // Set to false to disable compression
  },

  // Password Protection (Optional)
  auth: {
    // Enable password protection for your instance.
    challenge: false, // Set to true to require users to log in.
    // Add your users here: username: "password"
    // WARNING: Change default credentials before using
    users: {
      interstellar: "password",
    },
  },
};

export default config;
