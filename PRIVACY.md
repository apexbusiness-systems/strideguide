# StrideGuide Privacy Policy & Legal Framework

## Emergency Record Mode (ERM) - Legal Basis & Data Protection

### Jurisdiction-Specific Legal Framework

#### Canada (Excluding Quebec)
- **Legal Basis**: Criminal Code s.184(2)(a) - One-party consent for participant safety
- **Authority**: [Justice Laws Canada](https://laws-lois.justice.gc.ca/eng/acts/C-46/section-184.html)
- **Emergency Exception**: PIPEDA emergency provisions allow processing without consent when clearly in the individual's interest ([Privacy Commissioner Canada](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/))
- **Recording Policy**: Recording banner always displayed; beep default ON (user configurable)
- **Data Retention**: 7 days default, user configurable up to 30 days
- **Audio Consent**: One-party (user) consent sufficient for emergency recording

#### Quebec
- **Legal Basis**: Vital interests exception under Quebec Law 25
- **Authority**: [Osler Legal Analysis](https://www.osler.com/en/resources/regulations/2022/quebec-adopts-law-25-strengthening-the-protection-of-personal-information)
- **Transparency Requirements**: Enhanced under Law 25
- **Recording Policy**: Beep + banner FORCED (non-configurable)
- **Data Retention**: 48-72 hours default (shorter retention for enhanced privacy)
- **Event Logging**: Mandatory record of recording events
- **Audio Consent**: Emergency vital interests basis

#### United States - One-Party States
- **Legal Basis**: State one-party consent laws + vital interests
- **Recording Policy**: Banner displayed; beep default ON
- **Data Retention**: 7 days default
- **Audio Consent**: One-party (user) consent sufficient

#### United States - All-Party States
- **Legal Basis**: All-party consent required by state law
- **Reference**: [RCFP Recording Guide](https://www.rcfp.org/reporters-recording-guide/)
- **Recording Policy**: 
  - If consent not obtained: Video-only mode + forced beep + banner
  - If consent obtained: Normal operation
- **Consent Modal**: Required before audio recording
- **Data Retention**: 7 days default
- **Audio Consent**: Explicit all-party consent required

#### European Union
- **Legal Basis**: GDPR Article 6(1)(d) - Vital interests (Recital 46)
- **Authority**: [GDPR Article 6](https://gdpr-info.eu/art-6-gdpr/)
- **Recording Policy**: Banner displayed; beep configurable
- **Data Retention**: 72 hours default (data minimization principle)
- **Lawful Basis**: "Vital interests" for auto-ERM; "Consent/Legitimate interests" for manual activation
- **Data Subject Rights**: Full GDPR rights apply post-incident

### Technical Privacy Protections

#### On-Device Processing
- **Encryption**: All recordings encrypted with AES-GCM
- **Key Management**: Device keystore/keychain integration
- **Local Storage**: No cloud transmission of video/audio content
- **Ring Buffer**: 2-5 minute pre-event buffer maintained locally

#### Evidence Locker Security
- **Biometric Protection**: Touch ID/Face ID/Fingerprint required for access
- **Safe Delete**: Cryptographic deletion of expired recordings
- **Backup Exclusion**: ERM files excluded from device backups
- **Access Logging**: All access attempts logged (where legally required)

#### Network Isolation
- **Offline Operation**: Core ERM functions work without internet
- **Cellular SMS**: Emergency notifications via cellular (no data required)
- **No Frame Transmission**: Camera frames never leave device
- **Metadata Only**: Only timestamp + GPS coordinates transmitted in emergencies

### Data Minimization & Retention

#### Automatic Cleanup
- **Retention Enforcement**: Automatic deletion based on jurisdiction rules
- **Storage Caps**: User-configurable storage limits with audio-only fallback
- **Battery Protection**: Auto-stop if battery <6% with 20min recording time remaining

#### User Controls
- **Retention Settings**: User can set shorter retention periods
- **Manual Delete**: Users can delete recordings immediately
- **Export Options**: Selective export with optional face/license plate blurring
- **Consent Withdrawal**: Users can revoke all-party consent and switch to video-only

### Compliance & Auditing

#### PIPEDA/PIPA Compliance (Canada)
- **Consent**: Clear consent for emergency contact notification
- **Purpose Limitation**: Data used only for emergency response
- **Accuracy**: GPS coordinates verified before transmission
- **Safeguards**: Encryption and access controls implemented

#### GDPR Compliance (EU)
- **Lawful Basis Transparency**: Clear indication of processing basis
- **Data Subject Rights**: Access, deletion, portability implemented
- **Breach Notification**: 72-hour incident response plan
- **Privacy by Design**: Default privacy-protective settings

#### Law 25 Compliance (Quebec)
- **Enhanced Transparency**: Clear recording indicators
- **Shortened Retention**: Default 48-72 hour retention
- **Event Logging**: Comprehensive audit trail
- **Impact Assessment**: Privacy impact evaluated for high-risk processing

### Emergency Contact Data Processing

#### ICE (In Case of Emergency) Contacts
- **Collection Basis**: User consent for emergency notification
- **Processing Purpose**: Automated SMS + voice call in confirmed emergencies
- **Data Stored**: Name, phone number, relationship only
- **Retention**: Until user removes contact or deletes app
- **Transmission**: Only timestamp + GPS coordinates sent (no recording content)

#### SMS Emergency Notifications
- **Content**: "StrideGuide Emergency: [trigger] detected at [timestamp]. Recording active."
- **Location**: GPS coordinates only if location services enabled
- **No Media**: No video/audio content transmitted
- **Offline Capable**: Works via cellular without data connection

### User Rights & Controls

#### Access Rights
- **View Recordings**: Biometric-protected Evidence Locker
- **Export Data**: Generate reports of emergency events
- **Consent Management**: View and modify consent preferences
- **Contact Management**: Add/remove emergency contacts

#### Deletion Rights
- **Immediate Deletion**: Users can delete recordings at any time
- **Bulk Deletion**: Clear all recordings option
- **Account Deletion**: Complete data removal on app uninstall
- **Safe Wipe**: Cryptographic deletion ensures data irrecoverability

### Incident Response

#### Data Breach Protocol
1. **Detection**: Automated monitoring of access patterns
2. **Assessment**: Determine scope and risk level
3. **Notification**: Users notified within 72 hours (GDPR) or as required by jurisdiction
4. **Remediation**: Immediate security measures and affected user support
5. **Documentation**: Comprehensive incident reporting

#### Legal Requests
- **Law Enforcement**: Cooperation limited to legally compelled requests
- **User Notification**: Users notified unless legally prohibited
- **Data Minimization**: Only relevant, specific data provided
- **Jurisdiction Review**: Legal basis verified before disclosure

---

**Contact Information**
- Privacy Officer: privacy@strideguide.app
- Legal Department: legal@strideguide.app
- Emergency Contact: emergency@strideguide.app

**Last Updated**: December 2024
**Version**: 1.0

This privacy policy is reviewed quarterly and updated as jurisdictional requirements evolve.