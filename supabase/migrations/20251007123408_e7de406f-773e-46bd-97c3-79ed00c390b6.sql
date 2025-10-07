-- CRITICAL PRODUCTION SECURITY FIX
-- Block ALL anonymous SELECT operations on sensitive tables

-- 1. Profiles - Block ALL anonymous access
CREATE POLICY "anon_cannot_select_profiles" 
ON public.profiles FOR SELECT TO anon 
USING (false);

-- 2. Emergency contacts - Explicit anonymous SELECT block
DROP POLICY IF EXISTS "Block all anonymous access to emergency_contacts" ON public.emergency_contacts;
CREATE POLICY "anon_cannot_select_emergency_contacts" 
ON public.emergency_contacts FOR SELECT TO anon 
USING (false);

-- 3. Emergency recordings - Explicit anonymous SELECT block
CREATE POLICY "anon_cannot_select_emergency_recordings" 
ON public.emergency_recordings FOR SELECT TO anon 
USING (false);

-- 4. User subscriptions - Explicit anonymous SELECT block
CREATE POLICY "anon_cannot_select_user_subscriptions" 
ON public.user_subscriptions FOR SELECT TO anon 
USING (false);

-- 5. Billing events - Already has anonymous block, add explicit SELECT block
CREATE POLICY "anon_cannot_select_billing_events" 
ON public.billing_events FOR SELECT TO anon 
USING (false);

-- 6. Security audit log - Explicit anonymous SELECT block
CREATE POLICY "anon_cannot_select_security_audit_log" 
ON public.security_audit_log FOR SELECT TO anon 
USING (false);

-- 7. Learned items - Explicit anonymous SELECT block
CREATE POLICY "anon_cannot_select_learned_items" 
ON public.learned_items FOR SELECT TO anon 
USING (false);

-- 8. User settings - Explicit anonymous SELECT block
CREATE POLICY "anon_cannot_select_user_settings" 
ON public.user_settings FOR SELECT TO anon 
USING (false);

-- 9. Usage analytics - Explicit anonymous SELECT block
CREATE POLICY "anon_cannot_select_usage_analytics" 
ON public.usage_analytics FOR SELECT TO anon 
USING (false);

-- 10. Organizations - Explicit anonymous SELECT block
CREATE POLICY "anon_cannot_select_organizations" 
ON public.organizations FOR SELECT TO anon 
USING (false);

-- 11. User roles - Explicit anonymous SELECT block  
CREATE POLICY "anon_cannot_select_user_roles" 
ON public.user_roles FOR SELECT TO anon 
USING (false);

-- 12. API usage - Already has anonymous block via "Deny all access to anonymous users"

-- Verify policies are active
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
  AND policyname LIKE '%anon%'
GROUP BY tablename
ORDER BY tablename;