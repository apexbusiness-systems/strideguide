import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    
    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    // In a real implementation, you would verify the webhook signature here
    console.log("Webhook received:", body);
    
    const event = JSON.parse(body);
    
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(supabase, event);
        break;
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
        await handlePaymentEvent(supabase, event);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleSubscriptionEvent(supabase: any, event: any) {
  const subscription = event.data.object;
  
  const { error } = await supabase
    .from("user_subscriptions")
    .upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    }, {
      onConflict: "stripe_subscription_id"
    });
    
  if (error) {
    console.error("Error updating subscription:", error);
  }
}

async function handlePaymentEvent(supabase: any, event: any) {
  const invoice = event.data.object;
  
  const { error } = await supabase
    .from("billing_events")
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency,
      status: event.type === "invoice.payment_succeeded" ? "succeeded" : "failed",
      metadata: { invoice_id: invoice.id }
    });
    
  if (error) {
    console.error("Error recording billing event:", error);
  }
}