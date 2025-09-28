# StrideGuide - Acceptance Test Scripts

## Test Environment Setup
- **Devices**: iPhone 12+ (iOS 15+), Pixel 6+ (Android 12+)  
- **Network**: Airplane mode enabled, cellular only for emergency tests
- **Accessibility**: VoiceOver/TalkBack enabled for a11y tests
- **Languages**: Test both EN and FR locales

## Pricing Tier Gate Tests

### Test 1: Free Tier Usage Limit
**Objective**: Verify 2-hour daily limit enforcement with proper TTS notification

**Steps**:
1. Install app as new free user
2. Start guidance mode (camera processing active)
3. Fast-forward device time or simulate 2 hours of active use
4. Verify guidance automatically pauses when limit reached
5. Confirm TTS announcement in current language: "Daily usage limit reached. Please upgrade to continue guidance."
6. Verify upgrade CTA appears with Premium plan details
7. Test limit reset at midnight local time

**Expected Result**: 
- ✅ Guidance pauses exactly at 2h mark
- ✅ TTS plays in correct language (EN/FR)
- ✅ Upgrade prompt appears with Premium pricing
- ✅ Counter resets at midnight

### Test 2: Premium Tier Features
**Objective**: Verify 8-hour limit and night mode access for paid users

**Steps**:
1. Simulate Premium subscription active
2. Start guidance and verify 8-hour daily limit
3. Access night mode toggle - should be unlocked
4. Test night mode functionality with low-light simulation
5. Verify "Free strap included" messaging in account section

**Expected Result**:
- ✅ 8-hour limit enforced
- ✅ Night mode accessible and functional
- ✅ Strap incentive messaging visible

### Test 3: Night Mode Gating
**Objective**: Verify night mode properly locked for free users

**Steps**:
1. Install as free user
2. Navigate to night mode toggle
3. Attempt to enable night mode
4. Verify TTS announcement: "Night mode requires Premium subscription"
5. Check VoiceOver/TalkBack announces "Night Mode (Premium only), currently locked"

**Expected Result**:
- ✅ Night mode toggle shows locked state
- ✅ Screen reader announces lock status
- ✅ TTS explains Premium requirement

## Accessibility Tests

### Test 4: Touch Target Verification
**Objective**: Ensure all interactive elements meet 52dp/pt minimum

**Tools**: Accessibility Scanner (Android), Accessibility Inspector (iOS)

**Steps**:
1. Scan all app screens with accessibility tools
2. Measure primary action buttons (Start/Stop Guidance, SOS)
3. Verify settings toggles, tabs, and navigation elements
4. Test with users wearing gloves or with motor impairments

**Expected Result**:
- ✅ All targets ≥52dp/pt
- ✅ No accessibility scanner warnings
- ✅ Easy activation with motor challenges

### Test 5: Screen Reader Support
**Objective**: Complete VoiceOver/TalkBack navigation without sight

**Steps**:
1. Enable VoiceOver (iOS) or TalkBack (Android)
2. Navigate through entire app using gestures only
3. Verify each element announces name, role, state, and hints
4. Test critical flows: start guidance, emergency SOS, settings
5. Confirm logical reading order and focus management

**Expected Result**:
- ✅ All elements properly labeled
- ✅ Focus order logical and efficient  
- ✅ State changes announced (guidance active/inactive)
- ✅ Emergency functions accessible via screen reader

### Test 6: Haptic Feedback Patterns
**Objective**: Verify tactile feedback for key interactions

**Steps**:
1. Enable haptic feedback in system settings
2. Test button tap confirmations (light haptic)
3. Test "Stop!" obstacle alert (strong haptic pattern)
4. Test SOS long-press countdown (rhythmic haptic pattern)
5. Verify patterns distinguishable without audio/visual

**Expected Result**:
- ✅ Different haptic patterns for different actions
- ✅ SOS countdown tactilely recognizable
- ✅ Emergency alert pattern distinct and urgent

## i18n Verification Tests

### Test 7: English/French Language Parity
**Objective**: Verify complete localization for all features

**Steps**:
1. Set device to English (Canada) locale
2. Navigate through all app features, note all text
3. Switch to French (Canada) locale
4. Navigate through same features, verify French translations
5. Test TTS pronunciation in both languages
6. Verify pricing displays correctly in CAD

