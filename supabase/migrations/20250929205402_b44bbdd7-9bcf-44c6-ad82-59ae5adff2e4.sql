-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price_monthly decimal(10,2) NOT NULL,
  price_yearly decimal(10,2),
  stripe_price_id text NOT NULL,
  stripe_yearly_price_id text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  max_api_calls integer,
  max_users integer,
  priority_support boolean DEFAULT false,
  white_label boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create organizations table for multi-tenant support
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  subscription_id uuid,
  owner_id uuid NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  organization_id uuid,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamp with time zone NOT NULL,
  current_period_end timestamp with time zone NOT NULL,
  trial_end timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create user roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations(id),
  role text NOT NULL DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Create billing events table
CREATE TABLE public.billing_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  subscription_id uuid REFERENCES public.user_subscriptions(id),
  event_type text NOT NULL,
  stripe_event_id text,
  amount decimal(10,2),
  currency text DEFAULT 'usd',
  status text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Create feature flags table
CREATE TABLE public.feature_flags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  is_enabled boolean DEFAULT false,
  required_plan_level integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create API usage tracking table
CREATE TABLE public.api_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations(id),
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer,
  response_time_ms integer,
  request_size_bytes integer,
  response_size_bytes integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, price_monthly, price_yearly, stripe_price_id, stripe_yearly_price_id, features, max_api_calls, max_users, priority_support, white_label) VALUES
('Basic', 9.99, 99.90, 'price_basic_monthly', 'price_basic_yearly', '["Core Features", "Email Support", "Basic Analytics"]'::jsonb, 1000, 5, false, false),
('Premium', 19.99, 199.90, 'price_premium_monthly', 'price_premium_yearly', '["All Basic Features", "Advanced ML", "Priority Support", "Advanced Analytics", "API Access"]'::jsonb, 10000, 25, true, false),
('Enterprise', 39.99, 399.90, 'price_enterprise_monthly', 'price_enterprise_yearly', '["All Premium Features", "White Label", "Custom Features", "Dedicated Support", "Unlimited API", "SLA"]'::jsonb, -1, -1, true, true);

-- Insert default feature flags
INSERT INTO public.feature_flags (name, description, required_plan_level) VALUES
('advanced_ml', 'Advanced Machine Learning Features', 2),
('white_label', 'White Label Branding', 3),
('priority_support', 'Priority Customer Support', 2),
('api_access', 'API Access', 2),
('custom_features', 'Custom Feature Development', 3),
('unlimited_usage', 'Unlimited Usage Quotas', 3);

-- Enable RLS on all new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Subscription plans are public (everyone can see available plans)
CREATE POLICY "Subscription plans are viewable by everyone" ON public.subscription_plans FOR SELECT USING (is_active = true);

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to" ON public.organizations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.organization_id = organizations.id)
);

CREATE POLICY "Organization owners can update their organizations" ON public.organizations FOR UPDATE USING (owner_id = auth.uid());

-- User subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own subscriptions" ON public.user_subscriptions FOR ALL USING (user_id = auth.uid());

-- User roles policies
CREATE POLICY "Users can view roles in their organizations" ON public.user_roles FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.organization_id = user_roles.organization_id AND ur.role IN ('admin', 'super-admin'))
);

-- Billing events policies
CREATE POLICY "Users can view their own billing events" ON public.billing_events FOR SELECT USING (user_id = auth.uid());

-- Feature flags are public
CREATE POLICY "Feature flags are viewable by everyone" ON public.feature_flags FOR SELECT USING (true);

-- API usage policies
CREATE POLICY "Users can view their own API usage" ON public.api_usage FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own API usage" ON public.api_usage FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_customer ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_roles_user_org ON public.user_roles(user_id, organization_id);
CREATE INDEX idx_billing_events_user_id ON public.billing_events(user_id);
CREATE INDEX idx_api_usage_user_id_created ON public.api_usage(user_id, created_at);

-- Create function to get user's current subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_uuid uuid)
RETURNS TABLE (
  plan_name text,
  plan_features jsonb,
  max_api_calls integer,
  max_users integer,
  priority_support boolean,
  white_label boolean,
  status text,
  current_period_end timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    sp.name,
    sp.features,
    sp.max_api_calls,
    sp.max_users,
    sp.priority_support,
    sp.white_label,
    us.status,
    us.current_period_end
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid
  AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
$$;

-- Create function to check if user has access to feature
CREATE OR REPLACE FUNCTION public.user_has_feature_access(user_uuid uuid, feature_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    JOIN feature_flags ff ON ff.name = feature_name
    WHERE us.user_id = user_uuid
    AND us.status = 'active'
    AND (
      (sp.name = 'Basic' AND ff.required_plan_level <= 1) OR
      (sp.name = 'Premium' AND ff.required_plan_level <= 2) OR
      (sp.name = 'Enterprise' AND ff.required_plan_level <= 3)
    )
  );
$$;

-- Create triggers for updated_at columns
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();