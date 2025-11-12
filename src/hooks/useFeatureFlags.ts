/**
 * React hook for feature flag access
 * Provides reactive access to runtime flags with SSR safety
 */

import { useState, useEffect } from 'react';
import { getRuntimeConfig, loadRuntimeConfig, type RuntimeConfig } from '@/config/runtime';

export function useFeatureFlags() {
  const [config, setConfig] = useState<RuntimeConfig>(getRuntimeConfig());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ensure config is loaded on mount
    setLoading(true);
    loadRuntimeConfig()
      .then(setConfig)
      .catch((error) => {
        console.error('Failed to load runtime config:', error);
        // Keep default config on error
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    ...config,
    loading,
    isPaymentsEnabled: config.enablePayments,
    isNewAuthEnabled: config.enableNewAuth,
    isWebhooksEnabled: config.enableWebhooks,
  };
}

/**
 * Component to gate children behind feature flag
 */
interface FeatureGateProps {
  flag: keyof RuntimeConfig;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function FeatureGate({ flag, fallback, children }: FeatureGateProps) {
  const flags = useFeatureFlags();

  if (flags.loading) {
    return null;
  }

  const flagValue = flags[flag];
  
  if (!flagValue) {
    return fallback ?? null;
  }

  return children;
}
