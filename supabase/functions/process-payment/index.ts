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
    const { productId, customerEmail, customerName, couponCode, discountAmount } = await req.json();

    // Validate required fields
    if (!productId || !customerEmail || !customerName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Stripe API key from environment (placeholder - will be added later)
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const paymentMethod = stripeKey ? 'stripe' : 'simulated';
    const paymentId = stripeKey 
      ? `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      : `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (!stripeKey) {
      console.log('STRIPE_SECRET_KEY not configured yet - using simulated payment');
    }

    // Process order in database
    const { data: orderResult, error: orderError } = await supabase.rpc('process_order', {
      p_customer_email: customerEmail,
      p_customer_name: customerName,
      p_product_id: productId,
      p_payment_id: paymentId,
      p_payment_method: paymentMethod,
    });

    if (orderError) {
      console.error('Order processing error:', orderError);
      return new Response(
        JSON.stringify({ success: false, error: orderError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = orderResult as { success: boolean; order_id?: string; key?: string; error?: string };

    // If order successful and coupon was used, update order with coupon info
    if (result.success && result.order_id && couponCode) {
      // Get coupon ID
      const { data: couponData } = await supabase
        .from('coupons')
        .select('id')
        .ilike('code', couponCode)
        .maybeSingle();

      // Update order with coupon info
      await supabase
        .from('orders')
        .update({
          coupon_id: couponData?.id || null,
          coupon_code: couponCode,
          discount_amount: discountAmount || 0,
        })
        .eq('id', result.order_id);

      console.log('Coupon info added to order:', couponCode, discountAmount);
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
