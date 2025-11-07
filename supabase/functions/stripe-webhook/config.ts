/**
 * Runtime config loader for edge functions
 * Reads feature flags from public/config/runtime.json
 * Falls back to safe defaults if unavailable
 */

import { ALLOWED_ORIGINS, isLovablePreview } from "../_shared/cors.ts";

interface RuntimeConfig {
  enablePayments: boolean;
  enableNewAuth: boolean;
  enableWebhooks: boolean;
}

const DEFAULT_CONFIG: RuntimeConfig = {
  enablePayments: false,
  enableNewAuth: false,
  enableWebhooks: false,
};

let cachedConfig: RuntimeConfig | null = null;

/**
 * Validates that an origin is safe to fetch from (prevents SSRF)
 */
function isValidOrigin(origin: string): boolean {
  if (!origin) return false;

  try {
    const url = new URL(origin);

    // Only allow http/https
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    const fullOrigin = `${url.protocol}//${url.host}`;

    // Check against allowed origins
    if (ALLOWED_ORIGINS.includes(fullOrigin)) {
      return true;
    }

    // Check if Lovable preview
    if (isLovablePreview(fullOrigin)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Load runtime config from app origin
 * Non-blocking: returns defaults if fetch fails
 * SECURITY: Validates origin to prevent SSRF attacks
 */
export async function loadRuntimeConfig(appOrigin: string): Promise<RuntimeConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    // SECURITY FIX: Validate origin to prevent SSRF
    if (!isValidOrigin(appOrigin)) {
      console.warn(`[Config] Invalid origin blocked: ${appOrigin}`);
      return DEFAULT_CONFIG;
    }

    const response = await fetch(`${appOrigin}/config/runtime.json`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.warn('[Config] Failed to load runtime config, using defaults');
      return DEFAULT_CONFIG;
    }

    const config = await response.json();
    cachedConfig = {
      enablePayments: Boolean(config.enablePayments),
      enableNewAuth: Boolean(config.enableNewAuth),
      enableWebhooks: Boolean(config.enableWebhooks),
    };

    return cachedConfig;
  } catch (error) {
    console.warn('[Config] Error loading runtime config:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Get cached config or defaults
 */
export function getRuntimeConfig(): RuntimeConfig {
  return cachedConfig || DEFAULT_CONFIG;
}
