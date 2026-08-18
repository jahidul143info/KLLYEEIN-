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

export const isSupabaseConfigured = getSupabaseConfig().isConfigured;
export const supabase = getSupabaseClient();

/**
 * SQL Setup string provided for users to copy and run in their Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- KLLYEEIN Gadgets eCommerce Supabase Full Schema & Initial Data Setup
-- Copy and paste this complete script into your Supabase SQL Editor and click 'RUN'

-- ================================================
-- 1. PRODUCTS TABLE (Stores Cloudinary Image URLs)
-- ================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT ('prod_' || gen_random_uuid()::text),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  images TEXT[] DEFAULT '{}',
  specs JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_new_release BOOLEAN DEFAULT true,
  stock INT DEFAULT 15,
  rating NUMERIC DEFAULT 5.0,
  review_count INT DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 2. CATEGORIES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT ('cat_' || gen_random_uuid()::text),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  icon TEXT,
  item_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 3. HERO PROMO BANNERS TABLE
-- ================================================
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

-- ================================================
-- 4. ORDERS & CHECKOUT TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT ('ord_' || gen_random_uuid()::text),
  order_number TEXT UNIQUE NOT NULL,
  user_email TEXT,
  status TEXT DEFAULT 'pending',
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  shipping_fee NUMERIC DEFAULT 0,
  payment_method TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Disable strict policy restrictions for anon key so public site and admin panel work smoothly
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Full access products" ON public.products;
CREATE POLICY "Full access products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access categories" ON public.categories;
CREATE POLICY "Full access categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access banners" ON public.banners;
CREATE POLICY "Full access banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access orders" ON public.orders;
CREATE POLICY "Full access orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- ================================================
-- 6. INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);

-- ================================================
-- 7. INITIAL SEED DATA (PRODUCTS WITH CLOUDINARY URLS)
-- ================================================
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
`;
