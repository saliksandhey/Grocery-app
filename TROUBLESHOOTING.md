# 🔧 Troubleshooting: Orders Not Showing in Admin Panel

## Quick Fix Steps

### Step 1: Check Browser Console (MOST IMPORTANT)

1. Open your browser (Chrome/Firefox/Edge)
2. Press **F12** to open Developer Tools
3. Click on the **Console** tab
4. Refresh the admin page (`/admin`)
5. Look for these messages:
   - ✅ `Supabase connected, realtime listeners active` - Good!
   - ✅ `Admin - Total orders loaded: X` - Shows how many orders loaded
   - ❌ `Error fetching orders:` - There's a database issue
   - ❌ `Failed to fetch orders:` - Connection problem

### Step 2: Run Database Migration (REQUIRED)

**If you haven't run the migration yet, orders won't show!**

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `database_migration.sql` from your project
6. Copy ALL the content
7. Paste into the SQL Editor
8. Click **Run** (or press Ctrl+Enter)
9. Wait for success message

**What the migration does:**
- Adds new columns to `orders` table (timestamps, payment_status)
- Adds new columns to `order_items` table (product_name, image_url)
- Migrates old status names to new format
- Creates delivery_earnings table

### Step 3: Verify Database Tables

After running migration, check if tables are correct:

1. In Supabase Dashboard, click **Table Editor**
2. Click on `orders` table
3. Verify these columns exist:
   - ✅ `status` (text)
   - ✅ `placed_at` (timestamp)
   - ✅ `confirmed_at` (timestamp)
   - ✅ `payment_status` (text)
   
4. Click on `order_items` table
5. Verify these columns exist:
   - ✅ `product_name` (text)
   - ✅ `image_url` (text)
   - ✅ `quantity` (integer)
   - ✅ `price` (numeric)

### Step 4: Check if Orders Exist in Database

1. In Supabase Dashboard, go to **Table Editor**
2. Click on `orders` table
3. Do you see any rows?
   - **YES** → Orders exist, continue to Step 5
   - **NO** → You need to place a test order first

### Step 5: Place a Test Order

1. Open your app: `http://localhost:5173` (or your dev URL)
2. Login as a customer
3. Add some products to cart
4. Go to checkout
5. Fill in address
6. Select payment method (COD)
7. Click "Place Order"
8. You should see success page

### Step 6: Check Admin Panel Again

1. Go to `/admin`
2. Click on **Orders** in the sidebar
3. You should see your order now!

---

## Common Issues & Solutions

### Issue 1: "Error fetching orders: column 'product_name' does not exist"

**Cause:** Database migration not run yet

**Solution:** 
- Run the `database_migration.sql` script (Step 2 above)

### Issue 2: Console shows "Admin - Total orders loaded: 0"

**Cause:** No orders in database OR query failed

**Solution:**
- Check if orders exist in Supabase Table Editor (Step 4)
- If no orders, place a test order (Step 5)
- If orders exist but not loading, check console for errors

### Issue 3: "relation 'order_items' does not exist"

**Cause:** The order_items table is missing

**Solution:**
- Check if `order_items` table exists in Supabase Table Editor
- If missing, run the schema from `supabase_schema.sql`
- Or create the table manually with these columns:
  ```sql
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
  ```

### Issue 4: Orders show but items are empty

**Cause:** Old orders don't have product_name/image_url populated

**Solution:**
- Run this SQL in Supabase SQL Editor:
  ```sql
  UPDATE order_items 
  SET product_name = p.name, 
      image_url = p.image_url
  FROM products p
  WHERE order_items.product_id = p.id 
    AND (order_items.product_name IS NULL OR order_items.image_url IS NULL);
  ```

### Issue 5: "Failed to fetch orders: [error message]"

**Cause:** Supabase connection issue

**Solution:**
1. Check `.env` file has correct Supabase URL and key
2. Verify Supabase project is active
3. Check browser network tab for failed requests
4. Make sure Row Level Security (RLS) policies allow reading orders

---

## Debug Checklist

Run through this checklist to identify the issue:

- [ ] Browser console opens (F12)
- [ ] No red errors in console
- [ ] See "Supabase connected" message
- [ ] See "Admin - Total orders loaded: X" message
- [ ] Database migration ran successfully
- [ ] `orders` table has columns: status, placed_at, payment_status
- [ ] `order_items` table has columns: product_name, image_url
- [ ] At least one order exists in database
- [ ] Can see orders in Supabase Table Editor
- [ ] Placed a test order successfully
- [ ] Admin page shows orders count > 0

---

## Quick Test Commands

Run these in Supabase SQL Editor to verify everything:

```sql
-- Check if orders table has correct columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Check if order_items table has correct columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- Count orders by status
SELECT status, COUNT(*) as count 
FROM orders 
GROUP BY status;

-- Check order items with product names
SELECT oi.id, oi.product_name, oi.quantity, oi.price, o.status
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
LIMIT 10;

-- View all orders
SELECT id, status, customer_details->>'name' as customer_name, 
       grand_total, created_at
FROM orders
ORDER BY created_at DESC;
```

---

## Still Not Working?

1. **Check Console Logs:**
   - Open browser console (F12)
   - Look for any red error messages
   - Screenshot the errors

2. **Check Network Tab:**
   - Open DevTools → Network tab
   - Refresh the page
   - Look for failed requests (red)
   - Check Supabase API calls

3. **Verify Supabase Connection:**
   - Open `.env` file
   - Check `VITE_SUPABASE_URL` is correct
   - Check `VITE_SUPABASE_ANON_KEY` is correct

4. **Try Hard Refresh:**
   - Press `Ctrl + Shift + R` (Windows)
   - Or `Cmd + Shift + R` (Mac)
   - This clears cache and reloads

5. **Restart Dev Server:**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

---

## Expected Behavior After Fix

When everything works correctly:

1. **Console shows:**
   ```
   Supabase connected, realtime listeners active
   Admin - Total orders loaded: 5
   Admin - Orders: [Array of order objects]
   ```

2. **Admin Panel shows:**
   - Dashboard with stats (Pending, Active, Delivered, Revenue)
   - Orders list with customer names
   - Order items visible when clicking on an order
   - Status badges with correct colors

3. **Order Detail Modal shows:**
   - Customer information
   - Ordered items with product names and images
   - Order summary with totals
   - Action buttons (Accept, Assign, etc.)

---

## Success Indicators ✅

You'll know it's working when:
- ✅ Admin dashboard shows order count > 0
- ✅ Orders tab lists all orders
- ✅ Clicking an order shows items correctly
- ✅ Product names and images display
- ✅ Status badges show correct colors
- ✅ Action buttons work (Accept, Assign, etc.)

---

**Need More Help?** Check the console logs and share any error messages you see!
