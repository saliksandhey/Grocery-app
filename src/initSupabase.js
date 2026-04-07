import { supabase } from './supabaseClient';

const initialProducts = [
  { name: 'Aashirvaad Shudh Chakki Atta', price: 240, orig_price: 280, weight: '5 kg', image_url: 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?w=500&q=80', category: 'Atta & Dals', stock: 50 },
  { name: 'India Gate Basmati Rice', price: 450, orig_price: 500, weight: '5 kg', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80', category: 'Rice', stock: 30 },
  { name: 'Fortune Sunlite Refined Sunflower Oil', price: 145, orig_price: 160, weight: '1 L', image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80', category: 'Oil & Ghee', stock: 100 },
  { name: "Lays India's Magic Masala", price: 20, orig_price: 20, weight: '50 g', image_url: 'https://images.unsplash.com/photo-1566478989037-e50e96ce0ffc?w=500&q=80', category: 'Snacks', stock: 150 },
  { name: 'Coca-Cola Original Taste', price: 40, orig_price: 40, weight: '750 ml', image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', category: 'Beverages', stock: 80 },
];

export async function initializeDatabase() {
  console.log('Checking database status...');
  
  // 1. Check Products
  const { data: prods } = await supabase.from('products').select('*').limit(1);
  if (!prods || prods.length === 0) {
    console.log('Seeding products...');
    await supabase.from('products').insert(initialProducts);
  }

  // 2. Check Drivers
  const { data: drivers } = await supabase.from('profiles').select('*').eq('role', 'delivery_boy');
  if (!drivers || drivers.length === 0) {
    console.log('Seeding driver accounts via Auth signup...');
    
    // We will create two default drivers using Auth signUp so that they exist in auth.users
    const driversToCreate = [
      { email: 'raju@malerkotla.app', name: 'Raju Kumar', phone: '9876543211' },
      { email: 'sandeep@malerkotla.app', name: 'Sandeep Singh', phone: '9876543212' }
    ];

    for (const d of driversToCreate) {
      const { data, error } = await supabase.auth.signUp({
        email: d.email,
        password: 'securepassword123',
      });
      if (data?.user) {
        // Insert into profiles
        await supabase.from('profiles').insert({
          id: data.user.id,
          role: 'delivery_boy',
          name: d.name,
          phone: d.phone,
          status: 'available'
        });
      }
    }
    // Logout after creating drivers so it doesn't leave the current user as a driver
    await supabase.auth.signOut();
  }
}
