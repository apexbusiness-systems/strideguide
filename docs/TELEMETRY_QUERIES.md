# Telemetry Queries for app_metrics

These lightweight queries provide fast p95 latency and error-rate insights from the `app_metrics` table.

## Table Schema

```sql
CREATE TABLE public.app_metrics (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  event text NOT NULL,           -- 'start_guidance', 'find_item', 'settings_save'
  duration_ms integer,            -- Journey duration in milliseconds
  ok boolean NOT NULL DEFAULT true, -- true=success, false=error
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

## Quick Queries (Paste in SQL Editor)

### p95 Start Guidance (24h)

```sql
SELECT 
  percentile_disc(0.95) WITHIN GROUP (ORDER BY duration_ms) AS p95_ms
FROM app_metrics
WHERE event = 'start_guidance' 
  AND created_at > now() - INTERVAL '24 hours'
  AND duration_ms IS NOT NULL;
```

### Error Rate (24h)

```sql
SELECT 
  ROUND(
    100.0 * SUM(CASE WHEN ok THEN 0 ELSE 1 END) / COUNT(*),
    2
  ) AS error_rate_pct
FROM app_metrics
WHERE created_at > now() - INTERVAL '24 hours';
```

### Error Rate by Event (24h)

```sql
SELECT 
  event,
  COUNT(*) AS total_events,
  SUM(CASE WHEN ok THEN 0 ELSE 1 END) AS errors,
  ROUND(
    100.0 * SUM(CASE WHEN ok THEN 0 ELSE 1 END) / COUNT(*),
    2
  ) AS error_rate_pct
FROM app_metrics
WHERE created_at > now() - INTERVAL '24 hours'
GROUP BY event
ORDER BY error_rate_pct DESC;
```

### p95 Latency by Event (24h)

```sql
SELECT 
  event,
  COUNT(*) AS samples,
  ROUND(percentile_disc(0.50) WITHIN GROUP (ORDER BY duration_ms)) AS p50_ms,
  ROUND(percentile_disc(0.95) WITHIN GROUP (ORDER BY duration_ms)) AS p95_ms,
  ROUND(percentile_disc(0.99) WITHIN GROUP (ORDER BY duration_ms)) AS p99_ms
FROM app_metrics
WHERE created_at > now() - INTERVAL '24 hours'
  AND duration_ms IS NOT NULL
GROUP BY event
ORDER BY p95_ms DESC;
```

### Hourly Event Volume (24h)

```sql
SELECT 
  date_trunc('hour', created_at) AS hour,
  event,
  COUNT(*) AS events
FROM app_metrics
WHERE created_at > now() - INTERVAL '24 hours'
GROUP BY hour, event
ORDER BY hour DESC, events DESC;
```

### User Activity Summary (7d)

```sql
SELECT 
  user_id,
  COUNT(*) AS total_events,
  SUM(CASE WHEN ok THEN 1 ELSE 0 END) AS successful,
  SUM(CASE WHEN ok THEN 0 ELSE 1 END) AS failed,
  ROUND(AVG(duration_ms)) AS avg_duration_ms
FROM app_metrics
WHERE created_at > now() - INTERVAL '7 days'
  AND duration_ms IS NOT NULL
GROUP BY user_id
ORDER BY total_events DESC
LIMIT 50;
```

## Event Types

Current tracked events:
- `start_guidance` - User begins camera guidance session
- `find_item` - User opens/uses lost item finder
- `settings_save` - User modifies settings

## Notes

- All times in UTC
- `ok=false` indicates journey failed/errored
- `duration_ms` is null for started events, populated on complete/fail
- Metrics auto-emit from `useJourneyTrace` hook
- Data retention: controlled by your Supabase settings (recommend 90d for metrics)
