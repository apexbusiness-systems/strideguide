-- Phase 4: Admin Assignment Lock-In
-- Secure the assign_admin_role function to only allow admins to grant roles
-- Exception: Allow first admin to self-assign if no admins exist

CREATE OR REPLACE FUNCTION public.assign_admin_role(
  target_user_id uuid,
  target_role text DEFAULT 'admin'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_count integer;
  caller_is_admin boolean;
BEGIN
  -- Count existing admins
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role IN ('admin', 'super-admin');
  
  -- Check if caller is admin
  SELECT public.is_admin(auth.uid()) INTO caller_is_admin;
  
  -- First admin case: Allow self-assignment only if no admins exist and caller is target
  IF admin_count = 0 THEN
    IF auth.uid() != target_user_id THEN
      RAISE EXCEPTION 'First admin must self-assign';
    END IF;
  -- Subsequent assignments: Only admins can grant roles
  ELSIF NOT caller_is_admin THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;
  
  -- Insert admin role for user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, target_role::text)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log the role assignment with caller info
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    severity,
    event_data
  ) VALUES (
    auth.uid(),
    'admin_role_granted',
    'info',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'role', target_role,
      'is_first_admin', admin_count = 0
    )
  );
  
  RETURN true;
END;
$$;

-- Create helper function to check if any admins exist
CREATE OR REPLACE FUNCTION public.admins_exist()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE role IN ('admin', 'super-admin')
  );
$$;

-- Log Phase 4 activation
INSERT INTO public.security_audit_log (
  event_type,
  severity,
  event_data
) VALUES (
  'phase_4_admin_lockdown_enabled',
  'info',
  jsonb_build_object(
    'description', 'Admin assignment now requires existing admin except for first admin',
    'phase', 4
  )
);