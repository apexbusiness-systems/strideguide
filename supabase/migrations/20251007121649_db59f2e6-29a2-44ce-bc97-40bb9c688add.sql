-- Add performance indexes for frequently queried tables

-- Index on emergency_contacts for user lookups
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);

-- Index on billing_events for user lookups
CREATE INDEX IF NOT EXISTS idx_billing_events_user_id ON public.billing_events(user_id);

-- Index on user_subscriptions for user and stripe lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);

-- Index on journey_traces for user lookups
CREATE INDEX IF NOT EXISTS idx_journey_traces_user_id ON public.journey_traces(user_id);

-- Index on api_usage for user and endpoint lookups
CREATE INDEX IF NOT EXISTS idx_api_usage_user_endpoint ON public.api_usage(user_id, endpoint, created_at);

-- Add helpful comments to sensitive columns
COMMENT ON COLUMN public.billing_events.metadata IS 'Webhook metadata - DO NOT store PCI-sensitive data like card numbers';
COMMENT ON COLUMN public.emergency_recordings.location_data IS 'Encrypted emergency location data - highly sensitive';
COMMENT ON COLUMN public.user_subscriptions.stripe_customer_id IS 'Stripe customer ID - internal use only, mask in UI';