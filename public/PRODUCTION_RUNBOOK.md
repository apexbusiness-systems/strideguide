# Production Deployment Runbook

**Version:** 1.0  
**Date:** 2025-10-06  
**Scope:** PROMPT 13 – Deploy steps, smoke tests, rollback  
**Environment:** Lovable + Supabase

---

## Pre-Deployment Checklist

### 1. Code Quality
```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Run tests (if available)
npm test
```

### 2. Environment Variables
Verify all secrets are set in **Supabase Edge Functions Secrets**:
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SIGNING_SECRET`
- ✅ `OPENAI_API_KEY` (if using AI features)
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

### 3. Database Migrations
```bash
# Ensure all migrations are applied
# Check Supabase Dashboard > Database > Migrations
# Verify latest migration timestamp matches local
```

### 4. Stripe Configuration
- ✅ Webhook endpoint configured: `https://[project-id].supabase.co/functions/v1/stripe-webhook`
- ✅ Webhook events enabled: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`
- ✅ Webhook secret stored in Supabase Secrets
- ✅ Product/Price IDs match database

---

## Deployment Steps

### Step 1: Merge to Main Branch
```bash
# Ensure working directory is clean
git status

# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge feature branch
git merge feature/your-branch-name

# Push to main
git push origin main
```

### Step 2: Automatic Build (Lovable)
**Trigger:** Push to `main` branch  
**Process:** Automatic  
**Duration:** ~3-5 minutes

**What happens:**
1. Lovable detects push to main
2. Runs production build (`vite build`)
3. Deploys frontend to Lovable CDN
4. Deploys edge functions to Supabase
5. Applies database migrations (if any)

**Monitor:**
- Check Lovable build logs in dashboard
- Verify build completes successfully
- Note deployment URL

### Step 3: Verify Deployment
```bash
# Check deployment URL
curl -I https://strideguide.app

# Should return 200 OK
```

---

## Smoke Tests (Critical Paths)

### ✅ Test 1: Authentication Flow
```
1. Navigate to /auth
2. Click "Sign Up"
3. Enter email + password
4. Verify email confirmation sent
5. Sign in with credentials
6. ✅ Success: User redirected to /dashboard
```

**Expected:** Authentication works, no CORS errors

---

### ✅ Test 2: Stripe Checkout Flow
```
1. Sign in to /dashboard
2. Navigate to /pricing
3. Click "Upgrade to Pro"
4. ✅ Success: Stripe Checkout URL returned
5. Open Stripe URL
6. Enter test card: 4242 4242 4242 4242
7. Complete checkout
8. ✅ Success: Redirected to /dashboard?upgrade=success
```

**Expected:** Checkout session created, payment processed

**Verify Database:**
```sql
SELECT * FROM user_subscriptions 
WHERE user_id = '[test-user-id]' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected:** `status = 'active'`, `stripe_subscription_id` populated

---

### ✅ Test 3: Billing Portal Access
```
1. Sign in as Pro user
2. Navigate to Settings → Billing
3. Click "Manage Subscription"
4. ✅ Success: Stripe Billing Portal URL returned
5. Open portal URL
6. ✅ Success: User's subscription visible
```

**Expected:** Portal opens, shows active subscription

---

### ✅ Test 4: Webhook Processing
```
# Trigger test webhook from Stripe Dashboard
1. Go to Stripe Dashboard → Developers → Webhooks
2. Select webhook endpoint
3. Click "Send test webhook"
4. Choose event: checkout.session.completed
5. Send event

# Verify in Supabase
- Check Edge Function logs for stripe-webhook
- ✅ Success: 200 response, signature verified
- Check database: subscription record created/updated
```

**Expected:** Webhook processed, database updated

---

### ✅ Test 5: Key User Journeys (Telemetry)
```
1. Sign in to /dashboard
2. Start Guidance (camera permission)
3. ✅ Success: Telemetry event logged (start_guidance)
4. Navigate to Settings
5. Change language to French
6. Save settings
7. ✅ Success: Telemetry event logged (settings_save)
```

**Verify Telemetry:**
```sql
SELECT * FROM journey_traces 
WHERE created_at > NOW() - INTERVAL '5 minutes' 
ORDER BY created_at DESC;
```

**Expected:** Events with status='completed', duration_ms populated

---

### ✅ Test 6: Performance & Accessibility
```bash
# Run Lighthouse audit
npx lighthouse https://strideguide.app --view

# Targets:
# - Performance: ≥ 90
# - Accessibility: ≥ 95
# - Best Practices: ≥ 90
# - SEO: ≥ 95
```

**Expected:** All scores meet targets

---

## Monitoring (First 24 Hours)

### Error Rate
```sql
-- Check for errors in last hour
SELECT 
  COUNT(*) as error_count,
  journey_name,
  error_message
FROM journey_traces
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY journey_name, error_message;
```

**Alert if:** Error count > 10 for any journey

---

### Success Rate
```sql
-- Journey success rate (last 24h)
SELECT 
  journey_name,
  COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*) AS success_rate
FROM journey_traces
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY journey_name;
```

