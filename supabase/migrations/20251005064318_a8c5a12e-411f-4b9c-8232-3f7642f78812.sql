-- ============================================
-- SECURITY FIX: Audit Log & Rate Limiting
-- ============================================

-- 1. Create security_audit_log table for compliance and monitoring
CREATE TABLE public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  event_data JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON public.security_audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert (for edge functions)
CREATE POLICY "Service role can insert audit logs"
  ON public.security_audit_log
  FOR INSERT
  WITH CHECK (true);

-- Performance indexes
CREATE INDEX idx_security_audit_user_id ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_created_at ON public.security_audit_log(created_at DESC);
CREATE INDEX idx_security_audit_event_type ON public.security_audit_log(event_type);
CREATE INDEX idx_security_audit_severity ON public.security_audit_log(severity);

-- 2. Create rate limit checking function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id UUID,
  _endpoint TEXT,
  _max_requests INTEGER,
  _window_minutes INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_count INTEGER;
  window_start TIMESTAMPTZ;
BEGIN
  window_start := now() - (_window_minutes || ' minutes')::INTERVAL;
  
  SELECT COUNT(*)
  INTO request_count
  FROM api_usage
  WHERE user_id = _user_id
    AND endpoint = _endpoint
    AND created_at >= window_start;
  
  RETURN request_count < _max_requests;
END;
$$;

-- 3. Create get_active_plan_level function (referenced in validate-feature-access)
CREATE OR REPLACE FUNCTION public.get_active_plan_level(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN sp.name = 'Free' THEN 1
    WHEN sp.name = 'Basic' THEN 1
    WHEN sp.name = 'Premium' THEN 2
    WHEN sp.name = 'Pro' THEN 2
    WHEN sp.name = 'Enterprise' THEN 3
    ELSE 0
  END AS plan_level
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = _user_id
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
$$;

-- 4. Create admin role checking function (server-side authorization)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super-admin')
  );
$$;

-- 5. Add RLS policy for admin dashboard queries
CREATE POLICY "Only admins can view all user roles"
  ON public.user_roles
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR public.is_admin(auth.uid())
  );