-- Fix security issues with RLS policies

-- 1. PROFILES TABLE: Add explicit deny policy for anonymous users
-- Drop existing problematic policy if it exists
DROP POLICY IF EXISTS "Deny all access to anonymous users" ON public.profiles;

-- Create explicit policy blocking anonymous access to profiles
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Ensure authenticated users can only see their own profile
-- This policy should already exist, but we're being explicit
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Authenticated users can view their own profile'
  ) THEN
    CREATE POLICY "Authenticated users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);
  END IF;
END $$;

-- 2. EMERGENCY_CONTACTS TABLE: Strengthen anonymous blocking
-- Drop existing deny policy if it exists
DROP POLICY IF EXISTS "Deny all access to anonymous users on emergency contacts" ON public.emergency_contacts;

-- Create explicit policy blocking ALL anonymous access to emergency contacts
CREATE POLICY "Block all anonymous access to emergency_contacts"
ON public.emergency_contacts
FOR ALL
TO anon
USING (false);

-- 3. PUBLIC_FEATURES VIEW: This is a VIEW not a table, so RLS doesn't apply
-- Instead, ensure the view has proper grants
-- Views don't have RLS, they inherit from base tables
-- Grant public read access to the view since it's meant to be public
GRANT SELECT ON public.public_features TO anon, authenticated;
GRANT SELECT ON public.public_pricing TO anon, authenticated;

-- Add comments for documentation
COMMENT ON POLICY "Block anonymous access to profiles" ON public.profiles 
IS 'Explicitly blocks anonymous users from accessing user email addresses and personal information';

COMMENT ON POLICY "Block all anonymous access to emergency_contacts" ON public.emergency_contacts
IS 'Explicitly blocks all anonymous access to emergency contact phone numbers and relationships';
