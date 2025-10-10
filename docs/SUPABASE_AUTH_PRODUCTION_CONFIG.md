# Supabase Authentication Production Configuration

## ⚠️ MANUAL CONFIGURATION REQUIRED

These settings **MUST** be configured in the Supabase Dashboard. This cannot be automated.

---

## Step 1: Authentication URL Configuration

**Dashboard Link**: [Authentication → URL Configuration](https://supabase.com/dashboard/project/yrndifsbsmpvmpudglcc/auth/url-configuration)

### Site URL
```
https://strideguide.cam/app
```

### Additional Redirect URLs
Add each of these URLs (one per line):
```
https://strideguide.cam/app
https://strideguide.cam/app/
https://strideguide.cam
http://localhost:5173/app
http://localhost:8080/app
https://*.lovable.app/app
```

**Save Changes**

---

## Step 2: CORS Configuration

**Dashboard Link**: [Project Settings → API](https://supabase.com/dashboard/project/yrndifsbsmpvmpudglcc/settings/api)

### Allowed Origins (CORS)
Add each origin:
```
https://strideguide.cam
http://localhost:5173
http://localhost:8080
https://*.lovable.app
```

**Save Changes**

---

## Step 3: OAuth Provider Configuration

For **each enabled OAuth provider** (Google, GitHub, etc.):

**Dashboard Link**: [Authentication → Providers](https://supabase.com/dashboard/project/yrndifsbsmpvmpudglcc/auth/providers)

### Callback/Redirect URL
Set to:
```
https://strideguide.cam/app
```

If you have a dedicated callback route (e.g., `/auth/callback`), also configure:
```
https://strideguide.cam/auth/callback
```

**Important**: These exact URLs must also be in "Additional Redirect URLs" from Step 1.

**Save Changes for Each Provider**

---

## Step 4: Verify Magic Link Preview

1. Go to [Email Templates](https://supabase.com/dashboard/project/yrndifsbsmpvmpudglcc/auth/templates)
2. Check the preview for "Magic Link" email
3. Confirm the link shows: `https://strideguide.cam/app`

---

## Step 5: Test Authentication Flows

### Clear Local State
1. Sign out from the app
2. Open DevTools → Application
3. Clear Service Worker registrations
4. Clear Cache Storage for `https://strideguide.cam`
5. Clear Local Storage (auth tokens)

### Test Magic Link
1. Request magic link email
2. Check email - link should point to `https://strideguide.cam/app`
3. Click link - should redirect to app and establish session

### Test OAuth (if enabled)
1. Click "Sign in with [Provider]"
2. Complete OAuth flow
3. Should redirect to `https://strideguide.cam/app` with session

### Success Criteria
- ✅ No "Network error" or CORS errors
- ✅ No "invalid redirect URL" errors
- ✅ Session established after authentication
- ✅ User redirected to `/app` route
- ✅ Auth state persists on page reload

---

## Troubleshooting

### "Invalid redirect URL"
- Verify the exact URL (including `/app`) is in Additional Redirect URLs
- Check for typos (trailing slashes, http vs https)

### CORS Errors
- Verify origin is in Allowed Origins list
- Wait 60 seconds for DNS/config propagation
- Hard refresh browser (Ctrl+Shift+R)

### Magic Link Points to Wrong URL
- Check Site URL is set to `https://strideguide.cam/app`
- Verify email template uses `{{ .ConfirmationURL }}`

---

## Quick Links

- [Auth URL Config](https://supabase.com/dashboard/project/yrndifsbsmpvmpudglcc/auth/url-configuration)
- [CORS Settings](https://supabase.com/dashboard/project/yrndifsbsmpvmpudglcc/settings/api)
- [OAuth Providers](https://supabase.com/dashboard/project/yrndifsbsmpvmpudglcc/auth/providers)
- [Email Templates](https://supabase.com/dashboard/project/yrndifsbsmpvmpudglcc/auth/templates)

---

## Definition of Done

- [ ] Site URL = `https://strideguide.cam/app`
- [ ] All redirect URLs added (production + dev)
- [ ] CORS origins configured
- [ ] OAuth providers configured (if applicable)
- [ ] Magic link preview shows correct URL
- [ ] Local state cleared (SW, cache, storage)
- [ ] Magic link test successful
- [ ] OAuth test successful (if applicable)
- [ ] Session persists on reload
- [ ] No console errors during auth
