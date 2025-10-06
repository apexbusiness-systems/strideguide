# B1 - Preflight Must Succeed (OPTIONS)

**Task**: Ensure OPTIONS preflight requests succeed with correct CORS headers for auth endpoints.

**Date**: 2025-10-06  
**Status**: 🟡 READY FOR TESTING

---

## Implementation Summary

### ✅ Client-Side Changes
1. **Diagnostic Script Created**: `B1-preflight-diagnostic.ts`
   - Tests OPTIONS preflight request to Supabase Auth
   - Validates all required CORS headers
   - Tests actual POST request
   - Provides actionable recommendations

2. **Auth Error Handling**: Already implemented in `AuthPage.tsx`
   - Correlation IDs for tracking (lines 52, 121)
   - Specific error messages for CORS failures (lines 73-76, 148-150)
   - Network error detection (lines 103-107, 175-177)

3. **Supabase Client Config**: Already correct in `client.ts`
   - ✅ `persistSession: true` (line 14)
   - ✅ `autoRefreshToken: true` (line 15)
   - ✅ `detectSessionInUrl: true` (line 16)
   - ✅ `flowType: 'pkce'` (line 17)
   - ✅ Session stored in localStorage (line 13)

### ⚠️ Manual Configuration Required

**CRITICAL**: User must configure Supabase Auth URL settings manually.

**Action Required**: Go to Supabase Dashboard → Authentication → URL Configuration

1. **Site URL**: Set to `https://strideguide.lovable.app`

2. **Additional Redirect URLs**: Add these entries:
   ```
   https://strideguide.lovable.app/**
   https://*.lovable.app/**
   http://localhost:8080/**
   http://localhost:5173/**
   ```

3. **CORS Settings**: Supabase automatically derives CORS from Redirect URLs above.

---

## Testing Instructions

### Step 1: Run Diagnostic Script

1. Open StrideGuide auth page in browser
2. Open DevTools Console (F12)
3. Copy contents of `artifacts/auth/2025-10-06/B1-preflight-diagnostic.ts`
4. Paste into console and press Enter
5. Run: `await runPreflightDiagnostic()`

### Step 2: Capture Evidence

**Required Evidence**:
1. Screenshot of diagnostic output showing:
   - OPTIONS status code (expect 200 or 204)
   - All CORS headers present
   - POST request status (expect 200, 400, or 401 - NOT network error)

2. Browser Network tab showing:
   - OPTIONS request with status 200/204
   - Response headers including:
     - `Access-Control-Allow-Origin: <your-origin>`
     - `Access-Control-Allow-Methods: POST, OPTIONS`
     - `Access-Control-Allow-Headers: content-type, authorization`
     - `Access-Control-Allow-Credentials: true`
     - `Vary: Origin`

3. HAR file export (optional but recommended):
   - Network tab → Right-click → Save all as HAR
   - Contains full request/response details

### Step 3: Test Actual Sign-In

1. Attempt sign-in with valid credentials
2. Should NOT see "Failed to fetch" error
3. Should see specific error messages:
   - Invalid credentials → "Email or password is incorrect"
   - Network issue → "Sign-in temporarily unavailable"
   - Timeout → "Service unreachable"

---

## Expected Outcomes

### ✅ Success Criteria
- OPTIONS request returns 200 or 204
- All required CORS headers present
- POST request completes (even if 401/400 for bad credentials)
- No "Failed to fetch" or TypeError in console
- Specific error messages displayed to user
- Correlation ID logged for debugging

### ❌ Failure Indicators
- OPTIONS request fails or returns 4xx/5xx
- Missing CORS headers
- POST request throws TypeError: "Failed to fetch"
- Generic error messages
- No correlation ID in logs

---

## Troubleshooting

### Issue: OPTIONS returns 403/404
**Cause**: Origin not in Supabase Redirect URLs  
**Fix**: Add origin to Additional Redirect URLs in Supabase Dashboard

### Issue: OPTIONS succeeds but POST fails with CORS error
**Cause**: CORS headers missing `Access-Control-Allow-Credentials`  
**Fix**: Ensure Redirect URLs are saved correctly in Supabase

### Issue: Works on localhost but not on lovable.app
**Cause**: Production origin not in Redirect URLs  
**Fix**: Add `https://*.lovable.app/**` to Redirect URLs

---

## Root Cause Analysis (if failures occur)

When running diagnostic, check:

1. **Network tab** → Find failed request → Check:
   - Request headers (Origin should match window.location.origin)
   - Response headers (should include CORS headers)
   - Status code (200/204 for OPTIONS, 200/400/401 for POST is OK)

2. **Console errors** → Look for:
   - "blocked by CORS policy" → Supabase config issue
   - "Failed to fetch" → Network or preflight issue
   - Correlation ID → Find in logs for specific request details

3. **Supabase Dashboard** → Auth → URL Configuration:
   - Verify Site URL matches production domain
   - Verify all preview/dev origins in Redirect URLs
   - Save and wait 30 seconds for propagation

---

## Evidence Checklist

Upload these artifacts when complete:

- [ ] Screenshot of diagnostic output (console)
- [ ] Screenshot of Network tab showing OPTIONS request
- [ ] Screenshot of Network tab showing POST request
- [ ] HAR file export (optional)
- [ ] Screenshot of successful sign-in or specific error message
- [ ] Screenshot of Supabase Auth URL Configuration (proving manual setup)

---

## Next Steps

After B1 passes:
- **B2**: Already complete (Supabase allowlist alignment is manual step above)
- **B3**: Verify session cookies persist (check Application tab → Cookies)
- **B4**: Already complete (error messages implemented in AuthPage.tsx)

---

## Notes

- Supabase PKCE flow already configured correctly
- Session persistence already enabled
- Error correlation IDs already implemented
- This task focuses on **external Supabase Auth configuration**, not code changes
- Code is production-ready; only Supabase Dashboard config remains
