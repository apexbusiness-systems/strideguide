-- Fix RLS policies for usage_analytics table to prevent unauthorized modifications
-- Add UPDATE and DELETE policies to complete the security model

-- Add UPDATE policy (users should NOT be able to update analytics after creation)
CREATE POLICY "Users cannot update analytics data" 
ON public.usage_analytics 
FOR UPDATE 
USING (false);

-- Add DELETE policy (users should NOT be able to delete analytics data)
CREATE POLICY "Users cannot delete analytics data" 
ON public.usage_analytics 
FOR DELETE 
USING (false);

-- Add a comment explaining the security model
COMMENT ON TABLE public.usage_analytics IS 'Analytics data is insert-only and read-only for security. No updates or deletes allowed after creation.';