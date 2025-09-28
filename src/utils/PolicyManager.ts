/**
 * Policy Manager - Centralized configuration for security and privacy policies
 * Controls feature flags, consent management, and compliance settings
 */

interface SecurityPolicy {
  cspEnabled: boolean;
  allowInlineStyles: boolean;
  allowExternalScripts: boolean;
  strictTransportSecurity: boolean;
}

interface PrivacyPolicy {
  telemetryEnabled: boolean;
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  dataRetentionDays: number;
  requireExplicitConsent: boolean;
}

interface FeatureFlags {
  cloudDescribeEnabled: boolean;
  lowEndModeEnabled: boolean;
  winterModeEnabled: boolean;
  betaFeaturesEnabled: boolean;
  debugModeEnabled: boolean;
}

interface PolicyConfig {
  security: SecurityPolicy;
  privacy: PrivacyPolicy;
  features: FeatureFlags;
  version: string;
  lastUpdated: string;
}

class PolicyManagerClass {
  private config: PolicyConfig;
  private consentGiven: boolean = false;
  private callbacks: Set<(config: PolicyConfig) => void> = new Set();

  constructor() {
    this.config = this.loadDefaultPolicy();
    this.loadStoredPolicy();
  }

  private loadDefaultPolicy(): PolicyConfig {
    return {
      security: {
        cspEnabled: true,
        allowInlineStyles: false,
        allowExternalScripts: false,
        strictTransportSecurity: true
      },
      privacy: {
        telemetryEnabled: false, // Opt-in by default
        analyticsEnabled: false,
        crashReportingEnabled: false,
        dataRetentionDays: 30,
        requireExplicitConsent: true
      },
      features: {
        cloudDescribeEnabled: process.env.CLOUD_DESCRIBE_ENABLED === 'true',
        lowEndModeEnabled: false,
        winterModeEnabled: false,
        betaFeaturesEnabled: false,
        debugModeEnabled: process.env.NODE_ENV === 'development'
      },
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    };
  }

  private loadStoredPolicy(): void {
    try {
      const stored = localStorage.getItem('strideguide_policy_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = { ...this.config, ...parsed };
      }

      const consent = localStorage.getItem('strideguide_consent_given');
      this.consentGiven = consent === 'true';
    } catch (error) {
      console.warn('Failed to load stored policy config:', error);
    }
  }

  private savePolicy(): void {
    try {
      localStorage.setItem('strideguide_policy_config', JSON.stringify(this.config));
      this.notifyCallbacks();
    } catch (error) {
      console.error('Failed to save policy config:', error);
    }
  }

  // Get current policy configuration
  getPolicy(): PolicyConfig {
    return { ...this.config };
  }

  // Update specific policy section
  updateSecurityPolicy(updates: Partial<SecurityPolicy>): void {
    this.config.security = { ...this.config.security, ...updates };
    this.config.lastUpdated = new Date().toISOString();
    this.savePolicy();
  }

  updatePrivacyPolicy(updates: Partial<PrivacyPolicy>): void {
    this.config.privacy = { ...this.config.privacy, ...updates };
    this.config.lastUpdated = new Date().toISOString();
    this.savePolicy();
  }

  updateFeatureFlags(updates: Partial<FeatureFlags>): void {
    this.config.features = { ...this.config.features, ...updates };
    this.config.lastUpdated = new Date().toISOString();
    this.savePolicy();
  }

  // Consent management
  giveConsent(): void {
    this.consentGiven = true;
    localStorage.setItem('strideguide_consent_given', 'true');
    console.log('User consent granted');
    this.notifyCallbacks();
  }

  revokeConsent(): void {
    this.consentGiven = false;
    localStorage.removeItem('strideguide_consent_given');
    
    // Disable privacy-related features
    this.updatePrivacyPolicy({
      telemetryEnabled: false,
      analyticsEnabled: false,
      crashReportingEnabled: false
    });
    
    console.log('User consent revoked');
  }

  hasConsent(): boolean {
    return this.consentGiven;
  }

  // Feature flag checks
  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return this.config.features[feature];
  }

  // Privacy checks
  canCollectTelemetry(): boolean {
    return this.consentGiven && this.config.privacy.telemetryEnabled;
  }

  canCollectAnalytics(): boolean {
    return this.consentGiven && this.config.privacy.analyticsEnabled;
  }

  canSendCrashReports(): boolean {
    return this.consentGiven && this.config.privacy.crashReportingEnabled;
  }

  // Security validation
  isSecurityFeatureEnabled(feature: keyof SecurityPolicy): boolean {
    return this.config.security[feature];
  }

  // Data retention management
  getDataRetentionDays(): number {
    return this.config.privacy.dataRetentionDays;
  }

  shouldPurgeOldData(): boolean {
    const lastPurge = localStorage.getItem('strideguide_last_purge');
    if (!lastPurge) return true;

    const daysSinceLastPurge = (Date.now() - parseInt(lastPurge)) / (1000 * 60 * 60 * 24);
    return daysSinceLastPurge >= this.config.privacy.dataRetentionDays;
  }

  markDataPurged(): void {
    localStorage.setItem('strideguide_last_purge', Date.now().toString());
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.config = this.loadDefaultPolicy();
    this.revokeConsent();
    localStorage.removeItem('strideguide_policy_config');
    this.notifyCallbacks();
    console.log('Policy configuration reset to defaults');
  }

  // Export policy for transparency
  exportPolicy(): string {
    return JSON.stringify({
      ...this.config,
      consentGiven: this.consentGiven,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  // Subscribe to policy changes
  onPolicyChange(callback: (config: PolicyConfig) => void): () => void {
    this.callbacks.add(callback);
    
    return () => {
      this.callbacks.delete(callback);
    };
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback(this.getPolicy());
      } catch (error) {
        console.error('Policy manager callback error:', error);
      }
    });
  }

  // Compliance helpers
  getPIPEDACompliantSettings(): Partial<PrivacyPolicy> {
    return {
      telemetryEnabled: false,
      analyticsEnabled: false,
      crashReportingEnabled: false,
      dataRetentionDays: 30,
      requireExplicitConsent: true
    };
  }

  applyPIPEDACompliance(): void {
    const compliantSettings = this.getPIPEDACompliantSettings();
    this.updatePrivacyPolicy(compliantSettings);
    console.log('PIPEDA compliance settings applied');
  }

  // Get compliance status
  getComplianceStatus(): {
    pipeda: boolean;
    gdpr: boolean;
    ccpa: boolean;
  } {
    const policy = this.config.privacy;
    
    return {
      pipeda: policy.requireExplicitConsent && policy.dataRetentionDays <= 365,
      gdpr: policy.requireExplicitConsent && policy.dataRetentionDays <= 365,
      ccpa: policy.requireExplicitConsent
    };
  }
}

export const PolicyManager = new PolicyManagerClass();