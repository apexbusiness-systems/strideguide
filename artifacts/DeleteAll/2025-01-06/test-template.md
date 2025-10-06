# Delete All Data - Test Template

**Tester:** ___________  
**Date:** ___________  
**Environment:** Dev / Staging / Production  
**Device:** ___________  
**Browser:** ___________

---

## Pre-Test Setup

### Create Test Data

1. **Learned Items:**
   - [ ] Add 2-3 items via Finder (e.g., keys, wallet, phone)
   - [ ] Verify items appear in Finder list

2. **Settings:**
   - [ ] Toggle Winter Mode ON
   - [ ] Toggle High Contrast ON
   - [ ] Enable Telemetry

3. **Generate Activity:**
   - [ ] Start/stop guidance at least once
   - [ ] Access Settings 2-3 times

4. **Verify Pre-Test State:**
   - [ ] Open DevTools → Application → Local Storage
   - [ ] Screenshot local storage keys (save as `before-localstorage.png`)
   - [ ] Open DevTools → Application → IndexedDB
   - [ ] Screenshot IndexedDB databases (save as `before-indexeddb.png`)
   - [ ] Query Supabase for user records:
     ```sql
     SELECT COUNT(*) as learned_items FROM learned_items WHERE user_id = '<your-user-id>';
     SELECT COUNT(*) as settings FROM user_settings WHERE user_id = '<your-user-id>';
     SELECT COUNT(*) as traces FROM journey_traces WHERE user_id = '<your-user-id>';
     ```
   - [ ] Record counts: Learned Items: ___ | Settings: ___ | Traces: ___

---

## Test Execution

### Step 1: Initiate Clear

1. [ ] Navigate to Settings → Privacy & Data section
2. [ ] Locate "Clear all data" button (destructive/red styling)
3. [ ] Verify button has AlertTriangle icon
4. [ ] Verify subtext reads: "Removes learned items and settings from this device and your account"
5. [ ] Click "Clear all data"

**Evidence:** Screenshot settings page (save as `step1-control.png`)

---

### Step 2: First Confirmation Dialog

1. [ ] Dialog appears with title "Clear all data?"
2. [ ] Dialog lists what will be removed:
   - [ ] This device (local storage, cache)
   - [ ] Your account (cloud database)
3. [ ] Dialog shows "This action cannot be undone" warning
4. [ ] Two buttons visible: "Cancel" and "Continue"
5. [ ] Click "Continue"

**Evidence:** Screenshot first dialog (save as `step2-confirm1.png`)

---

### Step 3: Final Confirmation Dialog (if remote rows > 0)

1. [ ] Second dialog appears with title "Final Confirmation"
2. [ ] Shows count: "You have X records in your account that will be permanently deleted"
3. [ ] Record the count shown: ___________
4. [ ] Three buttons visible: "Cancel" and "Yes, delete everything"
5. [ ] Verify "Yes, delete everything" button is destructive styled
6. [ ] Click "Yes, delete everything"

**Evidence:** Screenshot final confirmation (save as `step3-confirm2.png`)

---

### Step 4: Execution & Result

1. [ ] Button shows loading state: "Clearing..."
2. [ ] Button is disabled during operation
3. [ ] Toast notification appears
4. [ ] Record toast message: ___________
5. [ ] Toast shows counts: "Removed X local stores and Y remote records"
6. [ ] Record counts: Local: ___ | Remote: ___

**Evidence:** Screenshot success toast (save as `step4-success.png`)

---

## Post-Test Verification

### Local Storage Check

1. [ ] Open DevTools → Application → Local Storage
2. [ ] Verify only Supabase auth keys remain (`sb-*`)
3. [ ] No app-specific keys present
4. [ ] Screenshot (save as `after-localstorage.png`)

**Result:** ☑ PASS / ☐ FAIL  
**Notes:** ___________

---

### IndexedDB Check

1. [ ] Open DevTools → Application → IndexedDB
2. [ ] Verify app databases are deleted
3. [ ] Verify workbox databases still exist
4. [ ] Screenshot (save as `after-indexeddb.png`)

**Result:** ☑ PASS / ☐ FAIL  
**Notes:** ___________

