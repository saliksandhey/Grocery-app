-- ============================================
-- DIAGNOSE & FIX: Order Items Not Saving
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Check if order_items table exists and has correct structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- STEP 2: Check foreign key constraints on order_items
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'order_items';

-- STEP 3: Check RLS policies on order_items
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'order_items';

-- STEP 4: Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'order_items';

-- STEP 5: Verify orders table structure (for reference)
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- ============================================
-- FIXES (Run if needed)
-- ============================================

-- FIX 1: Add missing columns if they don't exist
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- FIX 2: Recreate foreign key constraint if missing
-- First check if it exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
            AND table_name = 'order_items' 
            AND constraint_name = 'order_items_order_id_fkey'
    ) THEN
        -- Drop any existing constraint on order_id first
        ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
        
        -- Add the constraint
        ALTER TABLE order_items 
        ADD CONSTRAINT order_items_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- FIX 3: Ensure product_id foreign key exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
            AND table_name = 'order_items' 
            AND constraint_name = 'order_items_product_id_fkey'
    ) THEN
        -- Drop any existing constraint on product_id first
        ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
        
        -- Add the constraint
        ALTER TABLE order_items 
        ADD CONSTRAINT order_items_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Product foreign key constraint added successfully';
    ELSE
        RAISE NOTICE 'Product foreign key constraint already exists';
    END IF;
END $$;

-- FIX 4: Enable RLS if not enabled
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- FIX 5: Recreate RLS policies for order_items
-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all" ON order_items;
DROP POLICY IF EXISTS "Enable insert for all users" ON order_items;
DROP POLICY IF EXISTS "Enable update for all users" ON order_items;

-- Create new policies
CREATE POLICY "Enable read access for all" 
ON order_items FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON order_items FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON order_items FOR UPDATE 
USING (true);

-- FIX 6: Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;

-- ============================================
-- VERIFICATION
-- ============================================

-- Test insert (this should work after fixes)
-- Uncomment to test:
/*
DO $$ 
DECLARE
    test_order_id UUID;
    test_product_id UUID;
BEGIN
    -- Get a valid order_id
    SELECT id INTO test_order_id FROM orders LIMIT 1;
    
    -- Get a valid product_id
    SELECT id INTO test_product_id FROM products LIMIT 1;
    
    -- Try to insert a test item
    IF test_order_id IS NOT NULL AND test_product_id IS NOT NULL THEN
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
        VALUES (test_order_id, test_product_id, 'Test Product', 1, 10.00);
        
        RAISE NOTICE 'Test insert successful!';
        
        -- Clean up test data
        DELETE FROM order_items WHERE product_name = 'Test Product';
        RAISE NOTICE 'Test data cleaned up';
    ELSE
        RAISE NOTICE 'Cannot test: No orders or products found in database';
    END IF;
END $$;
*/

-- Final verification: Show table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'order_items'
ORDER BY ordinal_position;
