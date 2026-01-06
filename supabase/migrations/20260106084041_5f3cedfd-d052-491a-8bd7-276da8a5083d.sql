-- Fix Security Definer Views by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.v_product_stock_status;
DROP VIEW IF EXISTS public.v_recent_orders;
DROP VIEW IF EXISTS public.v_top_products;

-- Recreate views with SECURITY INVOKER (default, explicit)
CREATE VIEW public.v_product_stock_status 
WITH (security_invoker = on)
AS
SELECT 
    p.id,
    p.title,
    p.price,
    COUNT(pk.id) FILTER (WHERE pk.is_used = false) as available_keys,
    COUNT(pk.id) FILTER (WHERE pk.is_used = true) as used_keys,
    CASE 
        WHEN COUNT(pk.id) FILTER (WHERE pk.is_used = false) = 0 THEN 'OUT_OF_STOCK'
        WHEN COUNT(pk.id) FILTER (WHERE pk.is_used = false) < 10 THEN 'LOW_STOCK'
        ELSE 'IN_STOCK'
    END as stock_status
FROM products p
LEFT JOIN product_keys pk ON p.id = pk.product_id
GROUP BY p.id, p.title, p.price;

CREATE VIEW public.v_recent_orders 
WITH (security_invoker = on)
AS
SELECT 
    o.id,
    o.customer_email,
    o.customer_name,
    p.title as product_title,
    o.amount_paid,
    o.status,
    o.created_at
FROM orders o
JOIN products p ON o.product_id = p.id
ORDER BY o.created_at DESC;

CREATE VIEW public.v_top_products 
WITH (security_invoker = on)
AS
SELECT 
    p.id,
    p.title,
    p.price,
    p.total_sales,
    (p.price * p.total_sales) as total_revenue
FROM products p
WHERE p.is_active = true
ORDER BY p.total_sales DESC;

-- Fix function search_path for update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;