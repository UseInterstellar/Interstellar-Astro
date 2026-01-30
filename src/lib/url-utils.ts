import { DANGEROUS_SCHEMES } from "./constants";

const SAFE_SCHEMES = ["http:", "https:"];

/**
 * Check if a string is a valid HTTP(S) URL.
 * Returns false for javascript:, data:, and other dangerous schemes.
 */
export function isValidHttpUrl(str: string): boolean {
  if (!str) return false;

  const lowerStr = str.trim().toLowerCase();
  for (const scheme of DANGEROUS_SCHEMES) {
    if (lowerStr.startsWith(scheme)) return false;
  }

  try {
    const url = new URL(str);
    return SAFE_SCHEMES.includes(url.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize a URL, returning a fallback if the URL is invalid or dangerous.
 * Use this for any user-provided URLs before using them.
 */
export function sanitizeUrl(str: string, fallback: string): string {
  if (!str) return fallback;

  const trimmed = str.trim();

  const lowerStr = trimmed.toLowerCase();
  for (const scheme of DANGEROUS_SCHEMES) {
    if (lowerStr.startsWith(scheme)) return fallback;
  }

  try {
    const url = new URL(trimmed);
    if (SAFE_SCHEMES.includes(url.protocol)) {
      return url.toString();
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Validate a URL for use as an icon/image source.
 * Allows http, https, and relative paths starting with /
 */
export function isValidIconUrl(str: string): boolean {
  if (!str) return false;

  const trimmed = str.trim();

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  return isValidHttpUrl(trimmed);
}

/**
 * Sanitize a URL for use as an icon source.
 */
export function sanitizeIconUrl(str: string, fallback: string): string {
  if (!str) return fallback;

  const trimmed = str.trim();

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    if (!trimmed.includes("..")) {
      return trimmed;
    }
    return fallback;
  }

  return sanitizeUrl(trimmed, fallback);
}
