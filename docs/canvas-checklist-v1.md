# StrideGuide — Canvas Checklist (v1)

## Product Overview
- **Name**: StrideGuide
- **Tagline (EN)**: Your seeing‑eye assistant in your pocket
- **Tagline (FR)**: Votre assistant de guidage visuel, dans votre poche
- **Target**: Seniors & blind users in Canada (EN/FR), expanding to US/EU

## Pricing Tiers & Usage Caps

### Free Tier
- **Daily Limit**: 2 hours active guidance time only
- **Features**: Basic obstacle detection, stereo audio cues, fall detection, SOS
- **Restrictions**: NO night mode access
- **Metering**: Local device tracking, resets daily at midnight
- **Limit Behavior**: Guidance pauses, TTS notice + upgrade CTA

### Paid Tier - Premium ($28.99/month)
- **Daily Limit**: 8 hours active guidance time
- **Features**: All free features PLUS night mode, enhanced low-light detection
- **Incentive**: Free neck strap with breakaway safety clasp included
- **Metering**: Same local tracking, higher threshold

## Core Technical Requirements

### Offline-First Architecture
- ✅ All safety-critical flows work offline
- ✅ No camera frames leave device by default
- ✅ On-device YOLO-nano inference ≤800px @10+ FPS
- ✅ Local TTS EN/FR with offline voices
- ✅ Usage metering stored locally only

### Night Mode (Feature-Gated)
- ✅ Low-light capture enhancement pipeline
- ✅ Platform-specific optimizations (AVFoundation/CameraX)
- ✅ Feature flag: NIGHT_MODE_ENABLED (Premium only)
- ✅ Fallback to enhanced processing if hardware limited

### Accessibility (WCAG 2.2 AA+)
- ✅ Touch targets ≥52dp/pt minimum
- ✅ VoiceOver/TalkBack complete labeling
- ✅ High contrast palette support
- ✅ Logical focus order throughout UI
- ✅ Haptic feedback patterns for guidance

### i18n Support
- ✅ EN/FR string externalization complete
- ✅ Parity for all new pricing/upgrade/strap content
- ✅ TTS voices available offline for both languages
- ✅ Metric units throughout (meters, celsius)

## Strap Incentive Program
- **Target**: Paid plan sign-up conversion
- **Item**: Universal phone neck strap
- **Safety**: Breakaway clasp (15 lbs force)
- **Material**: Soft, skin-safe, adjustable length
- **Compatibility**: Works with phone cases
- **Branding**: StrideGuide logo on tab/clip

## Test Gates (All Must Pass)

### Pricing Flow Tests
- [ ] Free user hits 2h limit → guidance pauses → TTS notice → upgrade CTA
- [ ] Premium user gets 8h limit + night mode access
- [ ] Night mode locked for free users with proper VO/TB hint
- [ ] Usage meter resets daily at midnight local time

### Accessibility Tests  
- [ ] All touch targets measure ≥52dp/pt
- [ ] VoiceOver/TalkBack announces control names, roles, states
- [ ] Haptic patterns fire on tap confirmations and SOS countdown
- [ ] High contrast mode increases color ratios to AAA
- [ ] Tab order logical across all screens

### i18n Tests
- [ ] EN/FR toggle works for all new strings
- [ ] TTS voices pronounce upgrade prompts correctly
- [ ] Pricing displays match locale currency formatting
- [ ] Strap incentive copy displays in both languages

### Core Safety Tests (Unchanged)
- [ ] Fall detection → 30s countdown → SMS with GPS → emergency call
- [ ] SOS long-press → immediate emergency protocol
- [ ] Obstacle detection works offline → stereo audio cues
- [ ] Camera processing maintains ≥10 FPS @800px

### Device Compatibility
- [ ] iPhone 12+ with iOS 15+: night mode via AVFoundation
- [ ] Pixel 6+ with Android 12+: night mode via CameraX
- [ ] Thermal throttling reduces to 5 FPS gracefully
- [ ] Low-end mode: 400px @5 FPS maintains functionality

## Acceptance Criteria
- All pricing flows functional with proper gating
- Accessibility targets met (52dp/pt, VO/TB, haptics)
- EN/FR parity for all user-facing content
- Night mode properly gated behind Premium tier
- Strap incentive messaging appears in onboarding/paywall
- Core safety flows remain unaffected and offline-capable

## Compliance Notes
- PIPEDA/Alberta PIPA: Usage data stays on-device
- No camera frames transmitted in any tier
- Emergency SMS includes only GPS coordinates + contact info
- Telemetry opt-in required for any anonymous performance data