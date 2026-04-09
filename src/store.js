import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabaseClient';

export const useAppStore = create(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (product) => set((state) => {
        if (!state.isStoreOpen) return state; // Enforce Store Closed rule
        const existing = state.cart.find(item => item.id === product.id);
        if (existing) {
          return { cart: state.cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item) };
        }
        return { cart: [...state.cart, { ...product, qty: 1 }] };
      }),
      removeFromCart: (id) => set((state) => ({ cart: state.cart.filter(item => item.id !== id) })),
      updateQty: (id, change) => set((state) => {
        if (!state.isStoreOpen && change > 0) return state; // Block increasing cart qty if closed
        const newCart = state.cart.map(item => {
          if (item.id === id) {
            return { ...item, qty: item.qty + change };
          }
          return item;
        }).filter(item => item.qty > 0);
        
        return { cart: newCart };
      }),
      clearCart: () => set({ cart: [] }),
      
      products: [],
      orders: [],
      deliveryBoys: [],
      dbCategories: [],
      realtimeChannel: null,
      
      setProducts: (products) => set({ products }),
      setOrders: (orders) => set({ orders }),
      setDeliveryBoys: (deliveryBoys) => set({ deliveryBoys }),
      setDbCategories: (dbCategories) => set({ dbCategories }),
      setRealtimeChannel: (channel) => set({ realtimeChannel: channel }),
      
      placeOrder: async (orderData) => {
        console.log('🛒 placeOrder called with:', orderData);
        
        if (!get().isStoreOpen) {
          console.error('❌ Store is closed, cannot place order');
          alert('Store is currently closed. Please try again later.');
          return null;
        }
        
        // Validate cart items
        if (!orderData.items || orderData.items.length === 0) {
          console.error('❌ No items in order');
          alert('Your cart is empty. Please add items before placing order.');
          return null;
        }
        
        console.log('📦 Order contains', orderData.items.length, 'item(s)');
        
        // 1. Insert Order
        const { error: orderError, data: order } = await supabase.from('orders').insert({
          customer_details: orderData.customer,
          status: 'PLACED',
          item_total: orderData.summary.itemTotal,
          delivery_charge: orderData.summary.deliveryCharge,
          grand_total: orderData.summary.grandTotal,
          payment_method: orderData.paymentMethod,
          payment_status: orderData.paymentMethod === 'cod' ? 'PENDING' : 'PENDING',
          placed_at: new Date().toISOString()
        }).select().single();
        
        if (orderError) {
          console.error('❌ Error creating order:', orderError);
          alert('Failed to create order: ' + orderError.message);
          return null;
        }
        
        if (!order) {
          console.error('❌ No order data returned from database');
          alert('Failed to create order');
          return null;
        }
        
        console.log('✅ Order created successfully:', order.id);
        
        // 2. Insert Items with product name and image for reliable display
        const itemsToInsert = orderData.items.map(item => ({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          quantity: item.qty,
          price: item.price,
          image_url: item.image_url || item.image || ''
        }));
        
        console.log('📦 Inserting order items:', itemsToInsert);
        console.log('📊 Number of items:', itemsToInsert.length);
        
        // Validate items before inserting
        if (!itemsToInsert || itemsToInsert.length === 0) {
          console.error('❌ No items to insert!');
          alert('No items in cart. Please add items before placing order.');
          return null;
        }

        // Insert items one by one for better error handling
        let insertedItems = [];
        let hasError = false;
        
        for (const item of itemsToInsert) {
          console.log('Inserting item:', item);
          
          const { error: itemError, data: insertedItem } = await supabase
            .from('order_items')
            .insert(item)
            .select()
            .single();
          
          if (itemError) {
            console.error('❌ Error inserting item:', item);
            console.error('Error details:', JSON.stringify(itemError, null, 2));
            hasError = true;
            
            // Check for specific error types
            if (itemError.code === '23503') {
              console.error('Foreign key constraint violation - order_id or product_id may be invalid');
            } else if (itemError.code === '23502') {
              console.error('Not-null constraint violation - missing required field');
            } else if (itemError.code === '42501') {
              console.error('Permission denied - RLS policy may be blocking insert');
            }
          } else {
            console.log('✅ Item inserted successfully:', insertedItem);
            insertedItems.push(insertedItem);
          }
        }
        
        if (hasError) {
          console.error('❌ Some items failed to insert');
          console.error('Successfully inserted:', insertedItems.length, 'out of', itemsToInsert.length);
          alert(`Order created but ${itemsToInsert.length - insertedItems.length} item(s) failed to save. Please contact support.`);
        } else {
          console.log('✅ All order items inserted successfully:', insertedItems.length, 'items');
        }

        // Clear cart first before adding to orders
        get().clearCart();
        
        // Add to local state with items attached for immediate UI update
        const newOrderForState = {
          ...order,
          order_items: orderData.items.map(i => ({ 
            product_name: i.name, 
            image_url: i.image_url || i.image || '',
            quantity: i.qty,
            price: i.price
          }))
        };
        set(state => ({ orders: [newOrderForState, ...state.orders] }));
        console.log('✅ Order added to local state');
        return newOrderForState;
      },
      
      updateOrderStatus: async (orderId, newStatus, role = 'admin') => {
        console.log(`🔄 Updating order ${orderId} status to ${newStatus} (role: ${role})`);
        
        // Strict forward-only transition chain
        const CHAIN = [
          'PLACED', 'CONFIRMED', 'PACKED', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED'
        ];
        const TERMINAL = ['DELIVERED', 'CANCELLED'];

        const currentOrder = get().orders.find(o => o.id === orderId);
        if (!currentOrder) {
          console.error('❌ Order not found:', orderId);
          return { error: 'Order not found' };
        }
        
        const currentStatus = currentOrder.status;
        console.log(`📋 Current status: ${currentStatus}`);

        // Guard: terminal states are immutable
        if (TERMINAL.includes(currentStatus)) {
          console.error('❌ Order is in terminal state:', currentStatus);
          return { error: `Order is already "${currentStatus}" and cannot be changed.` };
        }

        // Guard: Cancellation ONLY allowed from PLACED status
        if (newStatus === 'CANCELLED' && currentStatus !== 'PLACED') {
          console.error('❌ Can only cancel from PLACED status');
          return { error: 'Order can only be cancelled at PLACED stage.' };
        }

        // Role-based validations
        const isAssigned = !!currentOrder.delivery_boy_id;
        
        // Admin cannot update after PACKED stage (assignment happens at PACKED)
        if (role === 'admin' && ['ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(currentStatus)) {
          console.error('❌ Admin cannot update order after assignment');
          return { error: 'Cannot update order after assigning delivery partner.' };
        }
        
        if (role === 'delivery' && !isAssigned) {
          console.error('❌ Order not assigned to delivery boy');
          return { error: 'Order must be assigned before updating status.' };
        }

        // Guard: enforce forward-only chain (non-cancel transitions)
        if (newStatus !== 'CANCELLED') {
          const fromIdx = CHAIN.indexOf(currentStatus);
          const toIdx   = CHAIN.indexOf(newStatus);
          if (toIdx === -1) {
            console.error('❌ Unknown status:', newStatus);
            return { error: `Unknown status: "${newStatus}"` };
          }
          if (toIdx !== fromIdx + 1) {
            console.error(`❌ Invalid transition: ${currentStatus} → ${newStatus}`);
            return { error: `Cannot move from "${currentStatus}" to "${newStatus}". Follow the correct order.` };
          }
        }

        // Auto-handle timestamps
        const timestampUpdates = {};
        if (newStatus === 'CONFIRMED') timestampUpdates.confirmed_at = new Date().toISOString();
        if (newStatus === 'PACKED') timestampUpdates.packed_at = new Date().toISOString();
        if (newStatus === 'ASSIGNED') timestampUpdates.assigned_at = new Date().toISOString();
        if (newStatus === 'OUT_FOR_DELIVERY') timestampUpdates.out_for_delivery_at = new Date().toISOString();
        if (newStatus === 'DELIVERED') timestampUpdates.delivered_at = new Date().toISOString();
        if (newStatus === 'CANCELLED') timestampUpdates.cancelled_at = new Date().toISOString();

        console.log('💾 Updating database with:', { status: newStatus, ...timestampUpdates });

        // Update database first
        const { error } = await supabase
          .from('orders')
          .update({ status: newStatus, ...timestampUpdates })
          .eq('id', orderId);
        
        if (error) {
          console.error('❌ Database update failed:', error);
          return { error: error.message };
        }

        // Update local state after successful DB update
        set(state => ({
          orders: state.orders.map(o => 
            o.id === orderId 
              ? { ...o, status: newStatus, ...timestampUpdates } 
              : o
          )
        }));
        
        console.log('✅ Order status updated successfully');
        return { error: null };
      },
      
      assignDeliveryBoy: async (orderId, dbId) => {
        console.log(`🚚 Assigning delivery boy ${dbId} to order ${orderId}`);
        
        const currentOrder = get().orders.find(o => o.id === orderId);
        if (!currentOrder) {
          console.error('❌ Order not found for assignment:', orderId);
          return { error: 'Order not found' };
        }

        // Validate order is in PACKED status
        if (currentOrder.status !== 'PACKED') {
          console.error('❌ Order must be in PACKED status before assignment');
          return { error: 'Order must be packed before assigning delivery boy' };
        }
        
        // Update database first
        const updateData = { 
          delivery_boy_id: dbId, 
          status: 'ASSIGNED',
          assigned_at: new Date().toISOString()
        };

        console.log('💾 Updating database with assignment:', updateData);

        const { error, data } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', orderId)
          .select()
          .single();
        
        // If assigned_at column doesn't exist, retry without it
        if (error && error.code === 'PGRST204' && error.message.includes('assigned_at')) {
          console.warn('⚠️ assigned_at column missing, retrying without timestamp...');
          
          const { error: retryError, data: retryData } = await supabase
            .from('orders')
            .update({ 
              delivery_boy_id: dbId, 
              status: 'ASSIGNED'
            })
            .eq('id', orderId)
            .select()
            .single();
          
          if (retryError) {
            console.error('❌ Assignment failed (retry):', retryError);
            return { error: retryError.message };
          }
          
          console.log('✅ Delivery boy assigned successfully (without timestamp)');
          
          // Update local state
          set(state => ({
            orders: state.orders.map(o => 
              o.id === orderId 
                ? { ...o, delivery_boy_id: dbId, status: 'ASSIGNED' } 
                : o
            )
          }));
          
          return { error: null, data: retryData };
        }
        
        if (error) {
          console.error('❌ Assignment failed:', error);
          return { error: error.message };
        }
        
        console.log('✅ Delivery boy assigned successfully');
        
        // Update local state after successful DB update
        set(state => ({
          orders: state.orders.map(o => 
            o.id === orderId 
              ? { ...o, delivery_boy_id: dbId, status: 'ASSIGNED', assigned_at: new Date().toISOString() } 
              : o
          )
        }));
        
        return { error: null, data };
      },
      
      addDeliveryBoy: async (db) => {
        const { error, data } = await supabase.from('delivery_boys').insert(db).select().single();
        if (data && !error) {
           set(state => ({ deliveryBoys: [...state.deliveryBoys, data] }));
        }
        return { error, data };
      },
      editDeliveryBoy: async (id, db) => {
        const { error, data } = await supabase.from('delivery_boys').update(db).eq('id', id).select().single();
        if (data && !error) {
           set(state => ({ deliveryBoys: state.deliveryBoys.map(d => d.id === id ? data : d) }));
        }
        return { error, data };
      },
      deleteDeliveryBoy: async (id) => {
        const { error } = await supabase.from('delivery_boys').delete().eq('id', id);
        if (!error) {
           set(state => ({ deliveryBoys: state.deliveryBoys.filter(d => d.id !== id) }));
        }
      },

      addProduct: async (productData) => {
        const { error, data } = await supabase.from('products').insert(productData).select().single();
        if (data && !error) {
           set(state => ({ products: [data, ...state.products] }));
        }
        return { error, data };
      },
      editProduct: async (id, updatedData) => {
        const { error, data } = await supabase.from('products').update(updatedData).eq('id', id).select().single();
        if (data && !error) {
           set(state => ({ products: state.products.map(p => p.id === id ? data : p) }));
        }
        return { error, data };
      },
      deleteProduct: async (id) => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
           set(state => ({ products: state.products.filter(p => p.id !== id) }));
        }
      },

      addCategory: async (catData) => {
        const { error, data } = await supabase.from('categories').insert(catData).select().single();
        if (data && !error) set(state => ({ dbCategories: [data, ...state.dbCategories] }));
        return { error, data };
      },
      editCategory: async (id, catData) => {
        const { error, data } = await supabase.from('categories').update(catData).eq('id', id).select().single();
        if (data && !error) set(state => ({ dbCategories: state.dbCategories.map(c => c.id === id ? data : c) }));
        return { error, data };
      },
      deleteCategory: async (id) => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) set(state => ({ dbCategories: state.dbCategories.filter(c => c.id !== id) }));
      },

      // ── Store Open/Close ──
      isStoreOpen: true,
      setStoreOpen: async (open) => {
        set({ isStoreOpen: open });
        await supabase.from('settings').upsert({ key: 'store_open', value: open ? 'true' : 'false' }, { onConflict: 'key' });
      },
      fetchStoreStatus: async () => {
        const { data } = await supabase.from('settings').select('value').eq('key', 'store_open').single();
        if (data) set({ isStoreOpen: data.value === 'true' });
      },

      currentDeliveryBoy: null,
      loginDeliveryBoy: async (username, password) => {
        const { data, error } = await supabase.from('delivery_boys').select('*').eq('username', username).eq('password', password).single();
        if (data && !error) {
          set({ currentDeliveryBoy: data });
          return true;
        }
        return false;
      },
      logoutDeliveryBoy: () => set({ currentDeliveryBoy: null }),

      // ── Customer Auth ──
      currentUser: null,
      loginUser: async (phone, password) => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('phone', phone.trim())
          .eq('password', password)
          .single();
        if (data && !error) {
          set({ currentUser: data });
          return { success: true };
        }
        return { success: false, message: 'Incorrect phone number or password.' };
      },
      signupUser: async (name, phone, password) => {
        // Check if phone already exists
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('phone', phone.trim())
          .single();
        if (existing) return { success: false, message: 'Phone number already registered.' };

        const { data, error } = await supabase
          .from('users')
          .insert({ name: name.trim(), phone: phone.trim(), password })
          .select()
          .single();
        if (data && !error) {
          set({ currentUser: data });
          return { success: true };
        }
        return { success: false, message: error?.message || 'Signup failed. Try again.' };
      },
      logoutUser: () => set({ currentUser: null }),
      
    }),
    {
      name: 'grocery-app-storage-ext', 
      partialize: (state) => ({ cart: state.cart, currentDeliveryBoy: state.currentDeliveryBoy, currentUser: state.currentUser }), 
    }
  )
);

