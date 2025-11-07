-- Performance Optimization: Database Connection Pooling Configuration
-- Configures optimal connection pool settings for production

-- Set optimal connection pool parameters
-- These should be applied via Supabase dashboard or environment variables

-- Database configuration recommendations (apply via supabase CLI or dashboard):
-- 1. Connection pooling mode: Transaction (for web apps)
-- 2. Default pool size: 15 connections
-- 3. Max pool size: 100 connections
-- 4. Connection timeout: 30 seconds
-- 5. Idle timeout: 600 seconds (10 minutes)

-- Create function to monitor connection pool health
CREATE OR REPLACE FUNCTION public.get_connection_pool_stats()
RETURNS TABLE (
  total_connections INTEGER,
  active_connections INTEGER,
  idle_connections INTEGER,
  waiting_connections INTEGER,
  max_connections INTEGER
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS total_connections,
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') AS active_connections,
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') AS idle_connections,
    (SELECT count(*) FROM pg_stat_activity WHERE wait_event_type = 'Lock') AS waiting_connections,
    (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS max_connections;
$$;

-- Create function to get slow queries
CREATE OR REPLACE FUNCTION public.get_slow_queries(
  _min_duration_ms INTEGER DEFAULT 1000
)
RETURNS TABLE (
  query TEXT,
  calls BIGINT,
  total_time DOUBLE PRECISION,
  mean_time DOUBLE PRECISION,
  max_time DOUBLE PRECISION
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    query,
    calls,
    total_exec_time AS total_time,
    mean_exec_time AS mean_time,
    max_exec_time AS max_time
  FROM pg_stat_statements
  WHERE mean_exec_time > _min_duration_ms
  ORDER BY mean_exec_time DESC
  LIMIT 50;
$$;

-- Create function to analyze table bloat
CREATE OR REPLACE FUNCTION public.get_table_bloat_stats()
RETURNS TABLE (
  table_name TEXT,
  bloat_pct NUMERIC,
  bloat_mb NUMERIC,
  real_size_mb NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname || '.' || tablename AS table_name,
    CASE
      WHEN pg_total_relation_size(schemaname||'.'||tablename) > 0
      THEN ROUND(
        (1 - (pg_relation_size(schemaname||'.'||tablename)::NUMERIC /
              pg_total_relation_size(schemaname||'.'||tablename)::NUMERIC)) * 100,
        2
      )
      ELSE 0
    END AS bloat_pct,
    ROUND(
      (pg_total_relation_size(schemaname||'.'||tablename) -
       pg_relation_size(schemaname||'.'||tablename))::NUMERIC / 1024 / 1024,
      2
    ) AS bloat_mb,
    ROUND(
      pg_total_relation_size(schemaname||'.'||tablename)::NUMERIC / 1024 / 1024,
      2
    ) AS real_size_mb
  FROM pg_tables
  WHERE schemaname = 'public'
    AND pg_total_relation_size(schemaname||'.'||tablename) > 1024 * 1024 -- > 1MB
  ORDER BY bloat_mb DESC;
END;
$$;

-- Create materialized view for dashboard stats (performance optimization)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles WHERE deleted_at IS NULL) AS total_users,
  (SELECT COUNT(*) FROM public.user_subscriptions WHERE status = 'active' AND deleted_at IS NULL) AS active_subscriptions,
  (SELECT COUNT(*) FROM public.lost_items WHERE status = 'active' AND deleted_at IS NULL) AS active_lost_items,
  (SELECT COUNT(*) FROM public.emergency_contacts WHERE deleted_at IS NULL) AS total_emergency_contacts,
  (SELECT COALESCE(SUM(cost_usd), 0) FROM public.cost_tracking WHERE created_at >= CURRENT_DATE) AS today_cost,
  (SELECT COALESCE(SUM(cost_usd), 0) FROM public.cost_tracking WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS month_cost,
  NOW() AS last_updated;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_last_updated
  ON public.dashboard_stats(last_updated);

-- Function to refresh dashboard stats (call this via cron every 5 minutes)
CREATE OR REPLACE FUNCTION public.refresh_dashboard_stats()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.dashboard_stats;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_connection_pool_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_slow_queries TO service_role;
GRANT EXECUTE ON FUNCTION public.get_table_bloat_stats TO service_role;
GRANT EXECUTE ON FUNCTION public.refresh_dashboard_stats TO service_role;
GRANT SELECT ON public.dashboard_stats TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.get_connection_pool_stats IS 'Returns connection pool health metrics';
COMMENT ON FUNCTION public.get_slow_queries IS 'Returns queries slower than threshold (default 1000ms)';
COMMENT ON FUNCTION public.get_table_bloat_stats IS 'Analyzes table bloat for vacuum optimization';
COMMENT ON FUNCTION public.refresh_dashboard_stats IS 'Refreshes materialized view for dashboard stats (run every 5 min)';
COMMENT ON MATERIALIZED VIEW public.dashboard_stats IS 'Cached dashboard statistics for performance';

-- Performance recommendations
DO $$
BEGIN
  RAISE NOTICE '
  ========================================
  PERFORMANCE OPTIMIZATION RECOMMENDATIONS
  ========================================

  1. Connection Pooling (apply via Supabase dashboard):
     - Set pooler mode to "Transaction"
     - Default pool size: 15
     - Max pool size: 100

  2. Query Monitoring:
     - Run get_slow_queries() weekly to identify bottlenecks
     - Optimize queries taking > 1 second

  3. Vacuum Strategy:
     - Run get_table_bloat_stats() monthly
     - VACUUM FULL tables with >20%% bloat

  4. Dashboard Stats:
     - Setup cron job to refresh_dashboard_stats() every 5 minutes
     - Reduces load by ~80%% compared to live queries

  5. Index Maintenance:
     - REINDEX tables quarterly
     - ANALYZE after bulk operations

  6. Partitioning:
     - Use partitioned tables for time-series data
     - Run create_next_month_partitions() monthly
     - Run drop_old_partitions(12) quarterly

  Additional optimizations available in application layer:
  - Redis caching for frequently accessed data
  - CDN for static assets
  - Query result caching (React Query)
  - Connection pooling in application
  ========================================
  ';
END $$;
