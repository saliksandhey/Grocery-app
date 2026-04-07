import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabaseClient';

export const categories = [
  { id: 'atta', name: 'Atta & Dals', icon: '🌾' },
  { id: 'rice', name: 'Rice', icon: '🍚' },
  { id: 'oil', name: 'Oil & Ghee', icon: '🛢️' },
  { id: 'snacks', name: 'Snacks', icon: '🥨' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' }
];

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
      
      setProducts: (products) => set({ products }),
      setOrders: (orders) => set({ orders }),
      setDeliveryBoys: (deliveryBoys) => set({ deliveryBoys }),
      setDbCategories: (dbCategories) => set({ dbCategories }),
      
      placeOrder: async (orderData) => {
        if (!get().isStoreOpen) return null; // Enforce Store Closed rule globally
        // 1. Insert Order
        const { error: orderError, data: order } = await supabase.from('orders').insert({
          customer_details: orderData.customer,
          status: 'Pending',
          item_total: orderData.summary.itemTotal,
          delivery_charge: orderData.summary.deliveryCharge,
          grand_total: orderData.summary.grandTotal,
          payment_method: orderData.paymentMethod
        }).select().single();
        
        if (!orderError && order) {
           // 2. Insert Items
           const itemsToInsert = orderData.items.map(item => ({
              order_id: order.id,
              product_id: item.id,
              quantity: item.qty,
              price: item.price
           }));
           await supabase.from('order_items').insert(itemsToInsert);

           get().clearCart();
           
           // Mock it immediately for UI. A full refresh will give the relational data!
           const newOrderForState = {
             ...order,
             order_items: orderData.items.map(i => ({ quantity: i.qty, product: { name: i.name, image_url: i.image_url || i.image } }))
           };
           set(state => ({ orders: [newOrderForState, ...state.orders] }));
           return newOrderForState;
        }
        return null;
      },
      
      updateOrderStatus: async (orderId, newStatus, role = 'admin') => {
        // Allowed forward-only transition chain
        const CHAIN = [
          'Pending', 'Packed', 'Out for Delivery', 'Delivered'
        ];
        const TERMINAL = ['Delivered', 'Cancelled'];

        const currentOrder = get().orders.find(o => o.id === orderId);
        if (!currentOrder) return { error: 'Order not found' };
        
        const currentStatus = currentOrder.status;

        // Guard: terminal states are immutable
        if (TERMINAL.includes(currentStatus)) {
          return { error: `Order is already "${currentStatus}" and cannot be changed.` };
        }

        // Role-based validations
        const isAssigned = !!currentOrder.delivery_boy_id;
        if (role === 'admin' && isAssigned && newStatus !== 'Cancelled') {
          return { error: 'Admin cannot update status after assigning a delivery partner.' };
        }
        if (role === 'delivery' && !isAssigned) {
          return { error: 'Order must be assigned before updating status.' };
        }

        // Guard: Cancelled can only be set from Pending
        if (newStatus === 'Cancelled' && currentStatus !== 'Pending') {
          return { error: 'Only Pending orders can be cancelled.' };
        }

        // Guard: enforce forward-only chain (non-cancel transitions)
        if (newStatus !== 'Cancelled') {
          const fromIdx = CHAIN.indexOf(currentStatus);
          const toIdx   = CHAIN.indexOf(newStatus);
          if (toIdx === -1) {
            return { error: `Unknown status: "${newStatus}"` };
          }
          if (toIdx !== fromIdx + 1) {
            return { error: `Cannot move from "${currentStatus}" to "${newStatus}". Follow the correct order.` };
          }
        }

        // Valid transition — update state + DB
        set(state => ({
          orders: state.orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        }));
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        if (error) return { error: error.message };
        return { error: null };
      },
      
      assignDeliveryBoy: async (orderId, dbId) => {
        set(state => ({
          orders: state.orders.map(o => o.id === orderId ? { ...o, delivery_boy_id: dbId } : o)
        }));
        await supabase.from('orders').update({ delivery_boy_id: dbId }).eq('id', orderId);
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
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (products) useAppStore.getState().setProducts(products);

  const { data: drivers } = await supabase.from('delivery_boys').select('*');
  if (drivers) useAppStore.getState().setDeliveryBoys(drivers);

  const { data: cats } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
  if (cats) useAppStore.getState().setDbCategories(cats);

  // Deep fetch using Supabase relations
  const fetchOrders = async () => {
    const { data: orders } = await supabase.from('orders')
      .select('*, order_items(quantity, price, product:products(name, image_url))')
      .order('created_at', { ascending: false });
    if (orders) useAppStore.getState().setOrders(orders);
  };
  await fetchOrders();
  await useAppStore.getState().fetchStoreStatus();

  supabase.channel('custom-all-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      fetchOrders();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
      const { data: updatedProducts } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (updatedProducts) useAppStore.getState().setProducts(updatedProducts);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, async () => {
      await useAppStore.getState().fetchStoreStatus();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => {
      const { data: updatedCats } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
      if (updatedCats) useAppStore.getState().setDbCategories(updatedCats);
    })
    .subscribe();
};
