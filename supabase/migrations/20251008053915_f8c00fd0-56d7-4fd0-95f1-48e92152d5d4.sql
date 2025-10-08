-- ============================================================================
-- Phase 3: Admin-Only Writes on Base Tables (feature_flags, subscription_plans)
-- ============================================================================
-- Views (public_features, public_pricing) remain unchanged for public reads
-- Base tables get RLS with admin-only writes via RPCs
-- ============================================================================

-- 1. Enable RLS on base tables
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- 2. Feature Flags: Read policies (authenticated users can read enabled features)
CREATE POLICY "Anyone can view enabled features"
  ON public.feature_flags
  FOR SELECT
  USING (is_enabled = true);

-- 3. Feature Flags: Write policies (admin-only)
CREATE POLICY "Only admins can insert features"
  ON public.feature_flags
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update features"
  ON public.feature_flags
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete features"
  ON public.feature_flags
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 4. Subscription Plans: Read policies (authenticated users can read active plans)
CREATE POLICY "Anyone can view active plans"
  ON public.subscription_plans
  FOR SELECT
  USING (is_active = true);

-- 5. Subscription Plans: Write policies (admin-only)
CREATE POLICY "Only admins can insert plans"
  ON public.subscription_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update plans"
  ON public.subscription_plans
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete plans"
  ON public.subscription_plans
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 6. Admin-only RPC: Create Feature
CREATE OR REPLACE FUNCTION public.admin_create_feature(
  _name text,
  _description text,
  _is_enabled boolean DEFAULT true,
  _required_plan_level integer DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _feature_id uuid;
  _result jsonb;
BEGIN
  -- Verify admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can create features';
  END IF;

  -- Insert feature
  INSERT INTO public.feature_flags (name, description, is_enabled, required_plan_level)
  VALUES (_name, _description, _is_enabled, _required_plan_level)
  RETURNING id INTO _feature_id;

  -- Return created feature
  SELECT jsonb_build_object(
    'id', id,
    'name', name,
    'description', description,
    'is_enabled', is_enabled,
    'required_plan_level', required_plan_level,
    'created_at', created_at
  )
  INTO _result
  FROM public.feature_flags
  WHERE id = _feature_id;

  RETURN _result;
END;
$$;

-- 7. Admin-only RPC: Update Feature
CREATE OR REPLACE FUNCTION public.admin_update_feature(
  _feature_id uuid,
  _name text DEFAULT NULL,
  _description text DEFAULT NULL,
  _is_enabled boolean DEFAULT NULL,
  _required_plan_level integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result jsonb;
BEGIN
  -- Verify admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can update features';
  END IF;

  -- Update feature (only provided fields)
  UPDATE public.feature_flags
  SET
    name = COALESCE(_name, name),
    description = COALESCE(_description, description),
    is_enabled = COALESCE(_is_enabled, is_enabled),
    required_plan_level = COALESCE(_required_plan_level, required_plan_level),
    updated_at = now()
  WHERE id = _feature_id;

  -- Return updated feature
  SELECT jsonb_build_object(
    'id', id,
    'name', name,
    'description', description,
    'is_enabled', is_enabled,
    'required_plan_level', required_plan_level,
    'updated_at', updated_at
  )
  INTO _result
  FROM public.feature_flags
  WHERE id = _feature_id;

  RETURN _result;
END;
$$;

-- 8. Admin-only RPC: Delete Feature
CREATE OR REPLACE FUNCTION public.admin_delete_feature(_feature_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can delete features';
  END IF;

  -- Delete feature
  DELETE FROM public.feature_flags WHERE id = _feature_id;
  
  RETURN true;
END;
$$;

-- 9. Admin-only RPC: Create Subscription Plan
CREATE OR REPLACE FUNCTION public.admin_create_plan(
  _name text,
  _stripe_price_id text,
  _price_monthly numeric,
  _price_yearly numeric DEFAULT NULL,
  _features jsonb DEFAULT '[]'::jsonb,
  _max_api_calls integer DEFAULT NULL,
  _max_users integer DEFAULT NULL,
  _priority_support boolean DEFAULT false,
  _white_label boolean DEFAULT false,
  _stripe_yearly_price_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _plan_id uuid;
  _result jsonb;
BEGIN
  -- Verify admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can create subscription plans';
  END IF;

  -- Insert plan
  INSERT INTO public.subscription_plans (
    name, stripe_price_id, price_monthly, price_yearly, features,
    max_api_calls, max_users, priority_support, white_label, stripe_yearly_price_id
  )
  VALUES (
    _name, _stripe_price_id, _price_monthly, _price_yearly, _features,
    _max_api_calls, _max_users, _priority_support, _white_label, _stripe_yearly_price_id
  )
  RETURNING id INTO _plan_id;

  -- Return created plan
  SELECT jsonb_build_object(
    'id', id,
    'name', name,
    'stripe_price_id', stripe_price_id,
    'price_monthly', price_monthly,
    'price_yearly', price_yearly,
    'features', features,
    'max_api_calls', max_api_calls,
    'max_users', max_users,
    'priority_support', priority_support,
    'white_label', white_label,
    'stripe_yearly_price_id', stripe_yearly_price_id,
    'is_active', is_active,
    'created_at', created_at
  )
  INTO _result
  FROM public.subscription_plans
  WHERE id = _plan_id;

  RETURN _result;
END;
$$;

-- 10. Admin-only RPC: Update Subscription Plan
CREATE OR REPLACE FUNCTION public.admin_update_plan(
  _plan_id uuid,
  _name text DEFAULT NULL,
  _stripe_price_id text DEFAULT NULL,
  _price_monthly numeric DEFAULT NULL,
  _price_yearly numeric DEFAULT NULL,
  _features jsonb DEFAULT NULL,
  _max_api_calls integer DEFAULT NULL,
  _max_users integer DEFAULT NULL,
  _priority_support boolean DEFAULT NULL,
  _white_label boolean DEFAULT NULL,
  _is_active boolean DEFAULT NULL,
  _stripe_yearly_price_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result jsonb;
BEGIN
  -- Verify admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can update subscription plans';
  END IF;

  -- Update plan (only provided fields)
  UPDATE public.subscription_plans
  SET
    name = COALESCE(_name, name),
    stripe_price_id = COALESCE(_stripe_price_id, stripe_price_id),
    price_monthly = COALESCE(_price_monthly, price_monthly),
    price_yearly = COALESCE(_price_yearly, price_yearly),
    features = COALESCE(_features, features),
    max_api_calls = COALESCE(_max_api_calls, max_api_calls),
    max_users = COALESCE(_max_users, max_users),
    priority_support = COALESCE(_priority_support, priority_support),
    white_label = COALESCE(_white_label, white_label),
    is_active = COALESCE(_is_active, is_active),
    stripe_yearly_price_id = COALESCE(_stripe_yearly_price_id, stripe_yearly_price_id),
    updated_at = now()
  WHERE id = _plan_id;

  -- Return updated plan
  SELECT jsonb_build_object(
    'id', id,
    'name', name,
    'stripe_price_id', stripe_price_id,
    'price_monthly', price_monthly,
    'price_yearly', price_yearly,
    'features', features,
    'max_api_calls', max_api_calls,
    'max_users', max_users,
    'priority_support', priority_support,
    'white_label', white_label,
    'is_active', is_active,
    'stripe_yearly_price_id', stripe_yearly_price_id,
    'updated_at', updated_at
  )
  INTO _result
  FROM public.subscription_plans
  WHERE id = _plan_id;

  RETURN _result;
END;
$$;

-- 11. Admin-only RPC: Delete Subscription Plan
CREATE OR REPLACE FUNCTION public.admin_delete_plan(_plan_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can delete subscription plans';
  END IF;

  -- Soft delete: mark as inactive instead of hard delete (safer for referential integrity)
  UPDATE public.subscription_plans
  SET is_active = false, updated_at = now()
  WHERE id = _plan_id;
  
  RETURN true;
END;
$$;

-- 12. Audit log for RLS activation
INSERT INTO public.security_audit_log (
  user_id,
  event_type,
  severity,
  event_data
) VALUES (
  NULL, -- System event
  'rls_enabled_base_tables',
  'info',
  jsonb_build_object(
    'tables', ARRAY['feature_flags', 'subscription_plans'],
    'views', ARRAY['public_features', 'public_pricing'],
    'phase', 'phase_3_admin_writes_rpc',
    'rpcs_created', ARRAY[
      'admin_create_feature', 'admin_update_feature', 'admin_delete_feature',
      'admin_create_plan', 'admin_update_plan', 'admin_delete_plan'
    ]
  )
);