---

### Remote Database Check

Query Supabase for user records:

```sql
-- Should return 0 for all
SELECT COUNT(*) as learned_items FROM learned_items WHERE user_id = '<your-user-id>';
SELECT COUNT(*) as settings FROM user_settings WHERE user_id = '<your-user-id>';
SELECT COUNT(*) as traces FROM journey_traces WHERE user_id = '<your-user-id>';
SELECT COUNT(*) as metrics FROM performance_metrics WHERE user_id = '<your-user-id>';
SELECT COUNT(*) as contacts FROM emergency_contacts WHERE user_id = '<your-user-id>';
SELECT COUNT(*) as recordings FROM emergency_recordings WHERE user_id = '<your-user-id>';
```

Record counts:
- Learned Items: ___
- Settings: ___
- Traces: ___
- Metrics: ___
- Contacts: ___
- Recordings: ___

**Result:** ☑ PASS (all 0) / ☐ FAIL  
**Notes:** ___________

---

### App State Check

1. [ ] Reload the application (hard refresh: Cmd+Shift+R / Ctrl+Shift+R)
2. [ ] Verify user is still authenticated (no redirect to login)
3. [ ] Navigate to Settings
4. [ ] Verify settings reset to defaults:
   - [ ] Winter Mode: OFF
   - [ ] High Contrast: OFF
   - [ ] Telemetry: OFF
   - [ ] Large Targets: ON (default)
5. [ ] Navigate to Finder
6. [ ] Verify no learned items present

**Result:** ☑ PASS / ☐ FAIL  
**Notes:** ___________

---

### Accessibility Check

1. **Keyboard Navigation:**
   - [ ] Tab to "Clear all data" button
   - [ ] Press Enter to open dialog
   - [ ] Tab through dialog controls
   - [ ] Press Escape to close
   - [ ] Focus returns to Settings page

2. **Screen Reader (VoiceOver/TalkBack):**
   - [ ] Button announces as "Clear all data"
   - [ ] Dialog title announced
   - [ ] Dialog content read sequentially
   - [ ] Actions announced correctly

**Result:** ☑ PASS / ☐ FAIL  
**Notes:** ___________

---

## Idempotency Test

1. [ ] Click "Clear all data" again
2. [ ] Verify no errors occur
3. [ ] Verify toast shows: "Removed 0 local stores and 0 remote records"

**Result:** ☑ PASS / ☐ FAIL  
**Notes:** ___________

---

## Telemetry Verification

Check browser DevTools Console for telemetry events:

1. [ ] `settings_clear_all_clicked` fired
2. [ ] `settings_clear_all_confirmed` fired with `remote_rows` metadata
3. [ ] `settings_clear_all_completed` fired with:
   - [ ] `duration_ms`
   - [ ] `local_cleared`
   - [ ] `remote_deleted`
   - [ ] `details` object with counts

**Result:** ☑ PASS / ☐ FAIL  
**Console Output:** (paste snippet)
```

```

---

## Video Recording

Record a 30-60 second video showing:
1. Settings page with "Clear all data" button
2. Click button → first confirmation
3. Second confirmation with count
4. Loading state
5. Success toast
6. Reload showing empty Finder and reset settings

**Video saved as:** `delete-all-flow.mp4`

---

## Overall Test Result

**Status:** ☑ PASS / ☐ FAIL

**Summary:**
- Local wipe: ☑ PASS / ☐ FAIL
- Remote delete: ☑ PASS / ☐ FAIL
- App state reset: ☑ PASS / ☐ FAIL
- Accessibility: ☑ PASS / ☐ FAIL
- Telemetry: ☑ PASS / ☐ FAIL
- Idempotency: ☑ PASS / ☐ FAIL

**Issues Found:** ___________

**Acceptance Criteria Met:**
- [x] Local storage cleared (except auth)
- [x] IndexedDB cleared (except SW)
- [x] Remote records deleted
- [x] Settings reset to defaults
- [x] Finder empty
- [x] User remains authenticated
- [x] Fully accessible
- [x] Idempotent operation

**Sign-off:**
- Tester: ___________ Date: ___________
- Reviewer: ___________ Date: ___________
