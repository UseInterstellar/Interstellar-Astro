import type { Config } from "@/types/config";

function buildAuthUsers(): Record<string, string> {
  const users: Record<string, string> = {};

  const authUser = process.env.AUTH_USER;
  const authPass = process.env.AUTH_PASS;
  if (authUser && authPass) {
    users[authUser] = authPass;
  }

  const authUsersJson = process.env.AUTH_USERS;
  if (authUsersJson) {
    try {
      const parsed = JSON.parse(authUsersJson);
      Object.assign(users, parsed);
    } catch {
      console.error("Failed to parse AUTH_USERS environment variable as JSON");
    }
  }

  return users;
}

const config: Config = {
  server: {
    port: Number(process.env.PORT) || 8080,
    obfuscate: process.env.OBFUSCATE !== "false",
    compress: process.env.COMPRESS !== "false",
  },

  auth: {
    challenge: process.env.AUTH_CHALLENGE === "true",
    users: buildAuthUsers(),
  },
};

if (config.auth?.challenge && Object.keys(config.auth.users || {}).length === 0) {
  console.error("\x1b[31mError: AUTH_CHALLENGE is enabled but no users configured.\x1b[0m");
  console.error("Set AUTH_USER and AUTH_PASS environment variables, or AUTH_USERS as JSON.");
  console.error("Example: AUTH_USER=admin AUTH_PASS=secretpassword");
  console.error('Example: AUTH_USERS=\'{"admin":"password123"}\'');
  process.exit(1);
}

export default config;
