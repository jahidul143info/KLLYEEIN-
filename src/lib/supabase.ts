import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

/**
 * Dynamically resolves Supabase URL and Anon Key from environment variables or browser storage
 */
export function getSupabaseConfig(): SupabaseConfig {
  let url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    '';

  let anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  // Fallback to client localStorage if user configured via UI
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('kllyeein_supabase_url');
    const savedKey = localStorage.getItem('kllyeein_supabase_anon_key');
    if (savedUrl && !url) url = savedUrl;
    if (savedKey && !anonKey) anonKey = savedKey;
  }

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('your-supabase-project') &&
    !url.includes('placeholder') &&
    url.startsWith('http')
  );

  return { url, anonKey, isConfigured };
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.isConfigured) return null;

  if (!cachedClient || lastUsedUrl !== config.url || lastUsedKey !== config.anonKey) {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'kllyeein_sb_auth_token',
      },
    });
    lastUsedUrl = config.url;
    lastUsedKey = config.anonKey;
  }

  return cachedClient;
}

export function saveSupabaseConfig(url: string, anonKey: string): boolean {
  if (typeof window === 'undefined') return false;
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (!cleanUrl || !cleanKey) {
    localStorage.removeItem('kllyeein_supabase_url');
    localStorage.removeItem('kllyeein_supabase_anon_key');
    cachedClient = null;
    return false;
  }

  localStorage.setItem('kllyeein_supabase_url', cleanUrl);
  localStorage.setItem('kllyeein_supabase_anon_key', cleanKey);
  cachedClient = null;
  return true;
}

export async function ensureSupabaseConfig(): Promise<SupabaseConfig> {
  const current = getSupabaseConfig();
  if (current.isConfigured) return current;

  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.supabaseUrl && data.supabaseAnonKey) {
          saveSupabaseConfig(data.supabaseUrl, data.supabaseAnonKey);
          return getSupabaseConfig();
        }
      }
    } catch {
      // silent fallback
    }
  }

  return current;
}

export const isSupabaseConfigured = getSupabaseConfig().isConfigured;
export const supabase = getSupabaseClient();

