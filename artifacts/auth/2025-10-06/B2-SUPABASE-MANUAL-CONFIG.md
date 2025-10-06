# B2 - Align Supabase Allowlists (Manual Configuration)

**Task**: Configure Supabase Dashboard Auth URLs for StrideGuide project.

**Date**: 2025-10-06  
**Status**: ⚠️ REQUIRES MANUAL ACTION

---

## Critical: This Cannot Be Automated

Supabase Auth URL configuration **must** be done manually in the Supabase Dashboard. The AI cannot perform this step for you.

---

## Step-by-Step Configuration Guide

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/yrndifsbsmpvmpudglcc/auth/url-configuration
2. Log in to your Supabase account if prompted

### Step 2: Configure Site URL

**Field**: Site URL  
**Current Value**: (may be empty or different)  
**New Value**: `https://strideguide.lovable.app`

**Instructions**:
1. Find the "Site URL" field
2. Clear existing value
3. Enter exactly: `https://strideguide.lovable.app`
4. This is your primary production URL

### Step 3: Configure Redirect URLs

**Field**: Additional Redirect URLs  
**Action**: Add the following URLs (one per line)

**URLs to Add**:
```
https://strideguide.lovable.app/**
https://*.lovable.app/**
http://localhost:8080/**
http://localhost:5173/**
```

**Important Notes**:
- ✅ Include the `/**` wildcard at the end
- ✅ Each URL on a separate line
- ✅ Use `https://*.lovable.app/**` to match ALL Lovable preview URLs
- ✅ Include localhost ports for local development

**Why These URLs**:
- `https://strideguide.lovable.app/**` → Your main preview URL
- `https://*.lovable.app/**` → All Lovable preview environments
- `http://localhost:8080/**` → Local development (alternate port)
- `http://localhost:5173/**` → Vite dev server default

### Step 4: Configure CORS Origins (Automatic)

**Note**: Supabase automatically derives CORS Allowed Origins from your Redirect URLs.

You should see these origins auto-populated:
- `https://strideguide.lovable.app`
- `https://*.lovable.app`
- `http://localhost:8080`
- `http://localhost:5173`

**If CORS section is editable**: Ensure it matches the Redirect URLs above.

### Step 5: Save Configuration

1. Click **"Save"** button at bottom of page
2. Wait for confirmation message: "Successfully saved settings"
3. Wait 30 seconds for configuration to propagate

### Step 6: Verify Configuration

**Screenshot Checklist**:
- [ ] Screenshot of URL Configuration page showing:
  - Site URL: `https://strideguide.lovable.app`
  - All 4 Redirect URLs listed
  - "Successfully saved" confirmation visible

**Save Screenshot As**: `supabase-auth-urls-configured-YYYYMMDD.png`

---

## After Configuration: Re-Test Sign-In

### Step 1: Refresh StrideGuide App

1. Open: https://strideguide.lovable.app/
2. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. Navigate to auth/sign-in page

### Step 2: Attempt Sign-In

1. Enter valid credentials (or create new account first)
2. Click "Sign In"
3. Open DevTools → Network tab BEFORE clicking

### Step 3: Observe Network Requests

**Expected Flow**:
1. **OPTIONS** request to `https://yrndifsbsmpvmpudglcc.supabase.co/auth/v1/token?grant_type=password`
   - Status: **200** or **204**
   - Response headers include:
     - `Access-Control-Allow-Origin: https://strideguide.lovable.app`
     - `Access-Control-Allow-Methods: POST, OPTIONS`
     - `Access-Control-Allow-Headers: content-type, authorization, apikey, x-client-info`
     - `Access-Control-Allow-Credentials: true`
     - `Vary: Origin`

2. **POST** request to same endpoint
   - Status: **200** (success), **400** (bad format), or **401** (invalid credentials)
   - **NOT** a network error or CORS error

### Step 4: Check Console

**Success Indicators**:
```
[AUTH-<uuid>] Sign-in attempt started
[AUTH-<uuid>] Calling Supabase signInWithPassword
[AUTH-<uuid>] Sign-in successful: user@example.com
```

**OR** (if credentials wrong):
```
[AUTH-<uuid>] Sign-in error: 400 Invalid login credentials
```

**Failure Indicator** (if CORS still not working):
```
[AUTH-<uuid>] CORS/Network failure - check Supabase Auth URL configuration
```

---

## Deliverables

### Required Evidence:

