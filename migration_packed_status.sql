-- Quick Migration: Add PACKED status support
-- Run this in Supabase SQL Editor

-- 1. Add packed_at timestamp column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS packed_at TIMESTAMP WITH TIME ZONE;

-- 2. No data migration needed - PACKED is a new status
-- Existing orders will remain in their current statuses

-- 3. Verify column added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'packed_at';

-- Migration complete!
-- New status flow: PLACED → CONFIRMED → PACKED → ASSIGNED → OUT_FOR_DELIVERY → DELIVERED
