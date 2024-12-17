import type { Config } from "@/types/config";

const config: Config = {
  // Server Configuration
  server: {
    port: 8080, // The port on which Interstellar runs (Default: 8080)
  },

  // Authentication Configuration (Optional)
  auth: {
    // Enable password protection for your instance.
    // Set challenge to true to require users to log in.
    challenge: false,

    // Format: username: "password",
    // IMPORTANT: Replace default credentials before deployment
    users: {
      interstellar: "password",
    },
  },
};

export default config;
