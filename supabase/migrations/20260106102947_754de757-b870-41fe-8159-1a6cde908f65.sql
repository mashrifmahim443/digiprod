-- Create moderator_requests table for managing moderator/admin access requests
CREATE TABLE public.moderator_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  requested_role TEXT NOT NULL DEFAULT 'moderator',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_role CHECK (requested_role IN ('moderator', 'admin')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Enable RLS
ALTER TABLE public.moderator_requests ENABLE ROW LEVEL SECURITY;

-- Admin full access policy
CREATE POLICY "Admin full access to moderator_requests" 
ON public.moderator_requests 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add social_links to public settings that can be viewed
-- Update the existing policy to include social_links
DROP POLICY IF EXISTS "Public can view public settings" ON public.site_settings;

CREATE POLICY "Public can view public settings" 
ON public.site_settings 
FOR SELECT 
USING (key = ANY (ARRAY['hero_content', 'footer_links', 'featured_products', 'site_name', 'site_logo', 'payment_methods', 'offer_popup', 'social_links']::text[]));