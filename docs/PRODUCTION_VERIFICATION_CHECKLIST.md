# Production Verification Checklist

## ✅ Pre-Deployment Verification

### Service Worker & Caching
- [x] SW v3 implemented with deny-by-default allowlist
- [x] index.html NEVER cached (no-store)
- [x] sw.js NEVER cached (no-store)
- [x] Hashed assets cached immutable (31536000s)
- [x] SW disabled in preview/dev environments
- [x] UpdateToast shows on new version
- [x] User can dismiss or accept reload

### Theme & Contrast
- [x] `<meta name="color-scheme" content="dark light">` in head
- [x] Root background set to #0A0A0A (dark)
- [x] No white-on-white text possible on first paint
- [x] UA widgets aligned with app theme

### Routing
- [x] `_redirects` file created with `/* /index.html 200`
- [x] SPA hydration works for deep links
- [x] Test paths: `/app`, `/app/guidance`, `/app/find`, `/app/settings`
- [x] Refresh on any route loads app correctly

### Error Boundary
- [x] ErrorBoundary wraps app root in main.tsx
- [x] Renders accessible fallback on error
- [x] Logs errors to console
- [x] Never renders blank screen
- [x] UpdateToast component included

### Stripe Integration
- [x] Webhook verifies signature with raw body
- [x] Idempotent event processing via billing_events table
- [x] Success URL points to /app
- [x] Cancel URL points to /app
- [x] Portal return URL points to /app
- [x] Subscription status upserted on webhook events

### Auth & Recovery
- [x] Single supabase client from @/lib/supabaseClient
- [x] Reachability check before auth UI (assertSupabaseReachable)
- [x] Exponential backoff wrapper (withAuthBackoff)
- [x] "Reset App Cache" button in Settings → Advanced
- [x] Cache reset unregisters SW + clears caches + reloads

### Privacy & Review
- [x] iOS Privacy Manifest created (PrivacyInfo.xcprivacy)
- [x] Required Reason APIs declared
- [x] No tracking enabled
- [x] Email collection purpose: App Functionality
- [x] Crash data collection: non-linked, non-tracking

## 🧪 Post-Deployment Tests

### Cache Headers (curl tests)
```bash
# Should return Cache-Control: no-store
curl -I https://strideguide.cam/index.html
curl -I https://strideguide.cam/sw.js

# Should return Cache-Control: public, max-age=31536000, immutable
curl -I https://strideguide.cam/assets/index-*.js
```

### Deep Link Navigation
1. Navigate to https://strideguide.cam/app/guidance
2. Refresh page (F5)
3. Verify app loads correctly (no 404)
4. Repeat for /app/find, /app/settings

### Service Worker Update Flow
1. Deploy new version with code change
2. Open app in browser that has old version
3. Verify "New version available" toast appears
4. Click "Reload"
5. Verify new version loads

### Error Boundary
1. Temporarily inject error in component: `throw new Error("test")`
2. Verify error boundary fallback renders
3. Verify console shows error log
4. Verify app doesn't blank out

### Stripe E2E
1. Create checkout session
2. Complete test payment
3. Check Supabase logs for webhook signature verification
4. Verify subscription row created/updated
5. Verify billing_events row created (idempotency)
6. Access billing portal
7. Verify redirect back to /app

### Auth Recovery
1. Fresh browser with no cache
2. Sign up → verify success
3. Sign out → sign in → verify success
4. Close tab → reopen → verify session persists
5. If auth fails: Settings → Advanced → Reset App Cache
6. Retry sign in → verify success

### Mobile Data Auth (Critical)
1. Test sign-up on mobile device with WiFi OFF
2. Use cellular data only
3. Verify auth succeeds (SW bypass working)
4. Check no CORS errors in console

## 📊 Observability Queries

### p95 Latency (24h)
```sql
SELECT percentile_disc(0.95) WITHIN GROUP (ORDER BY duration_ms) AS p95
FROM app_metrics
WHERE event = 'start_guidance' 
  AND created_at > now() - interval '24 hours';
```

### Error Rate (24h)
```sql
SELECT 1.0 * SUM(CASE WHEN ok THEN 0 ELSE 1 END) / COUNT(*) AS error_rate
FROM app_metrics
WHERE created_at > now() - interval '24 hours';
```

### Recent Auth Events
```sql
SELECT event_type, severity, created_at, event_data
FROM security_audit_log
WHERE event_type LIKE '%auth%'
ORDER BY created_at DESC
LIMIT 50;
```

### Webhook Processing
```sql
SELECT stripe_event_id, event_type, status, created_at
FROM billing_events
ORDER BY created_at DESC
LIMIT 20;
```

## 🚨 Rollback Plan

If critical issue discovered post-deploy:

1. **Immediate:**
   - Revert to previous deployment
   - Monitor error logs

2. **If SW implicated:**
   - Comment out `registerSW()` in main.tsx
   - Deploy hotfix
   - Instruct users: Settings → Advanced → Reset App Cache

3. **If database issue:**
   - Review migration in Supabase dashboard
   - Rollback migration if safe
   - Check RLS policies for access issues

4. **Communication:**
   - Update status page
   - Notify affected users
   - Document incident in postmortem

## ✅ Final Sign-Off

All items above verified before marking production-ready:
- [ ] Cache headers correct (curl verification)
- [ ] Deep links work (manual test)
- [ ] SW update flow works (deploy test)
- [ ] Error boundary catches errors (inject test)
- [ ] Stripe E2E complete (test checkout + webhook)
- [ ] Auth recovery works (fresh browser test)
- [ ] Mobile data auth works (cellular test)
- [ ] Observability queries return data
- [ ] Rollback plan documented and tested
