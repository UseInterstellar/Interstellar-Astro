import type { Config } from "@/types/config";

const config: Config = {
  // Customize the port Interstellar runs on (Default: 8080)
  port: 8080,

  // Protect your Instance with logins (Optional)
  auth: {
    challenge: false, // Password protection (Default: False)
    users: {
      interstellar: "password", // Add usernames and passwords here
    },
  },
};

export default config;
