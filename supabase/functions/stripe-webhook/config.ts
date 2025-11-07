/**
 * Runtime config loader for edge functions
 * Reads feature flags from public/config/runtime.json
 * Falls back to safe defaults if unavailable
 */

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
 * Load runtime config from app origin
 * Non-blocking: returns defaults if fetch fails
 */
export async function loadRuntimeConfig(appOrigin: string): Promise<RuntimeConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
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
