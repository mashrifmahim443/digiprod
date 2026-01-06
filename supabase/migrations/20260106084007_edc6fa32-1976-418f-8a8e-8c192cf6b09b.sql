-- =============================================
-- BUNDLEBUY DATABASE SCHEMA
-- =============================================

-- 1. Create ENUM types
CREATE TYPE public.order_status AS ENUM ('pending', 'completed', 'refunded', 'failed');
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'admin', 'moderator');

-- 2. Categories Table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Products Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    images JSONB DEFAULT '[]'::jsonb,
    whats_included JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    total_sales INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Product Keys Table
CREATE TABLE public.product_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    key_or_link TEXT NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,
    order_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Orders Table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    product_id UUID NOT NULL REFERENCES public.products(id),
    key_delivered UUID REFERENCES public.product_keys(id),
    amount_paid DECIMAL(10, 2) NOT NULL,
    processing_fee DECIMAL(10, 2) DEFAULT 0,
    payment_id TEXT,
    payment_method TEXT DEFAULT 'stripe',
    status order_status DEFAULT 'pending',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key from product_keys to orders
ALTER TABLE public.product_keys 
ADD CONSTRAINT fk_product_keys_order 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;

-- 6. Site Settings Table
CREATE TABLE public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Email Logs Table
CREATE TABLE public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Activity Logs Table
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_featured ON public.products(is_featured);
CREATE INDEX idx_product_keys_product ON public.product_keys(product_id);
CREATE INDEX idx_product_keys_unused ON public.product_keys(product_id, is_used) WHERE is_used = false;
CREATE INDEX idx_orders_customer ON public.orders(customer_email);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies for products and categories
CREATE POLICY "Public can view active categories" ON public.categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT USING (is_active = true);

-- Public can read certain site settings
CREATE POLICY "Public can view public settings" ON public.site_settings
    FOR SELECT USING (key IN ('hero_content', 'footer_links', 'featured_products', 'site_name', 'site_logo'));

-- Authenticated users (admin) full access
CREATE POLICY "Admin full access to categories" ON public.categories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to products" ON public.products
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to product_keys" ON public.product_keys
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to orders" ON public.orders
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to site_settings" ON public.site_settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to email_logs" ON public.email_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to activity_logs" ON public.activity_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- PROCESS ORDER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.process_order(
    p_customer_email TEXT,
    p_customer_name TEXT,
    p_product_id UUID,
    p_payment_id TEXT,
    p_payment_method TEXT DEFAULT 'stripe',
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_key_record RECORD;
    v_order_id UUID;
    v_product RECORD;
    v_result JSONB;
BEGIN
    -- Get product details
    SELECT * INTO v_product FROM products WHERE id = p_product_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Product not found or inactive');
    END IF;
    
    -- Get next available key
    SELECT * INTO v_key_record 
    FROM product_keys 
    WHERE product_id = p_product_id AND is_used = false 
    ORDER BY created_at ASC 
    LIMIT 1 
    FOR UPDATE SKIP LOCKED;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'No keys available for this product');
    END IF;
    
    -- Create order
    INSERT INTO orders (
        customer_email, customer_name, product_id, 
        amount_paid, payment_id, payment_method,
        status, ip_address, user_agent
    ) VALUES (
        p_customer_email, p_customer_name, p_product_id,
        v_product.price, p_payment_id, p_payment_method,
        'completed', p_ip_address, p_user_agent
    ) RETURNING id INTO v_order_id;
    
    -- Mark key as used
    UPDATE product_keys 
    SET is_used = true, used_at = now(), order_id = v_order_id 
    WHERE id = v_key_record.id;
    
    -- Link key to order
    UPDATE orders SET key_delivered = v_key_record.id WHERE id = v_order_id;
    
    -- Update product sales count
    UPDATE products SET total_sales = total_sales + 1 WHERE id = p_product_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'key', v_key_record.key_or_link,
        'product_title', v_product.title
    );
END;
$$;