export const connectSupabase = async () => {
  console.log('🔌 Connecting to Supabase...');
  
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (products) useAppStore.getState().setProducts(products);

  const { data: drivers } = await supabase.from('delivery_boys').select('*');
  if (drivers) useAppStore.getState().setDeliveryBoys(drivers);

  const { data: cats } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
  if (cats) useAppStore.getState().setDbCategories(cats);

  // Deep fetch using Supabase relations
  const fetchOrders = async () => {
    try {
      console.log('🔄 Fetching orders...');
      // First, fetch all orders
      const { data: orders, error: ordersError } = await supabase.from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('❌ Error fetching orders:', ordersError);
        return;
      }

      if (!orders || orders.length === 0) {
        console.log('📭 No orders found');
        useAppStore.getState().setOrders([]);
        return;
      }

      console.log('📦 Found', orders.length, 'order(s), fetching items...');

      // Then fetch all order_items for these orders
      const orderIds = orders.map(o => o.id);
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) {
        console.error('❌ Error fetching order items:', itemsError);
        // Still set orders even if items fetch fails
        useAppStore.getState().setOrders(orders);
        return;
      }

      console.log('📦 Found', items?.length || 0, 'order item(s)');

      // Attach order_items to each order
      const ordersWithItems = orders.map(order => ({
        ...order,
        order_items: (items || []).filter(item => item.order_id === order.id)
      }));

      useAppStore.getState().setOrders(ordersWithItems);
      console.log('✅ Orders state updated');
    } catch (err) {
      console.error('❌ Failed to fetch orders:', err);
    }
  };
  
  await fetchOrders();
  await useAppStore.getState().fetchStoreStatus();
  
  console.log('✅ Supabase connected, setting up realtime listeners...');

  // Create a single channel for all realtime subscriptions
  const channel = supabase.channel('grocery-app-realtime');

  // Orders real-time with intelligent updates
  channel
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'orders' }, 
      async (payload) => {
        console.log('🔔 Order change detected:', payload.eventType, payload.new);
        
        const eventType = payload.eventType;
        const newOrder = payload.new;
        const oldOrder = payload.old;

        if (eventType === 'INSERT') {
          // New order inserted - fetch with items
          console.log('🆕 New order inserted, fetching with items...');
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', newOrder.id);
          
          const orderWithItems = { ...newOrder, order_items: items || [] };
          
          set(state => {
            const exists = state.orders.find(o => o.id === newOrder.id);
            if (exists) return state; // Already exists
            return { orders: [orderWithItems, ...state.orders] };
          });
        } 
        else if (eventType === 'UPDATE') {
          // Order updated - merge changes
          console.log('📝 Order updated, merging changes...');
          
          set(state => {
            const updatedOrders = state.orders.map(order => {
              if (order.id === newOrder.id) {
                // Merge the update, preserving order_items
                return { ...order, ...newOrder, order_items: order.order_items || [] };
              }
              return order;
            });
            return { orders: updatedOrders };
          });
        }
        else if (eventType === 'DELETE') {
          // Order deleted
          console.log('🗑️ Order deleted');
          set(state => ({
            orders: state.orders.filter(o => o.id !== oldOrder.id)
          }));
        }
      }
    )
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'order_items' }, 
      async (payload) => {
        console.log('🔔 Order item change detected:', payload.eventType);
        
        // Refresh the affected order
        if (payload.new?.order_id || payload.old?.order_id) {
          const orderId = payload.new?.order_id || payload.old?.order_id;
          console.log('🔄 Refreshing order items for order:', orderId);
          
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);
          
          set(state => {
            const updatedOrders = state.orders.map(order => {
              if (order.id === orderId) {
                return { ...order, order_items: items || [] };
              }
              return order;
            });
            return { orders: updatedOrders };
          });
        }
      }
    )
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'products' }, 
      async () => {
        console.log('🔔 Products changed, refreshing...');
        const { data: updatedProducts } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (updatedProducts) useAppStore.getState().setProducts(updatedProducts);
      }
    )
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'settings' }, 
      async () => {
        console.log('🔔 Settings changed, refreshing store status...');
        await useAppStore.getState().fetchStoreStatus();
      }
    )
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'categories' }, 
      async () => {
        console.log('🔔 Categories changed, refreshing...');
        const { data: updatedCats } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
        if (updatedCats) useAppStore.getState().setDbCategories(updatedCats);
      }
    )
    .subscribe((status) => {
      console.log('📡 Realtime subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ All realtime listeners active');
      }
      if (status === 'CHANNEL_ERROR') {
        console.error('❌ Realtime channel error');
      }
    });

  // Store channel reference for cleanup
  useAppStore.getState().setRealtimeChannel(channel);
};
