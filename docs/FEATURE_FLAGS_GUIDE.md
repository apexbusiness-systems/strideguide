# Feature Flags Guide

## Overview

The application uses runtime feature flags to enable dark launches, canary deployments, and instant rollback capability. Flags are loaded from `/public/config/runtime.json` at app boot.

## Architecture

### Single Artifact Deployment
- **Build once**, deploy anywhere
- Only `runtime.json` changes between environments
- No rebuilds required for feature toggles
- Supports blue-green deployments

### Available Flags

```json
{
  "enablePayments": false,     // Stripe checkout & billing
  "enableNewAuth": false,       // New authentication flows
  "enableWebhooks": false       // Stripe webhook processing
}
```

## Usage

### Frontend (React)

```typescript
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

function MyComponent() {
  const { isPaymentsEnabled, loading } = useFeatureFlags();

  if (loading) return <Skeleton />;

  return (
    <div>
      {isPaymentsEnabled ? (
        <StripeCheckout />
      ) : (
        <LegacyPaymentFlow />
      )}
    </div>
  );
}
```

### Component Gating

```typescript
import { FeatureGate } from '@/hooks/useFeatureFlags';

function App() {
  return (
    <FeatureGate 
      flag="enablePayments" 
      fallback={<ComingSoonBanner />}
    >
      <PricingPage />
    </FeatureGate>
  );
}
```

### Edge Functions (Deno)

```typescript
import { loadRuntimeConfig } from './config.ts';

const config = await loadRuntimeConfig(appOrigin);

if (!config.enableWebhooks) {
  return new Response(JSON.stringify({ received: true, status: "disabled" }), {
    headers: corsHeaders,
    status: 200,
  });
}
```

## Observability

### Telemetry Integration

```typescript
import { telemetry } from '@/utils/Telemetry';

// Simple event tracking
telemetry.track('checkout_open', { planId: 'pro', isYearly: true });

// With latency measurement
await telemetry.trackWithLatency('checkout_open', async () => {
  await createCheckoutSession();
}, { planId: 'pro' });
```

### Metrics Available

- **Error count** per event (24h window)
- **P95 latency** per event
- **Correlation IDs** for request tracing
- **Flag snapshots** for each event

```typescript
const p95 = telemetry.getP95Latency('checkout_open');
const errorCount = telemetry.getErrorCount('payment_failed');
```

## Deployment Strategy

### Canary Rollout

1. **Deploy with all flags off** (baseline unchanged)
2. **Enable for internal origin first**
   ```json
   // Canary environment
   { "enablePayments": true }
   ```
3. **Monitor for 24h**
   - Check error count stays at 0
   - Verify p95 latency within budget
   - Confirm no user complaints
4. **Broaden to all users** if clean

### Instant Rollback

Update `runtime.json` to disable flags:

```json
{
  "enablePayments": false,
  "enableNewAuth": false,
  "enableWebhooks": false
}
```

**No rebuild required** - users get defaults on next page load.

For immediate effect with active webhooks, also disable in Stripe dashboard temporarily.

## Validation Checklist

- [ ] Flags default to `false`
- [ ] App unchanged from baseline when all flags off
- [ ] Each flag works in isolation
- [ ] Auth flows succeed (no CORS errors)
- [ ] Payments E2E green in canary
- [ ] Webhook idempotency verified
- [ ] Telemetry shows traces and p95
- [ ] Performance budgets met
- [ ] WCAG 2.2 AA compliance on critical screens
- [ ] Rollback tested (flags → false, app returns to baseline)

## Best Practices

### DO
✅ Keep flags coarse-grained (per feature, not per UI element)  
✅ Default to `false` for safety  
✅ Use telemetry to track flag state in events  
✅ Test rollback path before launch  
✅ Clean up flags after full rollout (code removal)

### DON'T
❌ Mix build-time and runtime config  
❌ Use flags for A/B testing (use dedicated tool)  
❌ Keep flags forever (tech debt)  
❌ Forget to update edge function config loaders  
❌ Skip canary phase for high-risk changes

## Emergency Procedures

### If Payment Processing Fails

1. Set `enablePayments: false` in `runtime.json`
2. Disable Stripe webhook endpoint in dashboard
3. Notify users via status page
4. Investigate logs with correlation IDs
5. Fix issue offline
6. Re-enable via canary rollout

### If Webhooks Cause Data Corruption

1. Set `enableWebhooks: false` immediately
2. Queue incoming events in Stripe (they retry)
3. Audit database for inconsistencies
4. Deploy fix
5. Re-enable webhooks
6. Process queued events

## Monitoring Queries

```sql
-- Recent telemetry events
SELECT event, timestamp, latency, error, flagSnapshot
FROM telemetry_events
WHERE timestamp > NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;

-- Error rate by event
SELECT event, COUNT(*) as error_count
FROM telemetry_events
WHERE error IS NOT NULL
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY event;
```

## Configuration Files

- **Frontend config**: `public/config/runtime.json`
- **Config loader**: `src/config/runtime.ts`
- **React hook**: `src/hooks/useFeatureFlags.ts`
- **Telemetry**: `src/utils/Telemetry.ts`
- **Edge function config**: `supabase/functions/stripe-webhook/config.ts`
