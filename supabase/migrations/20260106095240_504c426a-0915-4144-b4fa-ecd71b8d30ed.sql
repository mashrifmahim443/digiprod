-- Update policy to include offer_popup
DROP POLICY IF EXISTS "Public can view public settings" ON site_settings;

CREATE POLICY "Public can view public settings" 
ON site_settings 
FOR SELECT 
USING (key = ANY (ARRAY['hero_content'::text, 'footer_links'::text, 'featured_products'::text, 'site_name'::text, 'site_logo'::text, 'payment_methods'::text, 'offer_popup'::text]));