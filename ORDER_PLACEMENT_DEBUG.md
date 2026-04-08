# Order Placement Troubleshooting Guide

## How to Debug Order Placement Issues

### Step 1: Open Browser Console
1. Open your grocery app in the browser
2. Press **F12** to open Developer Tools
3. Click on the **Console** tab
4. Keep it open while you place an order

### Step 2: Place a Test Order
1. Add items to cart
2. Go to checkout
3. Fill in address
4. Click "Place Order"
5. **Watch the console for messages**

### Step 3: Check Console Messages

You should see these messages in order:
```
✅ Submitting order...
✅ Order data: {customer: {...}, items: [...], summary: {...}, paymentMethod: "cod"}
✅ placeOrder called with: {...}
✅ Order created successfully: <uuid>
✅ Inserting order items: [...]
✅ Order items inserted successfully
✅ Order added to state
✅ Order placed successfully, navigating to success
```

### Step 4: Common Errors & Fixes

#### Error 1: "Store is closed, cannot place order"
**Fix:** The store hours setting is disabled. Go to Admin panel and enable store.

#### Error 2: "Error creating order: ..."
**Possible causes:**
- Database connection issue
- Missing columns in orders table
- RLS (Row Level Security) blocking inserts

**Fix:** Run this SQL in Supabase SQL Editor:
```sql
-- Check if orders table exists and has correct columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
```

Required columns:
- `customer_details` (jsonb)
- `status` (text)
- `item_total` (numeric)
- `delivery_charge` (numeric)
- `grand_total` (numeric)
- `payment_method` (text)
- `payment_status` (text)
- `placed_at` (timestamp)

#### Error 3: "Error creating order items: ..."
**Possible causes:**
- Missing columns in order_items table
- Foreign key constraint failure

**Fix:** Run this SQL in Supabase SQL Editor:
```sql
-- Check order_items table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;
```

Required columns:
- `order_id` (uuid)
- `product_id` (uuid)
- `product_name` (text)
- `quantity` (integer)
- `price` (numeric)
- `image_url` (text)

#### Error 4: No error messages but order doesn't save
**Check:**
1. Is `isStoreOpen` set to true in the store?
2. Is the cart empty?
3. Is the address filled in?

### Step 5: Verify Order in Database

Run this SQL to check if orders are being created:
```sql
-- Check recent orders
SELECT id, status, grand_total, payment_method, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- Check order items for a specific order
SELECT oi.*, p.name as product_name_from_products
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
WHERE oi.order_id = 'YOUR_ORDER_ID_HERE'
ORDER BY oi.created_at;
```

### Step 6: Check RLS Policies

If you're getting permission errors, RLS might be blocking inserts. Run this:

```sql
-- Check RLS policies on orders table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'orders';

-- Check RLS policies on order_items table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'order_items';
```

**Temporary Fix (for testing only):**
```sql
-- DISABLE RLS temporarily (NOT for production!)
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
```

### Step 7: Database Migration

If columns are missing, run the migration script:

```sql
-- Run this in Supabase SQL Editor
-- File: migration_packed_status.sql

ALTER TABLE orders ADD COLUMN IF NOT EXISTS packed_at TIMESTAMP WITH TIME ZONE;
```

## Quick Test Checklist

- [ ] Browser console is open
- [ ] Cart has items
- [ ] User is logged in
- [ ] Store is open (check admin panel)
- [ ] Address is selected/entered
- [ ] No console errors before clicking "Place Order"
- [ ] Console shows "Submitting order..." message
- [ ] Console shows "Order created successfully" message
- [ ] Console shows "Order items inserted successfully" message
- [ ] Redirected to /success page
- [ ] Order appears in Admin panel

## Still Not Working?

1. **Check Supabase connection:**
   - Verify `.env` file has correct Supabase URL and key
   - Check browser Network tab for failed API calls

2. **Check cart data:**
   - Console.log the cart before placing order
   - Verify items have: id, name, price, qty

3. **Check user authentication:**
   - Verify `currentUser` is not null
   - Check if user has proper permissions

4. **Share console output:**
   - Copy all console messages
   - Share any error messages with full details
