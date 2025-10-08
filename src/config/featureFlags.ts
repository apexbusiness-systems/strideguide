/**
 * Feature Flags - Runtime configuration
 */

export interface FeatureFlags {
  IAP_ENABLED: boolean;
  SHIP_MODE: boolean;
  WINTER_MODE: boolean;
  LOW_END_MODE: boolean;
  CLOUD_DESCRIBE_ENABLED: boolean;
}

/**
 * Get feature flags from environment and runtime config
 */
export function getFeatureFlags(): FeatureFlags {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;

  return {
    // IAP only enabled in production on native platforms
    IAP_ENABLED: isProd && typeof window !== 'undefined',
    
    // Ship mode for production
    SHIP_MODE: isProd,
    
    // Winter mode can be toggled via settings
    WINTER_MODE: false,
    
    // Low-end device mode
    LOW_END_MODE: false,
    
    // Cloud AI features
    CLOUD_DESCRIBE_ENABLED: true
  };
}

export const featureFlags = getFeatureFlags();
