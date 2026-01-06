-- Create coupons table
CREATE TABLE public.coupons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC DEFAULT 0,
    max_uses INTEGER DEFAULT NULL,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access to coupons"
ON public.coupons
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Public can validate coupons (but not see all)
CREATE OR REPLACE FUNCTION public.validate_coupon(p_code TEXT, p_order_amount NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_coupon RECORD;
    v_discount NUMERIC;
BEGIN
    -- Find coupon
    SELECT * INTO v_coupon 
    FROM coupons 
    WHERE UPPER(code) = UPPER(p_code) 
    AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Invalid coupon code');
    END IF;
    
    -- Check expiry
    IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Coupon has expired');
    END IF;
    
    -- Check usage limit
    IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Coupon usage limit reached');
    END IF;
    
    -- Check minimum order amount
    IF p_order_amount < v_coupon.min_order_amount THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Minimum order amount not met');
    END IF;
    
    -- Calculate discount
    IF v_coupon.discount_type = 'percentage' THEN
        v_discount := ROUND(p_order_amount * v_coupon.discount_value / 100, 2);
    ELSE
        v_discount := LEAST(v_coupon.discount_value, p_order_amount);
    END IF;
    
    RETURN jsonb_build_object(
        'valid', true,
        'coupon_id', v_coupon.id,
        'code', v_coupon.code,
        'discount_type', v_coupon.discount_type,
        'discount_value', v_coupon.discount_value,
        'discount_amount', v_discount,
        'final_amount', p_order_amount - v_discount
    );
END;
$$;

-- Function to use coupon (increment count)
CREATE OR REPLACE FUNCTION public.use_coupon(p_coupon_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE coupons SET used_count = used_count + 1 WHERE id = p_coupon_id;
END;
$$;