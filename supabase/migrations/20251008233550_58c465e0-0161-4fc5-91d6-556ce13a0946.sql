-- Lightweight app_metrics table for p95/error-rate queries
CREATE TABLE IF NOT EXISTS public.app_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event text NOT NULL,
  duration_ms integer,
  ok boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_metrics ENABLE ROW LEVEL SECURITY;

-- Users can insert their own metrics
CREATE POLICY "Users can insert their own metrics"
  ON public.app_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own metrics
CREATE POLICY "Users can view their own metrics"
  ON public.app_metrics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Block anonymous access
CREATE POLICY "Block anonymous app_metrics"
  ON public.app_metrics
  FOR ALL
  TO anon
  USING (false);

-- Prevent updates/deletes (immutable audit log)
CREATE POLICY "Block metric updates"
  ON public.app_metrics
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Block metric deletes"
  ON public.app_metrics
  FOR DELETE
  TO authenticated
  USING (false);

-- Index for fast p95 queries
CREATE INDEX idx_app_metrics_event_created ON public.app_metrics(event, created_at DESC);
CREATE INDEX idx_app_metrics_created ON public.app_metrics(created_at DESC);