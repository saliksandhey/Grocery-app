-- Migration Script for Order Management System Update
-- Run this in your Supabase SQL Editor to update existing database

-- 1. Add new columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'PENDING';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS placed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS out_for_delivery_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- 2. Add new columns to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 3. Migrate existing order statuses to new format
UPDATE orders SET status = 'PLACED' WHERE status = 'Pending';
UPDATE orders SET status = 'CONFIRMED' WHERE status = 'Packed';
UPDATE orders SET status = 'OUT_FOR_DELIVERY' WHERE status = 'Out for Delivery';
UPDATE orders SET status = 'DELIVERED' WHERE status = 'Delivered';
UPDATE orders SET status = 'CANCELLED' WHERE status = 'Cancelled';

-- 4. Set placed_at for existing orders that don't have it
UPDATE orders SET placed_at = created_at WHERE placed_at IS NULL;

-- 5. Set other timestamps based on current status for existing orders
UPDATE orders SET confirmed_at = created_at WHERE status = 'CONFIRMED' AND confirmed_at IS NULL;
UPDATE orders SET assigned_at = created_at WHERE status = 'ASSIGNED' AND assigned_at IS NULL;
UPDATE orders SET out_for_delivery_at = created_at WHERE status = 'OUT_FOR_DELIVERY' AND out_for_delivery_at IS NULL;
UPDATE orders SET delivered_at = created_at WHERE status = 'DELIVERED' AND delivered_at IS NULL;
UPDATE orders SET cancelled_at = created_at WHERE status = 'CANCELLED' AND cancelled_at IS NULL;

-- 6. Populate product_name and image_url in order_items from products table
UPDATE order_items 
SET product_name = p.name, 
    image_url = p.image_url
FROM products p
WHERE order_items.product_id = p.id 
  AND (order_items.product_name IS NULL OR order_items.image_url IS NULL);

-- 7. Create delivery_earnings table if it doesn't exist
CREATE TABLE IF NOT EXISTS delivery_earnings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    delivery_boy_id UUID REFERENCES profiles(id),
    order_id UUID REFERENCES orders(id),
    amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Enable RLS on delivery_earnings
ALTER TABLE delivery_earnings ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for delivery_earnings if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'delivery_earnings' 
        AND policyname = 'Enable read access for all'
    ) THEN
        CREATE POLICY "Enable read access for all" ON delivery_earnings FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'delivery_earnings' 
        AND policyname = 'Enable insert for all'
    ) THEN
        CREATE POLICY "Enable insert for all" ON delivery_earnings FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'delivery_earnings' 
        AND policyname = 'Enable update for all'
    ) THEN
        CREATE POLICY "Enable update for all" ON delivery_earnings FOR UPDATE USING (true);
    END IF;
END $$;

-- 10. Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS delivery_earnings;

-- 11. Update default status for new orders
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'PLACED';

-- Migration complete!
-- All existing orders have been migrated to the new status format.
-- New orders will use the new status flow: PLACED → CONFIRMED → ASSIGNED → OUT_FOR_DELIVERY → DELIVERED