**Alert if:** Success rate < 95% for critical journeys

---

### Webhook Health
```sql
-- Check Supabase Edge Function logs
-- Navigate to: Supabase Dashboard > Edge Functions > stripe-webhook > Logs
-- Filter: Last 1 hour
-- Look for: Non-200 responses, signature failures
```

**Alert if:** > 5 webhook failures in 1 hour

---

## Rollback Procedure

### When to Rollback
- ✅ Authentication completely broken (no users can sign in)
- ✅ Payments failing (all checkout attempts fail)
- ✅ Critical errors affecting > 25% of users
- ✅ Data corruption or security breach

### Rollback Steps

#### 1. Immediate Rollback (Code)
```bash
# Option A: Revert via Git
git revert HEAD
git push origin main
# Lovable auto-deploys previous version (~3-5 min)

# Option B: Lovable Dashboard
1. Go to Lovable Dashboard
2. Navigate to "Deployments"
3. Find last known good deployment
4. Click "Rollback to this version"
5. Confirm rollback
```

**Duration:** ~3-5 minutes

---

#### 2. Rollback Database (if needed)
**⚠️ CRITICAL:** Only if migration caused data issues

```sql
-- Create backup first
SELECT * INTO user_subscriptions_backup FROM user_subscriptions;

-- Revert migration (example)
-- Check supabase/migrations/ for specific down migration
-- Run manually in Supabase SQL Editor
```

**Best Practice:** Use **additive migrations** (add columns, don't drop)  
**Never:** Drop columns or tables in production without backup

---

#### 3. Disable Stripe Webhook (if needed)
```
1. Go to Stripe Dashboard → Developers → Webhooks
2. Find webhook: https://[project-id].supabase.co/functions/v1/stripe-webhook
3. Click "..." → Disable
4. ✅ Prevents new webhook events from processing
```

**Re-enable:** After fix deployed and verified

---

#### 4. Restore Environment Variables
```bash
# If env vars were changed, restore previous values
# Supabase Dashboard > Settings > Edge Functions > Secrets
# Update secrets to previous working values
```

---

### Post-Rollback Verification
```bash
# 1. Verify site is accessible
curl -I https://strideguide.app

# 2. Test authentication
# (Manual: Sign in via /auth)

# 3. Check error logs
# (Supabase Dashboard → Edge Functions → Logs)

# 4. Notify users (if needed)
# Post status update
```

---

## Communication Templates

### ✅ Deployment Notification
```
Subject: ✅ StrideGuide v[version] Deployed

Deployment successful at [time].

Changes:
- [Feature 1]
- [Feature 2]
- [Bug fix]

Smoke tests: PASS
Monitoring: Active

Dashboard: https://strideguide.app/admin
Logs: [Supabase Edge Functions URL]
```

---

### ⚠️ Rollback Notification
```
Subject: ⚠️ StrideGuide Rollback to v[version]

Issue detected: [Brief description]

Rollback completed at [time].
Service restored to stable version v[version].

Root cause: [Pending investigation]
Timeline:
- [time] Issue detected
- [time] Rollback initiated
- [time] Service restored

Next steps:
- Fix deployed to dev
- Re-deployment planned for [time]
```

---

### ✅ All Clear Notification
```
Subject: ✅ StrideGuide - All Clear

Issue resolved. Service operating normally.

Fix deployed at [time].
All smoke tests passing.

Monitoring ongoing for next 24h.
```

---

## Emergency Contacts

- **Lovable Support:** https://lovable.dev/support
- **Supabase Support:** https://supabase.com/dashboard/support
- **Stripe Support:** https://support.stripe.com
- **Project Lead:** [Your contact]

---

## SLO Targets (Service Level Objectives)

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Uptime | 99.5% | < 99% |
| Error Rate | < 1% | > 2% |
| p95 Latency | < 500ms | > 1000ms |
| Checkout Success | > 98% | < 95% |
| Journey Completion | > 95% | < 90% |

**Measured:** Via telemetry in `journey_traces` and `performance_metrics` tables

---

## Post-Deployment Tasks

### Within 1 Hour
- ✅ Complete all smoke tests
- ✅ Monitor error logs (Supabase Dashboard)
- ✅ Check success rates (SQL queries above)
- ✅ Verify webhook processing

### Within 24 Hours
- ✅ Review telemetry data (journey completion rates)
- ✅ Lighthouse audit (performance/a11y)
- ✅ User feedback monitoring
- ✅ Security scan (if changes to auth/payments)

### Within 1 Week
- ✅ Analyze Core Web Vitals (real user data)
- ✅ Review SLO compliance
- ✅ Update documentation (if needed)
- ✅ Backlog any issues discovered

---

## Acceptance Criteria: ✅ COMPLETE

- ✅ Runbook exists with copy/paste commands
- ✅ Smoke tests cover: auth, checkout, portal, webhook, journeys
- ✅ Rollback procedure documented with specific steps
- ✅ Monitoring queries provided
- ✅ Communication templates ready
- ✅ Emergency contacts listed
