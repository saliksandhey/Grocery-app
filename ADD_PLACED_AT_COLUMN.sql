-- ============================================
-- FIX: Add Missing placed_at Column to Orders Table
-- Run this in Supabase SQL Editor
-- ============================================

-- Add the missing placed_at column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS placed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Set placed_at for existing orders that don't have it
UPDATE orders SET placed_at = created_at WHERE placed_at IS NULL;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'placed_at';

-- If you want to see all columns in the orders table:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'orders' 
-- ORDER BY ordinal_position;