1. **Supabase Dashboard Screenshot**
   ```
   File: supabase-auth-urls-configured-2025-10-06.png
   Content:
   - URL Configuration page
   - Site URL visible: https://strideguide.lovable.app
   - All 4 Redirect URLs visible
   - "Successfully saved" message
   ```

2. **Console Screenshot - Successful Redirect**
   ```
   File: auth-successful-redirect-2025-10-06.png
   Content:
   - Console showing successful auth flow
   - Correlation ID visible
   - User email displayed
   - No CORS errors
   ```

3. **Network Tab - OPTIONS Request**
   ```
   File: auth-options-success-2025-10-06.png
   Content:
   - OPTIONS request visible
   - Status: 200 or 204
   - Response headers visible (expand)
   - Access-Control-Allow-Origin matches origin
   ```

4. **Network Tab - POST Request**
   ```
   File: auth-post-success-2025-10-06.png
   Content:
   - POST request visible
   - Status: 200 (or 400/401 if bad credentials)
   - NOT "Failed to fetch" or network error
   ```

5. **Cookie Evidence** (optional)
   ```
   File: auth-cookie-present-2025-10-06.png
   Content:
   - DevTools → Application → Cookies
   - Cookie: sb-yrndifsbsmpvmpudglcc-auth-token
   - HttpOnly, Secure, SameSite=Lax visible
   ```

---

## Troubleshooting

### Issue: Still Getting CORS Error After Configuration

**Possible Causes**:
1. Configuration didn't save properly
2. Configuration not propagated yet (wait 1-2 minutes)
3. Wrong origin in URL (check address bar)
4. Browser cache (hard refresh)

**Fix**:
1. Go back to Supabase Dashboard → URL Configuration
2. Verify all 4 URLs are still there
3. Save again
4. Wait 60 seconds
5. Hard refresh StrideGuide app
6. Clear browser cache if needed

### Issue: OPTIONS Returns 404

**Cause**: Auth endpoint not found (rare)  
**Fix**: Verify Supabase project is active in dashboard

### Issue: OPTIONS Returns 403

**Cause**: Origin not in allowlist  
**Fix**: Double-check Redirect URLs include `https://*.lovable.app/**`

### Issue: POST Succeeds but No Cookie

**Cause**: Browser blocking third-party cookies (shouldn't happen - same-site)  
**Fix**: Check browser cookie settings, ensure cookies enabled

---

## Configuration Template (Copy-Paste Ready)

**For Supabase Dashboard**:

```
Site URL:
https://strideguide.lovable.app

Additional Redirect URLs (one per line):
https://strideguide.lovable.app/**
https://*.lovable.app/**
http://localhost:8080/**
http://localhost:5173/**
```

---

## Acceptance Criteria

### ✅ Configuration Complete When:
- [ ] Site URL set to `https://strideguide.lovable.app`
- [ ] All 4 Redirect URLs added
- [ ] Configuration saved successfully
- [ ] OPTIONS request returns 200/204 with CORS headers
- [ ] POST request completes (no "Failed to fetch")
- [ ] Console shows correlation ID (no CORS error)
- [ ] Cookie set after successful login

### ❌ Configuration Incomplete If:
- [ ] CORS error still appears in console
- [ ] "Failed to fetch" error on sign-in
- [ ] OPTIONS request returns 403/404
- [ ] POST request blocked by browser

---

## Next Steps After B2

Once configuration is confirmed working:

1. **B3**: Verify session cookie flags (already implemented, just needs validation)
2. **B4**: Verify error messages (already implemented)
3. **Run Full Diagnostic**: Execute `await runPreflightDiagnostic()` from B1
4. **Capture Evidence**: All screenshots per checklist above
5. **Submit Evidence**: Upload to artifacts folder

---

## Estimated Time

- Configuration: **5 minutes**
- Testing: **10 minutes**
- Evidence capture: **10 minutes**
- **Total**: 25 minutes

---

## Support

If configuration fails after multiple attempts:

1. Check Supabase status page: https://status.supabase.com/
2. Verify project is on correct plan (free plan should work)
3. Contact Supabase support with project ID: `yrndifsbsmpvmpudglcc`
4. Share screenshots of URL Configuration page

---

**Status**: ⚠️ WAITING FOR MANUAL CONFIGURATION

**Next Action**: User must complete Steps 1-6 in Supabase Dashboard

**After Completion**: Proceed to B3 validation
