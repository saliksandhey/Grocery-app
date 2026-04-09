-- Migration: Add user_id column to orders table
-- This links orders to users for better filtering and tracking
-- Run this in Supabase SQL Editor (optional)

-- Add user_id column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Add RLS policy to allow users to see their own orders
-- (Only if you have RLS enabled on orders table)
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their own orders" 
--   ON orders FOR SELECT 
--   USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' 
  AND column_name = 'user_id';

-- Migration complete!
-- After running this, you can optionally update the store.js to include user_id in order creation