/**
 * SQL Setup string provided for users to copy and run in their Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- KLLYEEIN GADGETS BANGLADESH - COMPLETE PRODUCTION DATABASE SCHEMA & SEED DATA
-- Version: 2.5 (Latest with Dynamic Payment Gateways, Orders & Authentication)
-- Compatible with: Supabase / PostgreSQL 14+
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. USERS & PROFILES TABLE (Integrated with Supabase Auth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT DEFAULT 'Dhaka',
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 2. PRODUCTS TABLE (Cybernetic Tech, Smartphones & Luxury Audio)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT ('prod_' || gen_random_uuid()::text),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  price NUMERIC(12,2) NOT NULL,
  original_price NUMERIC(12,2),
  images TEXT[] DEFAULT '{}',
  specs JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_new_release BOOLEAN DEFAULT true,
  stock INT DEFAULT 20,
  rating NUMERIC(3,2) DEFAULT 5.0,
  review_count INT DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT ('cat_' || gen_random_uuid()::text),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  icon TEXT,
  item_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 4. HERO PROMO BANNERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.banners (
  id TEXT PRIMARY KEY DEFAULT ('banner_' || gen_random_uuid()::text),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  badge TEXT,
  cta_text TEXT DEFAULT 'Shop Now',
  cta_link TEXT DEFAULT '/#products',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 5. ORDERS & CHECKOUT TABLE (Full Customer Details & TrxID Sync)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT ('ord_' || gen_random_uuid()::text),
  order_number TEXT UNIQUE NOT NULL,
  user_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  items JSONB NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  shipping_fee NUMERIC(12,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  payment_method TEXT NOT NULL,
  trx_id TEXT,
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 6. STORE SETTINGS & PAYMENT GATEWAYS CONFIGURATION TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default_settings',
  store_name TEXT DEFAULT 'KLLYEEIN GADGETS BANGLADESH',
  tagline TEXT DEFAULT 'Cybernetic Tech, Flagship Phones & Acoustic Luxury',
  hotline TEXT DEFAULT '+880 1700-112233',
  whatsapp TEXT DEFAULT '+880 1700-112233',
  support_email TEXT DEFAULT 'support@kllyeein.com',
  showroom_address TEXT DEFAULT 'Jamuna Future Park, Level 4 (Zone D, Shop 402), Dhaka',
  business_hours TEXT DEFAULT '10:00 AM – 09:00 PM (Weekly Off: Wednesday)',
  inside_dhaka_fee NUMERIC(8,2) DEFAULT 60.00,
  outside_dhaka_fee NUMERIC(8,2) DEFAULT 120.00,
  free_shipping_threshold NUMERIC(10,2) DEFAULT 5000.00,
  announcement_text TEXT DEFAULT '🚀 FREE EXPRESS SHIPPING across Bangladesh on orders over ৳5,000 | 100% Genuine Warranty',
  is_announcement_active BOOLEAN DEFAULT true,

  -- bKash Configuration
  bkash_number TEXT DEFAULT '01700-112233',
  bkash_type TEXT DEFAULT 'Personal (Send Money)',
  bkash_instructions TEXT DEFAULT '1. Open bKash App or dial *247#\n2. Select "Send Money"\n3. Enter the bKash Number given above\n4. Enter payable total amount\n5. Enter Reference: KLLY\n6. Copy and paste TrxID below.',
  bkash_qr_url TEXT,

  -- Nagad Configuration
  nagad_number TEXT DEFAULT '01700-112233',
  nagad_type TEXT DEFAULT 'Personal (Send Money)',
  nagad_instructions TEXT DEFAULT '1. Open Nagad App or dial *167#\n2. Choose "Send Money"\n3. Send total amount to the number above\n4. Paste the Transaction ID (TrxID) below.',
  nagad_qr_url TEXT,

  -- Rocket / DBBL Configuration
  rocket_number TEXT DEFAULT '01700-112233-0',
  rocket_type TEXT DEFAULT 'Personal (Send Money)',
  rocket_instructions TEXT,

  -- Checkout Methods Toggle
  cod_enabled BOOLEAN DEFAULT true,
  cod_instructions TEXT DEFAULT 'Pay with cash in hand after inspecting the product upon arrival at your doorstep.',
  card_enabled BOOLEAN DEFAULT true,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 7. REVIEWS & RATINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY DEFAULT ('rev_' || gen_random_uuid()::text),
  product_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  rating NUMERIC(2,1) DEFAULT 5.0 CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 8. COUPONS & DISCOUNTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY DEFAULT ('cpn_' || gen_random_uuid()::text),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Seamless Read/Write Policies for Frontend and Admin Panel
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow user update to own profile" ON public.profiles;
DROP POLICY IF EXISTS "Full access profiles" ON public.profiles;
CREATE POLICY "Full access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access products" ON public.products;
CREATE POLICY "Full access products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access categories" ON public.categories;
CREATE POLICY "Full access categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access banners" ON public.banners;
CREATE POLICY "Full access banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access orders" ON public.orders;
CREATE POLICY "Full access orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access store_settings" ON public.store_settings;
CREATE POLICY "Full access store_settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access reviews" ON public.reviews;
CREATE POLICY "Full access reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access coupons" ON public.coupons;
CREATE POLICY "Full access coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 10. AUTH TRIGGER (Auto-create profile when a new user signs up)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'admin.osman@gmail.com' OR NEW.email ILIKE '%admin%' THEN 'admin'
      ELSE 'customer'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 11. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON public.orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);

-- ==============================================================================
-- 12. INITIAL SEED DATA
-- ==============================================================================

-- A. Default Store Settings & Payment Numbers
INSERT INTO public.store_settings (
  id, store_name, tagline, hotline, whatsapp, support_email, showroom_address, 
  business_hours, inside_dhaka_fee, outside_dhaka_fee, free_shipping_threshold,
  announcement_text, is_announcement_active, bkash_number, bkash_type, 
  nagad_number, nagad_type, rocket_number, rocket_type, cod_enabled, card_enabled
)
VALUES (
  'default_settings',
  'KLLYEEIN GADGETS BANGLADESH',
  'Cybernetic Tech, Flagship Phones & Acoustic Luxury',
  '+880 1700-112233',
  '+880 1700-112233',
  'support@kllyeein.com',
  'Jamuna Future Park, Level 4 (Zone D, Shop 402), Dhaka',
  '10:00 AM – 09:00 PM (Weekly Off: Wednesday)',
  60.00,
  120.00,
  5000.00,
  '🚀 FREE EXPRESS SHIPPING across Bangladesh on orders over ৳5,000 | 100% Genuine Warranty',
  true,
  '01700-112233',
  'Personal (Send Money)',
  '01700-112233',
  'Personal (Send Money)',
  '01700-112233-0',
  'Personal (Send Money)',
  true,
  true
)
ON CONFLICT (id) DO NOTHING;

-- B. Categories
INSERT INTO public.categories (id, name, slug, description, image_url, icon, item_count)
VALUES
('cat-phones', 'Smartphones & Foldables', 'phones', 'Flagship neural devices, quantum displays, aerospace titanium bodies.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800', 'Smartphone', 12),
('cat-audio', 'Neural Audio & Acoustics', 'audio', 'Zero-latency spatial sound, planar magnetic drivers, active noise isolation.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800', 'Headphones', 16),
('cat-wearables', 'Quantum Wearables', 'wearables', 'Cybernetic health trackers, sapphire glass smartwatches, biometric sensors.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800', 'Watch', 9),
('cat-accessories', 'Cyber Accessories', 'accessories', 'MagSafe wireless power banks, braided Kevlar cables, carbon cases.', 'https://images.unsplash.com/photo-1609592424083-d2d1421ecae5?q=80&w=800', 'Zap', 24),
('cat-smarthome', 'Smart Home & Drones', 'smarthome', '4K cinematic drones, ambient neural lights, smart security systems.', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800', 'Home', 11)
ON CONFLICT (slug) DO NOTHING;

-- C. Hero Banners
INSERT INTO public.banners (id, title, subtitle, image_url, badge, cta_text, cta_link, is_active)
VALUES
('banner-1', 'CYBERPHONE 16 PRO MAX', 'Forged in Grade 5 Titanium with Neural A18 Bionic Silicon', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200', 'FLAGSHIP RELEASE', 'Pre-Order Now', '/product/cyberphone-16-pro-max', true),
('banner-2', 'SPATIAL PRO HEADPHONES', 'Zero-Latency Acoustic Isolation with Planar Drivers', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1200', 'ACOUSTIC LUXURY', 'Explore Audio', '/#products', true),
('banner-3', 'QUANTUM MATRIX WATCH', 'Sapphire Glass Biometric Tracker with 7-Day Battery', 'https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=1200', 'NEXT-GEN WEARABLE', 'Shop Wearables', '/#products', true)
ON CONFLICT (id) DO NOTHING;

-- D. Initial Products
INSERT INTO public.products (id, name, slug, category, tagline, description, price, original_price, images, specs, is_featured, is_trending, is_new_release, stock, rating, review_count, tags)
VALUES
(
  'p_iphone15pro',
  'iPhone 15 Pro Max - Titanium Cyber',
  'iphone-15-pro-max-titanium-cyber',
  'phones',
  'A17 Pro Chip • Grade 5 Titanium Body • 5x Optical Zoom',
  'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
  152000,
  165000,
  ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800'],
  '[{"name": "Processor", "value": "A17 Pro Bionic"}, {"name": "RAM", "value": "8GB Unified"}, {"name": "Display", "value": "6.7 inch Super Retina XDR 120Hz"}, {"name": "Storage", "value": "256GB / 512GB"}]'::jsonb,
  true, true, true, 12, 4.9, 128, ARRAY['apple', 'iphone', 'flagship', '5g']
),
(
  'p_s24ultra',
  'Samsung Galaxy S24 Ultra AI Edition',
  'samsung-galaxy-s24-ultra-ai',
  'phones',
  'Galaxy AI Included • 200MP Camera • Titanium Frame',
  'Unleash new ways to create, connect and communicate with Galaxy AI. Powered by Snapdragon 8 Gen 3 for Galaxy.',
  145000,
  158000,
  ARRAY['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800'],
  '[{"name": "Processor", "value": "Snapdragon 8 Gen 3"}, {"name": "RAM", "value": "12GB LPDDR5X"}, {"name": "Display", "value": "6.8 inch QHD+ Dynamic AMOLED 2X"}, {"name": "Camera", "value": "200MP Quad Telephoto"}]'::jsonb,
  true, true, false, 8, 4.8, 95, ARRAY['samsung', 'galaxy', 'android', 'ai']
),
(
  'p_airpods_max',
  'Apple AirPods Max Space Gray',
  'apple-airpods-max-space-gray',
  'audio',
  'Active Noise Cancellation • Spatial Audio • Digital Crown',
  'High-fidelity audio combined with industry-leading Active Noise Cancellation and personalized Spatial Audio.',
  56000,
  62000,
  ARRAY['https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800'],
  '[{"name": "Battery", "value": "20 Hours Listening"}, {"name": "Connectivity", "value": "Bluetooth 5.0 Apple H1"}, {"name": "Weight", "value": "384.8g"}]'::jsonb,
  true, false, true, 15, 4.9, 84, ARRAY['apple', 'headphone', 'audio', 'anc']
),
(
  'p_apple_watch_ultra2',
  'Apple Watch Ultra 2 GPS + Cellular',
  'apple-watch-ultra-2-gps-cellular',
  'wearables',
  '3000 Nits Brightness • S9 SiP • 36 Hour Battery',
  'The most capable and rugged Apple Watch ever designed for endurance athletes and outdoor adventurers.',
  92000,
  98000,
  ARRAY['https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=800'],
  '[{"name": "Case Size", "value": "49mm Titanium"}, {"name": "Water Resistance", "value": "100m ISO 22810"}, {"name": "Display", "value": "3000 nits Always-On OLED"}]'::jsonb,
  false, true, true, 10, 5.0, 42, ARRAY['apple', 'smartwatch', 'ultra', 'fitness']
)
ON CONFLICT (slug) DO NOTHING;

-- E. Sample Active Coupons
INSERT INTO public.coupons (id, code, discount_type, discount_value, min_order_amount, is_active)
VALUES
('cpn_welcome10', 'KLLY10', 'percentage', 10.00, 2000.00, true),
('cpn_eid_special', 'EID500', 'fixed', 500.00, 5000.00, true)
ON CONFLICT (code) DO NOTHING;
`;

