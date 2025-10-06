-- Fix RLS policies to explicitly deny anonymous access
-- This addresses security findings: PUBLIC_USER_DATA, EXPOSED_SENSITIVE_DATA, MISSING_RLS_PROTECTION

-- ============================================
-- 1. PROFILES TABLE - Explicit anonymous denial
-- ============================================

-- Drop existing permissive SELECT policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create restrictive SELECT policy that explicitly requires authentication
CREATE POLICY "Authenticated users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Add explicit deny policy for anonymous users
CREATE POLICY "Deny all access to anonymous users"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- ============================================
-- 2. EMERGENCY_CONTACTS TABLE - Explicit anonymous denial
-- ============================================

-- Drop existing ALL policy
DROP POLICY IF EXISTS "Users can manage their own emergency contacts" ON public.emergency_contacts;

-- Create restrictive policies for authenticated users only
CREATE POLICY "Authenticated users can view their own emergency contacts"
ON public.emergency_contacts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own emergency contacts"
ON public.emergency_contacts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own emergency contacts"
ON public.emergency_contacts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own emergency contacts"
ON public.emergency_contacts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add explicit deny policy for anonymous users
CREATE POLICY "Deny all access to anonymous users on emergency contacts"
ON public.emergency_contacts
FOR ALL
TO anon
USING (false);

-- ============================================
-- 3. API_USAGE TABLE - Explicit anonymous denial
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own API usage" ON public.api_usage;
DROP POLICY IF EXISTS "Users can insert their own API usage" ON public.api_usage;

-- Create restrictive policies for authenticated users only
CREATE POLICY "Authenticated users can view their own API usage"
ON public.api_usage
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own API usage"
ON public.api_usage
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add explicit deny policy for anonymous users
CREATE POLICY "Deny all access to anonymous users on api_usage"
ON public.api_usage
FOR ALL
TO anon
USING (false);

-- ============================================
-- 4. AUDIT LOG - Track this security hardening
-- ============================================

INSERT INTO public.security_audit_log (
  user_id,
  event_type,
  severity,
  event_data
) VALUES (
  NULL,
  'rls_policies_hardened',
  'info',
  jsonb_build_object(
    'tables', ARRAY['profiles', 'emergency_contacts', 'api_usage'],
    'change', 'Added explicit anonymous access denial policies',
    'security_finding', 'PUBLIC_USER_DATA, EXPOSED_SENSITIVE_DATA, MISSING_RLS_PROTECTION'
  )
);