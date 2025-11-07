// URL validation helper for preventing open redirect vulnerabilities
import { ALLOWED_ORIGINS, isLovablePreview } from "./cors.ts";

/**
 * Validates that a URL is safe to redirect to.
 * Prevents open redirect vulnerabilities by ensuring the URL matches allowed origins.
 *
 * @param url - The URL to validate
 * @param allowRelative - Whether to allow relative URLs (default: true)
 * @returns true if the URL is safe, false otherwise
 */
export function isValidRedirectUrl(url: string, allowRelative = true): boolean {
  try {
    // Allow relative URLs if enabled
    if (allowRelative && url.startsWith('/')) {
      // Ensure it doesn't try to escape with protocol-relative URLs
      if (url.startsWith('//')) {
        return false;
      }
      return true;
    }

    // Parse the URL to validate it
    const parsedUrl = new URL(url);

    // Only allow http and https protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }

    // Build the origin from the parsed URL
    const urlOrigin = `${parsedUrl.protocol}//${parsedUrl.host}`;

    // Check against allowed origins
    if (ALLOWED_ORIGINS.includes(urlOrigin)) {
      return true;
    }

    // Check if it's a Lovable preview domain
    if (isLovablePreview(urlOrigin)) {
      return true;
    }

    return false;
  } catch {
    // Invalid URL format
    return false;
  }
}

/**
 * Sanitizes a redirect URL by validating it and returning a safe default if invalid.
 *
 * @param url - The URL to sanitize
 * @param defaultUrl - The default URL to return if validation fails (default: '/')
 * @returns A validated URL or the default
 */
export function sanitizeRedirectUrl(url: string, defaultUrl = '/'): string {
  if (!url || !isValidRedirectUrl(url)) {
    console.warn(`Invalid redirect URL blocked: ${url}`);
    return defaultUrl;
  }
  return url;
}
