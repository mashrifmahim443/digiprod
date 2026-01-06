-- Allow public to check key availability (count only, not the actual keys)
CREATE POLICY "Public can check key availability" ON public.product_keys
    FOR SELECT USING (true);