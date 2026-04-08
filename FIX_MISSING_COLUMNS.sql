-- ============================================
-- FIX: Add Missing Columns to Orders Table
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- 1. Add payment_status column (THIS IS THE MAIN ERROR)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'PENDING';

-- 2. Add packed_at timestamp (for new PACKED status)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS packed_at TIMESTAMP WITH TIME ZONE;

-- 3. Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('payment_status', 'packed_at', 'placed_at', 'confirmed_at', 'assigned_at', 'out_for_delivery_at', 'delivered_at', 'cancelled_at')
ORDER BY column_name;

-- ============================================
-- If you're still getting errors, run this to see ALL columns:
-- ============================================
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'orders' 
-- ORDER BY ordinal_position;

-- ============================================
-- Expected columns in orders table:
-- ============================================
-- id (uuid)
-- customer_details (jsonb)
-- status (text) - should default to 'PLACED'
-- item_total (numeric)
-- delivery_charge (numeric)
-- grand_total (numeric)
-- payment_method (text)
-- payment_status (text) - NEW! should default to 'PENDING'
-- delivery_boy_id (uuid)
-- placed_at (timestamp)
-- confirmed_at (timestamp)
-- packed_at (timestamp) - NEW!
-- assigned_at (timestamp)
-- out_for_delivery_at (timestamp)
-- delivered_at (timestamp)
-- cancelled_at (timestamp)
-- created_at (timestamp)
