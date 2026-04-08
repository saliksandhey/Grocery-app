-- Create Profiles Table (extends Supabase Auth Users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'customer', -- 'admin', 'customer', 'delivery_boy'
    name TEXT,
    phone TEXT,
    status TEXT DEFAULT 'available', -- 'available', 'busy', etc. for riders
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create simple Users Table for customers (replacing OTP)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Categories Table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete categories" ON categories FOR DELETE USING (true);

-- Create Products Table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    orig_price NUMERIC,
    description TEXT,
    weight TEXT,
    image_url TEXT,
    category TEXT,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Orders Table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_details JSONB NOT NULL,
    status TEXT DEFAULT 'PLACED', -- 'PLACED', 'CONFIRMED', 'PACKED', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
    item_total NUMERIC DEFAULT 0,
    delivery_charge NUMERIC DEFAULT 0,
    grand_total NUMERIC DEFAULT 0,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'REFUNDED'
    delivery_boy_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    placed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    packed_at TIMESTAMP WITH TIME ZONE,
    assigned_at TIMESTAMP WITH TIME ZONE,
    out_for_delivery_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Order Items Table (Junction Table for relational orders)
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    product_name TEXT,
    image_url TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Setup Row Level Security (RLS)
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;


-- 1. Policies for profiles
-- Anyone can view profiles (to fetch delivery boys, etc)
CREATE POLICY "Public profiles are viewable by everyone."
ON profiles FOR SELECT USING (true);

-- Users can insert/update their own profile
CREATE POLICY "Users can insert their own profile."
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
ON profiles FOR UPDATE USING (true);

-- 1b. Policies for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read/insert/update for all users"
ON users FOR ALL USING (true) WITH CHECK (true);

-- 2. Policies for products

-- Everyone can view products
CREATE POLICY "Products are viewable by everyone."
ON products FOR SELECT USING (true);

-- Only admins should strictly insert/update/delete, but for dev purposes allowing all:
CREATE POLICY "Enable insert for all users (Dev/Admin mode)"
ON products FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users (Dev/Admin mode)"
ON products FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users (Dev/Admin mode)"
ON products FOR DELETE USING (true);


-- 3. Policies for orders
-- For dev purposes: Anyone can select/insert/update orders
CREATE POLICY "Enable read access for all"
ON orders FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users"
ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON orders FOR UPDATE USING (true);


-- 4. Policies for order_items
-- For dev purposes: Anyone can select/insert/update order_items
CREATE POLICY "Enable read access for all"
ON order_items FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users"
ON order_items FOR INSERT WITH CHECK (true);


-- Enable Real-Time 
-- This ensures that the realtime clients receive broadcast events (like in `store.js` logic)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_boys;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Storage Configuration
-- product-images bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;
-- category-images bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('category-images', 'category-images', true) ON CONFLICT DO NOTHING;

-- Storage Policies for product-images
CREATE POLICY "Public Access product-images" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'product-images' );

CREATE POLICY "Admin Insert product-images" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'product-images' );

-- Storage Policies for category-images
CREATE POLICY "Public Access category-images" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'category-images' );

CREATE POLICY "Admin Insert category-images" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'category-images' );

-- Create Settings Table
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all" ON settings FOR SELECT USING (true);
CREATE POLICY "Enable update for all" ON settings FOR ALL USING (true) WITH CHECK (true);

-- realtime
ALTER PUBLICATION supabase_realtime ADD TABLE settings;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;

-- Insert default value
INSERT INTO settings (key, value) VALUES ('store_open', 'true') ON CONFLICT DO NOTHING;

-- Create Delivery Earnings Table
CREATE TABLE delivery_earnings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    delivery_boy_id UUID REFERENCES profiles(id),
    order_id UUID REFERENCES orders(id),
    amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for delivery_earnings
ALTER TABLE delivery_earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all" ON delivery_earnings FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON delivery_earnings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON delivery_earnings FOR UPDATE USING (true);

-- realtime for delivery_earnings
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_earnings;