**Test Items**:
- App name and taglines
- Pricing tier descriptions  
- Usage limit notifications
- Emergency messages and SOS flow
- Settings labels and descriptions
- Strap incentive messaging

**Expected Result**:
- ✅ 100% string translation coverage
- ✅ No English text in French mode
- ✅ TTS voices clear and accurate
- ✅ Cultural adaptations appropriate

### Test 8: TTS Voice Quality
**Objective**: Verify offline TTS clarity for critical guidance

**Steps**:
1. Disconnect from internet, enable airplane mode
2. Test guidance cues in English: "Veer left", "Step up", "Stop - obstacle ahead"
3. Switch to French and test: "Déviez à gauche", "Montez une marche", "Arrêt - obstacle devant"
4. Test emergency announcements in both languages
5. Verify pronunciation clarity with seniors/blind testers

**Expected Result**:
- ✅ All TTS works offline
- ✅ Pronunciation clear and understandable
- ✅ Emergency messages urgent but not alarming

## Safety & Emergency Tests

### Test 9: Fall Detection Sequence
**Objective**: Complete fall detection and emergency protocol

**Steps**:
1. Enable fall detection in settings
2. Simulate fall event (controlled drop test)
3. Verify 30-second countdown with large cancel button
4. Allow countdown to complete without cancellation
5. Confirm SMS sent with GPS coordinates
6. Verify emergency call initiated to primary contact
7. Test cancel functionality within countdown window

**Expected Result**:
- ✅ Fall accurately detected
- ✅ 30-second countdown visible and audible
- ✅ Cancel button large and accessible
- ✅ SMS contains GPS coordinates only
- ✅ Emergency call connects automatically

### Test 10: SOS Long-Press
**Objective**: Manual emergency activation with proper safeguards

**Steps**:
1. Locate SOS button on main interface
2. Perform long-press (3+ seconds) with haptic countdown
3. Verify immediate emergency protocol activation
4. Confirm no accidental activation from brief taps
5. Test accessibility of SOS via VoiceOver/TalkBack

**Expected Result**:
- ✅ 3-second long-press required
- ✅ Haptic countdown during press
- ✅ Immediate emergency protocol
- ✅ No false activations
- ✅ Screen reader accessible

### Test 11: Offline Emergency Function
**Objective**: Emergency features work without internet

**Steps**:
1. Enable airplane mode, cellular only
2. Simulate fall detection or manual SOS
3. Verify SMS transmission via cellular
4. Confirm emergency call connects
5. Test GPS coordinate accuracy in SMS

**Expected Result**:
- ✅ SMS sends via cellular network
- ✅ Emergency call connects without data
- ✅ GPS coordinates accurate within 10 meters
- ✅ No dependency on internet connectivity

## Performance & Privacy Tests

### Test 12: Vision Processing Performance
**Objective**: Meet FPS and latency targets on target devices

**Steps**:
1. Start camera processing on Pixel 6 and iPhone 12
2. Monitor FPS counter in debug mode
3. Test with various lighting conditions
4. Verify obstacle detection accuracy and response time
5. Monitor thermal performance during extended use

**Expected Result**:
- ✅ Maintains ≥10 FPS @800px resolution
- ✅ <120ms latency per frame
- ✅ Accurate hazard detection and classification
- ✅ Graceful degradation under thermal stress

### Test 13: Privacy Verification
**Objective**: Confirm no camera frames leave device

**Tools**: Network monitoring (Wireshark, Charles Proxy)

**Steps**:
1. Set up network traffic monitoring
2. Use app in all modes (day/night, free/premium)
3. Capture and analyze all network requests
4. Verify no image data in transmitted packets
5. Confirm only emergency SMS and telemetry (if opted in)

**Expected Result**:
- ✅ Zero camera frames transmitted
- ✅ Only SMS for emergencies
- ✅ Telemetry minimal and anonymous
- ✅ No unexpected network activity

## Pass Criteria
All tests must pass 100% for release approval. Any failures require fix and retest before production deployment.

**Critical Failures** (Block Release):
- Accessibility targets not met
- Emergency functions non-functional
- Privacy violations detected
- Safety features compromised

**Minor Failures** (Fix in Next Sprint):
- Non-critical UI inconsistencies
- Performance slightly below target
- Minor localization issues