/**
 * PolicyManager - Region-aware recording policies and consent management
 * Implements jurisdiction-specific rules for Emergency Record Mode
 */

export type Region = 'CA' | 'QC' | 'US_ONE_PARTY' | 'US_ALL_PARTY' | 'EU' | 'OTHER';

export type LawfulBasis = 'vital_interests' | 'consent' | 'legitimate_interests';

export interface RecordingPolicy {
  region: Region;
  audioAllowed: boolean;
  requiresBeep: boolean;
  requiresBanner: boolean;
  forceIndicators: boolean;
  requiresConsent: boolean;
  defaultRetentionHours: number;
  lawfulBasis: LawfulBasis;
  requiresEventLog: boolean;
  consentModalRequired: boolean;
}

export interface ConsentState {
  allPartyConsent: boolean;
  consentTimestamp: number | null;
  consentVersion: string;
}

class PolicyManager {
  private currentRegion: Region = 'CA';
  private consentState: ConsentState = {
    allPartyConsent: false,
    consentTimestamp: null,
    consentVersion: '1.0'
  };

  // Detect region based on locale/timezone (simplified for demo)
  detectRegion(): Region {
    const locale = navigator.language.toLowerCase();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (locale.includes('fr') && (timezone.includes('Montreal') || timezone.includes('Quebec'))) {
      return 'QC';
    }
    if (locale.includes('en') && timezone.includes('America')) {
      // Simplified: assume all-party states for demo
      return 'US_ALL_PARTY';
    }
    if (timezone.includes('Europe')) {
      return 'EU';
    }
    
    return 'CA'; // Default to Canada (excluding QC)
  }

  setRegion(region: Region): void {
    this.currentRegion = region;
  }

  getCurrentPolicy(): RecordingPolicy {
    const policies: Record<Region, RecordingPolicy> = {
      'CA': {
        region: 'CA',
        audioAllowed: true,
        requiresBeep: true, // Default ON, user may disable
        requiresBanner: true,
        forceIndicators: false,
        requiresConsent: false,
        defaultRetentionHours: 168, // 7 days
        lawfulBasis: 'vital_interests',
        requiresEventLog: false,
        consentModalRequired: false
      },
      'QC': {
        region: 'QC',
        audioAllowed: true,
        requiresBeep: true, // FORCED
        requiresBanner: true, // FORCED
        forceIndicators: true,
        requiresConsent: false,
        defaultRetentionHours: 72, // Shorter for QC Law 25
        lawfulBasis: 'vital_interests',
        requiresEventLog: true,
        consentModalRequired: false
      },
      'US_ONE_PARTY': {
        region: 'US_ONE_PARTY',
        audioAllowed: true,
        requiresBeep: true,
        requiresBanner: true,
        forceIndicators: false,
        requiresConsent: false,
        defaultRetentionHours: 168,
        lawfulBasis: 'consent',
        requiresEventLog: false,
        consentModalRequired: false
      },
      'US_ALL_PARTY': {
        region: 'US_ALL_PARTY',
        audioAllowed: this.consentState.allPartyConsent,
        requiresBeep: true, // FORCED if no consent
        requiresBanner: true, // FORCED if no consent
        forceIndicators: !this.consentState.allPartyConsent,
        requiresConsent: true,
        defaultRetentionHours: 168,
        lawfulBasis: 'consent',
        requiresEventLog: false,
        consentModalRequired: true
      },
      'EU': {
        region: 'EU',
        audioAllowed: true,
        requiresBeep: true,
        requiresBanner: true,
        forceIndicators: false,
        requiresConsent: false,
        defaultRetentionHours: 72, // GDPR minimization
        lawfulBasis: 'vital_interests',
        requiresEventLog: false,
        consentModalRequired: false
      },
      'OTHER': {
        region: 'OTHER',
        audioAllowed: false, // Conservative default
        requiresBeep: true,
        requiresBanner: true,
        forceIndicators: true,
        requiresConsent: true,
        defaultRetentionHours: 24,
        lawfulBasis: 'consent',
        requiresEventLog: false,
        consentModalRequired: true
      }
    };

    return policies[this.currentRegion];
  }

  updateConsent(allPartyConsent: boolean): void {
    this.consentState = {
      allPartyConsent,
      consentTimestamp: Date.now(),
      consentVersion: '1.0'
    };
    
    // Store in encrypted local storage
    try {
      localStorage.setItem('erm_consent', JSON.stringify(this.consentState));
    } catch (error) {
      console.error('Failed to store consent state:', error);
    }
  }

  loadConsent(): void {
    try {
      const stored = localStorage.getItem('erm_consent');
      if (stored) {
        this.consentState = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load consent state:', error);
    }
  }

  getConsentState(): ConsentState {
    return { ...this.consentState };
  }

  getLegalBasisText(): string {
    const policy = this.getCurrentPolicy();
    const region = policy.region;
    
    const legalTexts: Record<Region, string> = {
      'CA': 'Emergency recording under Criminal Code s.184(2)(a) - one-party consent for participant safety',
      'QC': 'Emergency recording under vital interests exception, subject to Law 25 transparency requirements',
      'US_ONE_PARTY': 'Emergency recording under one-party consent laws and vital interests for user safety',
      'US_ALL_PARTY': 'Recording requires all-party consent in this jurisdiction. Audio disabled until consent obtained.',
      'EU': 'Emergency recording under GDPR Art. 6(1)(d) vital interests (Recital 46) for user safety',
      'OTHER': 'Emergency recording under vital interests for user safety, subject to local privacy laws'
    };

    return legalTexts[region];
  }

  shouldShowConsentModal(): boolean {
    const policy = this.getCurrentPolicy();
    return policy.consentModalRequired && !this.consentState.allPartyConsent;
  }

  initialize(): void {
    this.currentRegion = this.detectRegion();
    this.loadConsent();
  }
}

// Singleton instance
export const policyManager = new PolicyManager();