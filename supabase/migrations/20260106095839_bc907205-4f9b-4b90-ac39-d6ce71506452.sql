-- Remove the public access policy for product_keys
DROP POLICY IF EXISTS "Public can check key availability" ON public.product_keys;

-- Ensure only admins can access product_keys (policy already exists but let's make sure)
-- The "Admin full access to product_keys" policy already exists, so no additional changes needed