-- =============================================
-- DASHBOARD STATS FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total_products INTEGER;
    v_total_orders INTEGER;
    v_total_revenue DECIMAL;
    v_available_keys INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_products FROM products WHERE is_active = true;
    SELECT COUNT(*) INTO v_total_orders FROM orders WHERE status = 'completed';
    SELECT COALESCE(SUM(amount_paid), 0) INTO v_total_revenue FROM orders WHERE status = 'completed';
    SELECT COUNT(*) INTO v_available_keys FROM product_keys WHERE is_used = false;
    
    RETURN jsonb_build_object(
        'total_products', v_total_products,
        'total_orders', v_total_orders,
        'total_revenue', v_total_revenue,
        'available_keys', v_available_keys
    );
END;
$$;

-- =============================================
-- USEFUL VIEWS
-- =============================================

-- Product stock status view
CREATE VIEW public.v_product_stock_status AS
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

-- Recent orders view
CREATE VIEW public.v_recent_orders AS
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

-- Top products view
CREATE VIEW public.v_top_products AS
SELECT 
    p.id,
    p.title,
    p.price,
    p.total_sales,
    (p.price * p.total_sales) as total_revenue
FROM products p
WHERE p.is_active = true
ORDER BY p.total_sales DESC;

-- =============================================
-- STORAGE BUCKETS
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true);

-- Storage policies
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admin can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admin can update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Admin can delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Public can view site assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

CREATE POLICY "Admin can manage site assets"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id IN ('site-assets'))
WITH CHECK (bucket_id IN ('site-assets'));

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert categories
INSERT INTO public.categories (name, slug, description, icon, display_order) VALUES
('Software Keys', 'software-keys', 'Premium software license keys', '🔑', 1),
('Design Templates', 'design-templates', 'Professional design templates', '🎨', 2),
('Video Courses', 'video-courses', 'Expert-led video tutorials', '🎬', 3),
('E-books', 'ebooks', 'Digital books and guides', '📚', 4);

-- Insert sample products
INSERT INTO public.products (title, slug, description, short_description, price, original_price, category_id, images, whats_included, is_featured) VALUES
(
    'Premium Software Bundle 2024',
    'premium-software-bundle-2024',
    'Get access to the most popular productivity software with lifetime licenses. This bundle includes everything you need to boost your workflow.',
    'Complete productivity software bundle with lifetime access',
    49.99,
    199.99,
    (SELECT id FROM categories WHERE slug = 'software-keys'),
    '["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800"]'::jsonb,
    '["Lifetime license key", "Free updates for 1 year", "Priority support", "Installation guide"]'::jsonb,
    true
),
(
    'Ultimate Design Template Pack',
    'ultimate-design-template-pack',
    'Over 500+ premium design templates for Figma, Sketch, and Adobe XD. Perfect for UI/UX designers.',
    '500+ premium design templates for modern designers',
    79.99,
    299.99,
    (SELECT id FROM categories WHERE slug = 'design-templates'),
    '["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800"]'::jsonb,
    '["500+ templates", "Figma, Sketch, XD formats", "Commercial license", "Regular updates"]'::jsonb,
    true
),
(
    'Web Development Masterclass',
    'web-development-masterclass',
    'Complete web development course covering HTML, CSS, JavaScript, React, and Node.js. From beginner to professional.',
    'Complete web dev course - beginner to pro',
    39.99,
    149.99,
    (SELECT id FROM categories WHERE slug = 'video-courses'),
    '["https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"]'::jsonb,
    '["50+ hours of video", "Project files included", "Certificate of completion", "Lifetime access"]'::jsonb,
    true
);

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
('hero_content', '{"headline": "Premium Digital Bundles at Unbeatable Prices", "subheadline": "Instant delivery. Secure checkout. Lifetime access to premium digital products.", "cta_text": "Browse Bundles"}'::jsonb),
('site_name', '"Bundlebuy"'::jsonb),
('footer_links', '{"company": ["About Us", "Contact Support", "Affiliate Program", "Blog"], "legal": ["Terms of Service", "Privacy Policy", "Refund Policy", "Cookie Policy"]}'::jsonb),
('featured_products', '[]'::jsonb);