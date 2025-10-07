# CRITICAL: Production Auth Network Error Fix

## Issue
Users seeing "Network error" when trying to sign in/sign up on mobile data or WiFi.

## Root Cause
Supabase authentication redirect URLs not configured in Supabase Dashboard, causing CORS preflight failures.

## Fix (REQUIRED - 2 minutes)

### Step 1: Configure Supabase URLs
1. Open [Supabase Auth URL Configuration](https://supabase.com/dashboard/project/yrndifsbsmpvmpudglcc/auth/url-configuration)

2. Set **Site URL** to:
   ```
   https://gptengineer-strideguide-enterprise.lovable.app
   ```
   (Or your custom domain if deployed)

3. Add these **Redirect URLs** (one per line):
   ```
   https://*.lovable.app/**
   https://gptengineer-strideguide-enterprise.lovable.app/**
   ```
   
   If you have a custom domain, add it too:
   ```
   https://yourdomain.com/**
   ```

4. Click **Save**

5. Wait 30 seconds for Supabase to propagate changes

### Step 2: Test
1. Open your app in **Incognito/Private mode** (clears cache)
2. Try signing up with a new email
3. Try signing in

### Step 3: If Still Failing
1. Check browser console for errors (F12 > Console)
2. Look for CORS or 400/403 errors
3. Verify the URLs you added match your current domain EXACTLY

## Why This Happens
Supabase blocks authentication requests from domains not in the allowlist for security. The "Network error" is actually a CORS preflight rejection.

## Prevention
- Add wildcard redirect URLs for all environments
- Use `https://*.lovable.app/**` for all Lovable previews
- Add custom domain wildcards for production

## Verification
After fixing, you should see in browser console:
```
[Auth] Sign-in attempt started
[Auth] Sign-in successful
```

Not:
```
[Auth] Network/CORS error
```
