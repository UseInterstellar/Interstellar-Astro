export interface Config {
  auth?: Auth;
  /**
   * The port to run the HTTP server on
   * @default 8080
   */
  port?: number;
}
export interface Auth {
  /**
   * Enable password protection
   * @default false
   */
  challenge?: boolean;
  /**
   * Users and their passwords
   * @example ```js
   { "interstellarskidder": "superSecretPassword!!!" }
   ```
   */
  users?: Record<string, string>;
}
