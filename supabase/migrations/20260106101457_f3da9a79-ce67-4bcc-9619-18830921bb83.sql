-- Add coupon tracking columns to orders
ALTER TABLE public.orders 
ADD COLUMN coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
ADD COLUMN coupon_code TEXT,
ADD COLUMN discount_amount NUMERIC DEFAULT 0;