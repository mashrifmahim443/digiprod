import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, customerEmail, customerName } = await req.json();

    // Validate required fields
    if (!productId || !customerEmail || !customerName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Stripe API key from environment (placeholder - will be added later)
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeKey) {
      console.log('STRIPE_SECRET_KEY not configured yet - using simulated payment');
      // Simulated payment for now
      const simulatedPaymentId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Process order in database
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: orderResult, error: orderError } = await supabase.rpc('process_order', {
        p_customer_email: customerEmail,
        p_customer_name: customerName,
        p_product_id: productId,
        p_payment_id: simulatedPaymentId,
        p_payment_method: 'simulated',
      });

      if (orderError) {
        console.error('Order processing error:', orderError);
        return new Response(
          JSON.stringify({ success: false, error: orderError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Order processed successfully:', orderResult);
      return new Response(
        JSON.stringify(orderResult),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Real Stripe payment integration will go here when API key is added
    // For now, process with simulated payment
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: orderResult, error: orderError } = await supabase.rpc('process_order', {
      p_customer_email: customerEmail,
      p_customer_name: customerName,
      p_product_id: productId,
      p_payment_id: paymentId,
      p_payment_method: 'stripe',
    });

    if (orderError) {
      console.error('Order processing error:', orderError);
      return new Response(
        JSON.stringify({ success: false, error: orderError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order processed successfully:', orderResult);
    return new Response(
      JSON.stringify(orderResult),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
