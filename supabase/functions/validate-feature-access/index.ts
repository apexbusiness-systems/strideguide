import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: "Authentication required",
        hasAccess: false 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ 
        error: "Invalid authentication",
        hasAccess: false 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { feature } = await req.json();
    
    if (!feature || typeof feature !== 'string') {
      return new Response(JSON.stringify({ 
        error: "Feature name required",
        hasAccess: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check user subscription and feature access
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        plan_id,
        status,
        subscription_plans (
          name,
          features
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      // User has no active subscription - only basic features
      const basicFeatures = [
        'voice_guidance',
        'emergency_contacts',
        'basic_navigation',
        'lost_item_finder_basic'
      ];
      
      return new Response(JSON.stringify({ 
        hasAccess: basicFeatures.includes(feature),
        plan: 'free',
        features: basicFeatures
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if feature is included in user's plan
    const planData = subscription.subscription_plans as any;
    const planFeatures = planData?.features || [];
    const hasAccess = planFeatures.includes(feature);

    // Additional premium feature checks
    const premiumFeatures: Record<string, string[]> = {
      'enhanced_notifications': ['Premium', 'Enterprise'],
      'contextual_menu': ['Premium', 'Enterprise'],
      'advanced_hazard_detection': ['Premium', 'Enterprise'],
      'ai_powered_assistance': ['Premium', 'Enterprise'],
      'priority_support': ['Premium', 'Enterprise'],
      'white_label': ['Enterprise'],
      'advanced_analytics': ['Enterprise'],
      'custom_branding': ['Enterprise']
    };

    const planName = planData?.name;
    const requiresUpgrade = premiumFeatures[feature] && 
                           !premiumFeatures[feature].includes(planName);

    return new Response(JSON.stringify({ 
      hasAccess: hasAccess && !requiresUpgrade,
      plan: planName,
      features: planFeatures,
      requiresUpgrade: requiresUpgrade,
      upgradeRequired: requiresUpgrade ? premiumFeatures[feature][0] : null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Feature validation error:", error);
    return new Response(JSON.stringify({ 
      error: "Feature validation failed",
      hasAccess: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});