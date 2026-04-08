import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Plus, X,
  Edit, Trash2, Tag, TrendingUp, Clock, CheckCircle2,
  Truck, Search, Bell, LogOut, Eye,
  Settings, BarChart2, Menu, AlertCircle, MapPin, Phone, IndianRupee
} from 'lucide-react';
import { supabase } from '../supabaseClient';

/* â"€â"€â"€ constants â"€â"€â"€ */
const statusMeta = {
  PLACED:            { bg: '#FEF3C7', color: '#D97706', dot: '#F59E0B', label: 'Pending' },
  CONFIRMED:         { bg: '#DBEAFE', color: '#2563EB', dot: '#3B82F6', label: 'Confirmed' },
  PACKED:            { bg: '#E9D5FF', color: '#7C3AED', dot: '#A855F7', label: 'Packed' },
  ASSIGNED:          { bg: '#CCFBF1', color: '#0D9488', dot: '#14B8A6', label: 'Assigned' },
  OUT_FOR_DELIVERY:  { bg: '#FFEDD5', color: '#EA580C', dot: '#F97316', label: 'Out for Delivery' },
  DELIVERED:         { bg: '#D1FAE5', color: '#059669', dot: '#22C55E', label: 'Delivered' },
  CANCELLED:         { bg: '#FEE2E2', color: '#DC2626', dot: '#EF4444', label: 'Cancelled' },
};

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'orders',     label: 'Orders',       icon: ShoppingBag },
  { id: 'products',   label: 'Products',     icon: Package },
  { id: 'categories', label: 'Categories',   icon: Tag },
  { id: 'users',      label: 'Users',        icon: Users },
  { id: 'delivery',   label: 'Delivery Boys',icon: Truck },
  { id: 'analytics',  label: 'Analytics',    icon: BarChart2 },
  { id: 'settings',   label: 'Settings',     icon: Settings },
];

/* â”€â”€â”€ sub-components â”€â”€â”€ */
const StatusBadge = ({ status }) => {
  const m = statusMeta[status] || { bg: '#F1F5F9', color: '#64748B', dot: '#64748B' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 10px', borderRadius: '12px',
      background: m.bg, color: m.color,
      fontSize: '0.75rem', fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: m.dot, display: 'inline-block', flexShrink: 0 }} />
      {status}
    </span>
  );
};

const IconBtn = ({ color, onClick, children }) => (
  <button onClick={onClick} style={{
    width: '32px', height: '32px',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: color === 'blue' ? '#DBEAFE' : color === 'red' ? '#FEE2E2' : '#F1F5F9',
    color: color === 'blue' ? '#2563EB' : color === 'red' ? '#DC2626' : '#475569',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    transition: 'all 0.15s', flexShrink: 0,
  }}>{children}</button>
);

const Field = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>
      {label}
    </label>
    {children}
  </div>
);

const mInput = {
  width: '100%', padding: '10px 14px',
  background: '#F9FAFB',
  border: '1px solid #D1D5DB',
  borderRadius: '8px', outline: 'none',
  color: '#111827', fontSize: '0.875rem',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s'
};

/* â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â•  */
export default function Admin() {
  const [activeTab,     setActiveTab]   = useState('dashboard');
  const [drawerOpen,    setDrawerOpen]  = useState(false);
  const [isMobile,      setIsMobile]    = useState(window.innerWidth < 768);
  const [searchQ,       setSearchQ]     = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fn = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setDrawerOpen(false);
    };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const deliveryBoys  = useAppStore(s => s.deliveryBoys);
  const orders        = useAppStore(s => s.orders);
  const products      = useAppStore(s => s.products);
  const dbCategories  = useAppStore(s => s.dbCategories);
  const updateOrderStatus = useAppStore(s => s.updateOrderStatus);
  const assignDeliveryBoy = useAppStore(s => s.assignDeliveryBoy);
  const addProduct        = useAppStore(s => s.addProduct);
  const editProduct       = useAppStore(s => s.editProduct);
  const deleteProduct     = useAppStore(s => s.deleteProduct);
  const addDeliveryBoy    = useAppStore(s => s.addDeliveryBoy);
  const editDeliveryBoy   = useAppStore(s => s.editDeliveryBoy);
  const deleteDeliveryBoy = useAppStore(s => s.deleteDeliveryBoy);
  const addCategory       = useAppStore(s => s.addCategory);
  const editCategory      = useAppStore(s => s.editCategory);
  const deleteCategory    = useAppStore(s => s.deleteCategory);
  const isStoreOpen       = useAppStore(s => s.isStoreOpen);
  const setStoreOpen      = useAppStore(s => s.setStoreOpen);

  /* toast */
  const [toast, setToast] = useState(null);
  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  /* product modal */
  const [isProdOpen,    setProdOpen]      = useState(false);
  const [editingProdId, setEditingProdId] = useState(null);
  const [prodForm,      setProdForm]      = useState({ name:'', price:'', category:'', image_url:'', stock:'', description:'' });
  const [prodFile,      setProdFile]      = useState(null);
  const [prodPreview,   setProdPreview]   = useState('');
  const [prodUploading, setProdUploading] = useState(false);

  const openAddProduct = () => { setEditingProdId(null); setProdForm({ name:'', price:'', category:dbCategories[0]?.name||'', image_url:'', stock:'', description:'' }); setProdFile(null); setProdPreview(''); setProdOpen(true); };
  const openEditProduct = p => { setEditingProdId(p.id); setProdForm({ name:p.name, price:p.price, category:p.category, image_url:p.image_url, stock:p.stock, description:p.description||'' }); setProdFile(null); setProdPreview(p.image_url); setProdOpen(true); };

  const handleSaveProduct = async e => {
    e.preventDefault(); setProdUploading(true);
    let finalUrl = prodForm.image_url;
    if (prodFile) {
      const fname = `${Date.now()}-${prodFile.name}`;
      const { error: upErr } = await supabase.storage.from('product-images').upload(fname, prodFile);
      if (upErr) { showToast('error','Upload failed: '+upErr.message); setProdUploading(false); return; }
      finalUrl = supabase.storage.from('product-images').getPublicUrl(fname).data.publicUrl;
    }
    if (!finalUrl) { showToast('error','Product image is required'); setProdUploading(false); return; }
    const { error } = editingProdId ? await editProduct(editingProdId, {...prodForm, image_url:finalUrl}) : await addProduct({...prodForm, image_url:finalUrl});
    if (error) { showToast('error','Save failed: '+error.message); setProdUploading(false); return; }
    showToast('success', editingProdId ? 'Product updated!' : 'Product added!');
    setProdOpen(false); setProdUploading(false);
  };

  /* category modal */
  const [isCatOpen,    setCatOpen]      = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catForm,      setCatForm]      = useState({ name:'', image_url:'' });
  const [catFile,      setCatFile]      = useState(null);
  const [catPreview,   setCatPreview]   = useState('');
  const [catUploading, setCatUploading] = useState(false);

  const openAddCat  = () => { setEditingCatId(null); setCatForm({name:'',image_url:''}); setCatFile(null); setCatPreview(''); setCatOpen(true); };
  const openEditCat = c  => { setEditingCatId(c.id); setCatForm({name:c.name,image_url:c.image_url}); setCatFile(null); setCatPreview(c.image_url); setCatOpen(true); };

  const handleSaveCat = async e => {
    e.preventDefault(); setCatUploading(true);
    let finalUrl = catForm.image_url;
    if (catFile) {
      const fname = `${Date.now()}-${catFile.name}`;
      const { error: upErr } = await supabase.storage.from('category-images').upload(fname, catFile);
      if (upErr) { showToast('error','Upload failed: '+upErr.message); setCatUploading(false); return; }
      finalUrl = supabase.storage.from('category-images').getPublicUrl(fname).data.publicUrl;
    }
    if (!finalUrl) { showToast('error','Image is required'); setCatUploading(false); return; }
    const { error } = editingCatId ? await editCategory(editingCatId,{name:catForm.name,image_url:finalUrl}) : await addCategory({name:catForm.name,image_url:finalUrl});
    if (error) { showToast('error','Save failed: '+error.message); setCatUploading(false); return; }
    showToast('success', editingCatId ? 'Category updated!' : 'Category added!');
    setCatOpen(false); setCatUploading(false);
  };

  /* driver modal */
  const [isDriverOpen,    setDriverOpen]    = useState(false);
  const [editingDriverId, setEditingDriverId] = useState(null);
  const [driverForm,      setDriverForm]    = useState({ name:'', phone:'', username:'', password:'' });

  const openAddDriver  = () => { setEditingDriverId(null); setDriverForm({name:'',phone:'',username:'',password:''}); setDriverOpen(true); };
  const openEditDriver = db => { setEditingDriverId(db.id); setDriverForm({name:db.name,phone:db.phone,username:db.username,password:db.password}); setDriverOpen(true); };

  const handleSaveDriver = async e => {
    e.preventDefault();
    const { error } = editingDriverId ? await editDeliveryBoy(editingDriverId,driverForm) : await addDeliveryBoy(driverForm);
    if (error) { showToast('error', error.code==='23505' ? 'Username taken' : error.message); return; }
    showToast('success', editingDriverId ? 'Driver updated!' : 'Driver added!');
    setDriverOpen(false);
  };

  /* derived */
  const q = searchQ.toLowerCase();
  const filteredOrders   = orders.filter(o => (o.customer_details?.name||'').toLowerCase().includes(q) || (o.id||'').toLowerCase().includes(q));
  const filteredProducts = products.filter(p => (p.name||'').toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q));
  const pendingCount    = orders.filter(o => o.status === 'Pending').length;
  const deliveredCount  = orders.filter(o => o.status === 'Delivered').length;
  const revenue         = orders.reduce((s, o) => s + (o.grand_total || 0), 0);

  /* nav handler */
  const goTab = (id) => { setActiveTab(id); if (isMobile) setDrawerOpen(false); };

  /* â”€â”€â”€ Sidebar content (shared) â”€â”€â”€ */
  const SidebarContent = () => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ padding:'20px 24px', display:'flex', alignItems:'center', gap:'12px' }}>
        <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#16A34A', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
          <ShoppingBag size={18} />
        </div>
        <div>
          <div style={{ fontSize:'1rem', fontWeight:700, color:'#F9FAFB', lineHeight:1.1 }}>Malerkotla Admin</div>
        </div>
        {isMobile && (
          <button onClick={() => setDrawerOpen(false)} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'#9CA3AF' }}>
            <X size={20} />
          </button>
        )}
      </div>
      
      <div style={{ padding:'0 16px', fontSize:'0.75rem', fontWeight:600, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px' }}>
        Menu
      </div>

      <nav style={{ flex:1, padding:'0 12px', overflowY:'auto' }}>
        {NAV.map(n => {
          const active = activeTab === n.id;
          return (
            <button key={n.id} onClick={() => goTab(n.id)} style={{
              display:'flex', alignItems:'center', gap:'12px',
              width:'100%', padding:'10px 12px', margin:'4px 0',
              borderRadius:'8px', border:'none', cursor:'pointer',
              background: active ? '#1F2937' : 'transparent',
              color: active ? '#10B981' : '#D1D5DB', // green accent
              fontWeight: active ? 600 : 500,
              fontSize:'0.875rem', fontFamily:'inherit',
              textAlign:'left', transition:'all 0.2s',
            }}>
              <n.icon size={18} style={{ flexShrink:0, color: active ? '#10B981' : '#9CA3AF' }} />
              {n.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding:'16px 12px' }}>
        <button style={{ display:'flex', alignItems:'center', gap:'12px', width:'100%', padding:'10px 12px', borderRadius:'8px', border:'none', cursor:'pointer', background:'transparent', color:'#D1D5DB', fontWeight:500, fontSize:'0.875rem', fontFamily:'inherit', transition:'background 0.2s' }}
          onMouseEnter={e=>e.currentTarget.style.background='#1F2937'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          <LogOut size={18} style={{ flexShrink:0, color:'#9CA3AF' }} /> Logout
        </button>
      </div>
    </div>
  );

  /* ─── Action button for orders ─── */
  const OrderAction = ({ order }) => {
    const handleStatus = async (newStatus) => {
      const res = await updateOrderStatus(order.id, newStatus, 'admin');
      if (res && res.error) showToast('error', res.error);
    };

    if (order.delivery_boy_id) {
       if (order.status === 'Delivered') return <span style={{ fontSize:'0.8rem', color:'#059669', display:'flex', alignItems:'center', gap:'6px', fontWeight:500 }}><CheckCircle2 size={14}/> Completed</span>;
       return <span style={{ fontSize:'0.8rem', color:'#4B5563', display:'flex', alignItems:'center', gap:'6px', fontWeight:500 }}><Truck size={14}/> Assigned</span>;
    }

    if (order.status === 'Pending')
      return (
        <div style={{display:'flex', gap:'8px'}}>
          <button onClick={() => handleStatus('Packed')} className="adm-action-btn" style={{ background:'#10B981', color:'white' }}>Accept & Pack</button>
          <button onClick={() => handleStatus('Cancelled')} className="adm-action-btn" style={{ background:'#FEE2E2', color:'#DC2626' }}>Cancel</button>
        </div>
      );
    if (order.status === 'Packed')
      return (
        <select onChange={e => { if(e.target.value) assignDeliveryBoy(order.id, e.target.value); }}
          style={{ padding:'6px 8px', borderRadius:'6px', border:'1px solid #D1D5DB', background:'#F9FAFB', fontSize:'0.8rem', cursor:'pointer' }}>
          <option value="">Assign Rider…</option>
          {deliveryBoys.map(db => <option key={db.id} value={db.id}>{db.name}</option>)}
        </select>
      );
    if (order.status === 'Cancelled')
      return <span style={{ fontSize:'0.8rem', color:'#DC2626', fontWeight:500 }}>Cancelled</span>;
    return null;
  };

  /* ─── Generic Modal ─── */
  const Modal = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
      <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position:'fixed', inset:0, background:'rgba(17, 24, 39, 0.6)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:400, padding:'16px' }}>
        <div style={{ background:'#ffffff', borderRadius:'12px', width:'100%', maxWidth:'500px', maxHeight:'90vh', overflowY:'auto', padding:'24px', boxShadow:'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <h2 style={{ fontWeight:700, fontSize:'1.1rem', color:'#111827' }}>{title}</h2>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#6B7280', display:'flex' }}><X size={20}/></button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  /* ─── Order Detail Modal ─── */
  const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;
    const items = order.order_items || [];
    const isCOD = order.payment_method === 'cod';
    const assignedRider = deliveryBoys.find(d => d.id === order.delivery_boy_id);
    const [localStatus, setLocalStatus] = useState(order.status);
    const [assigning, setAssigning] = useState(false);
    const isTerminal = localStatus === 'DELIVERED' || localStatus === 'CANCELLED';

    const handleStatusChange = async (newStatus) => {
      const res = await updateOrderStatus(order.id, newStatus, 'admin');
      if (res && res.error) {
        showToast('error', res.error);
        setLocalStatus(order.status); // Revert to original
      } else {
        setLocalStatus(newStatus);
        showToast('success', `Status updated to "${newStatus}"`);
      }
    };

    const handleAssign = async (dbId) => {
      if (!dbId) return;
      setAssigning(true);
      await assignDeliveryBoy(order.id, dbId);
      showToast('success', 'Assigned to Delivery Partner 🚚');
      setAssigning(false);
    };

    const statusDetailMeta = {
      'PLACED': { bg:'#FEF3C7', color:'#92400E', dot:'#F59E0B' },
      'CONFIRMED': { bg:'#DBEAFE', color:'#1E40AF', dot:'#3B82F6' },
      'PACKED': { bg:'#E9D5FF', color:'#6B21A8', dot:'#A855F7' },
      'ASSIGNED': { bg:'#CCFBF1', color:'#115E59', dot:'#14B8A6' },
      'OUT_FOR_DELIVERY': { bg:'#FFEDD5', color:'#9A3412', dot:'#F97316' },
      'DELIVERED': { bg:'#DCFCE7', color:'#166534', dot:'#22C55E' },
      'CANCELLED': { bg:'#FEE2E2', color:'#991B1B', dot:'#EF4444' }
    };

    const sm = statusDetailMeta[localStatus] || { bg:'#F1F5F9', color:'#64748B', dot:'#94A3B8' };

    return (
      <div
        onClick={e => e.target === e.currentTarget && onClose()}
        style={{ position:'fixed', inset:0, background:'rgba(17,24,39,0.65)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500, padding:'16px' }}
      >
        <div style={{ background:'#fff', borderRadius:'16px', width:'100%', maxWidth:'620px', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 24px 60px rgba(0,0,0,0.18)', display:'flex', flexDirection:'column' }}>

          {/* Header */}
          <div style={{ padding:'20px 24px', borderBottom:'1px solid #F3F4F6', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff', zIndex:1, borderRadius:'16px 16px 0 0' }}>
            <div>
              <div style={{ fontWeight:800, fontSize:'1.15rem', color:'#111827' }}>Order #{order.id.slice(0,8).toUpperCase()}</div>
              <div style={{ fontSize:'0.78rem', color:'#6B7280', marginTop:'2px' }}>
                {order.created_at ? new Date(order.created_at).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' }) : 'Date not available'}
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'6px 12px', borderRadius:'20px', background:sm.bg, color:sm.color, fontSize:'0.8rem', fontWeight:700 }}>
                <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:sm.dot, display:'inline-block' }} />
                {localStatus}
              </span>
              <button onClick={onClose} style={{ background:'#F3F4F6', border:'none', borderRadius:'8px', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#6B7280' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:'20px' }}>

            {/* Customer Info */}
            <div style={{ background:'#F8FAFC', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'16px' }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'12px' }}>Customer Details</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#E0E7FF', color:'#4F46E5', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1rem', flexShrink:0 }}>
                    {(order.customer_details?.name||'?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, color:'#111827', fontSize:'0.95rem' }}>{order.customer_details?.name || 'Unknown'}</div>
                    <div style={{ fontSize:'0.78rem', color:'#6B7280' }}>{order.customer_details?.phone || 'No phone'}</div>
                  </div>
                </div>
                {order.customer_details?.address && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'8px', paddingTop:'8px', borderTop:'1px solid #E5E7EB' }}>
                    <MapPin size={16} color='#F59E0B' style={{ marginTop:'2px', flexShrink:0 }} />
                    <span style={{ fontSize:'0.875rem', color:'#374151', lineHeight:1.5 }}>{order.customer_details.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <div style={{ fontWeight:700, fontSize:'1rem', color:'#111827', marginBottom:'12px' }}>Ordered Items</div>
              <div style={{ border:'1px solid #E5E7EB', borderRadius:'12px', overflow:'hidden' }}>
                {items.length === 0 && (
                  <div style={{ padding:'24px', textAlign:'center', color:'#9CA3AF', fontSize:'0.875rem' }}>No item details available</div>
                )}
                {items.map((item, idx) => {
                  const name  = item.product_name || item.product?.name || 'Unknown Product';
                  const img   = item.image_url || item.product?.image_url || '';
                  const price = item.price || 0;
                  const qty   = item.quantity || 1;
                  const total = price * qty;
                  return (
                    <div key={idx} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', borderBottom: idx < items.length-1 ? '1px solid #F3F4F6' : 'none', background: idx%2===0 ? '#fff' : '#FAFAFA' }}>
                      {/* Product image */}
                      <div style={{ width:'52px', height:'52px', borderRadius:'10px', overflow:'hidden', border:'1px solid #E5E7EB', flexShrink:0, background:'#F3F4F6' }}>
                        {img ? <img src={img} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>🛒</div>}
                      </div>
                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, color:'#111827', fontSize:'0.9rem', marginBottom:'3px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{name}</div>
                        <div style={{ fontSize:'0.78rem', color:'#6B7280' }}>₹{price} × {qty}</div>
                      </div>
                      {/* Line total */}
                      <div style={{ fontWeight:800, color:'#111827', fontSize:'0.95rem', whiteSpace:'nowrap' }}>
                        ₹{total}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div style={{ background:'#F8FAFC', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'16px' }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'12px' }}>Order Summary</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.875rem', color:'#374151' }}>
                  <span>Subtotal</span><span>₹{order.item_total ?? order.grand_total}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.875rem', color:'#374151' }}>
                  <span>Delivery Fee</span><span>{(order.delivery_charge||0) === 0 ? <span style={{color:'#059669',fontWeight:600}}>Free</span> : `₹${order.delivery_charge}`}</span>
                </div>
                <div style={{ height:'1px', background:'#E5E7EB', margin:'4px 0' }} />
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'1.05rem', fontWeight:800, color:'#111827' }}>
                  <span>Total</span>
                  <span style={{ color:'#059669' }}>₹{order.grand_total}</span>
                </div>
                <div style={{ marginTop:'4px' }}>
                  <span style={{ fontSize:'0.75rem', fontWeight:700, padding:'4px 10px', borderRadius:'20px', background: isCOD ? '#FEF2F2' : '#F0FDF4', color: isCOD ? '#DC2626' : '#059669' }}>
                    {isCOD ? '💵 Cash on Delivery' : '✅ Prepaid'}
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Actions */}
            <div style={{ background:'#F8FAFC', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'16px' }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'12px' }}>Update Status</div>
              {assignedRider ? (
                <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'12px', background:'#F3F4F6', borderRadius:'8px', color:'#374151', fontSize:'0.875rem', fontWeight:600 }}>
                  <Truck size={18} color="#10B981" /> Assigned to Delivery Partner 🚚
                </div>
              ) : (
                <>
                  <select
                    value={localStatus}
                    onChange={e => handleStatusChange(e.target.value)}
                    disabled={isTerminal}
                    style={{ width:'100%', padding:'10px 14px', border:'1px solid #D1D5DB', borderRadius:'8px', background: isTerminal ? '#F3F4F6' : '#fff', color: isTerminal ? '#9CA3AF' : '#111827', fontSize:'0.875rem', fontFamily:'inherit', cursor: isTerminal ? 'not-allowed' : 'pointer', marginBottom:'14px', opacity: isTerminal ? 1 : 1 }}
                  >
                    {Object.keys(statusMeta).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  {/* Quick action buttons */}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                    {localStatus === 'PLACED' && (
                      <button onClick={() => handleStatusChange('CONFIRMED')} style={{ flex:'1 1 auto', padding:'10px 16px', background:'#10B981', color:'white', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'0.875rem' }}>✓ Accept Order</button>
                    )}
                    {localStatus === 'PLACED' && (
                      <button onClick={() => handleStatusChange('CANCELLED')} style={{ flex:'1 1 auto', padding:'10px 16px', background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'0.875rem' }}>✕ Cancel</button>
                    )}
                    {localStatus === 'CONFIRMED' && (
                      <button onClick={() => handleStatusChange('PACKED')} style={{ flex:'1 1 auto', padding:'10px 16px', background:'#7C3AED', color:'white', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'0.875rem' }}>📦 Mark as Packed</button>
                    )}
                  </div>
                </>
              )}

              {/* Assign rider */}
              {!assignedRider && localStatus === 'PACKED' && (
                <div style={{ marginTop:'14px', paddingTop:'14px', borderTop:'1px solid #E5E7EB' }}>
                  <div style={{ fontSize:'0.8rem', fontWeight:600, color:'#374151', marginBottom:'8px', display:'flex', alignItems:'center', gap:'6px' }}>
                    <Truck size={14} /> Assign Delivery Boy
                  </div>
                  <select
                    defaultValue={order.delivery_boy_id || ''}
                    onChange={e => handleAssign(e.target.value)}
                    disabled={assigning}
                    style={{ width:'100%', padding:'10px 14px', border:'1px solid #D1D5DB', borderRadius:'8px', background:'#fff', color:'#111827', fontSize:'0.875rem', fontFamily:'inherit', cursor:'pointer' }}
                  >
                    <option value=''>Select Rider…</option>
                    {deliveryBoys.map(db => <option key={db.id} value={db.id}>{db.name} – {db.phone}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SaveBtn = ({ loading, label, editLabel }) => (
    <button type="submit" disabled={loading} style={{ flex:1, padding:'10px', background:'#16A34A', color:'white', border:'none', borderRadius:'8px', fontWeight:600, fontSize:'0.875rem', cursor:loading?'not-allowed':'pointer', transition:'background 0.2s', fontFamily:'inherit' }}>
      {loading ? 'Saving...' : (editLabel || label)}
    </button>
  );
  const CancelBtn = ({ onClick }) => (
    <button type="button" onClick={onClick} style={{ flex:1, padding:'10px', background:'#F3F4F6', color:'#374151', border:'1px solid #D1D5DB', borderRadius:'8px', fontWeight:600, fontSize:'0.875rem', cursor:'pointer', fontFamily:'inherit' }}>
      Cancel
    </button>
  );

  return (
    <div className="adm-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }

        .adm-root {
          display: flex; min-height: 100vh; width: 100%;
          background: #F9FAFB;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .adm-sidebar {
          width: 240px; flex-shrink: 0;
          background: #111827;
          border-right: 1px solid #1F2937;
          height: 100vh; position: sticky; top: 0;
          overflow: hidden;
        }
        .adm-drawer-overlay {
          display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200;
        }
        .adm-drawer {
          position: fixed; top: 0; left: 0; width: 260px; height: 100vh;
          background: #111827; z-index: 201; transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
        }
        .adm-drawer.open { transform: translateX(0); }
        .adm-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

        .adm-topbar {
          display: flex; align-items: center; justify-content: space-between;
          height: 60px; padding: 0 24px;
          background: #ffffff;
          border-bottom: 1px solid #E5E7EB;
          position: sticky; top: 0; z-index: 50;
          gap: 12px;
        }
        .adm-search {
          display: flex; align-items: center; gap: 8px;
          background: #F3F4F6;
          border-radius: 8px; padding: 8px 12px;
          flex: 1; max-width: 320px;
        }
        .adm-search input {
          background: none; border: none; outline: none; width: 100%;
          font-size: 0.875rem; color: #111827; font-family: inherit;
        }
        /* Mobile inline search below topbar */
        .adm-mobile-search {
          display: none;
          padding: 10px 16px;
          background: #fff;
          border-bottom: 1px solid #E5E7EB;
        }
        .adm-mobile-search-inner {
          display: flex; align-items: center; gap: 8px;
          background: #F3F4F6; border-radius: 8px; padding: 10px 14px;
        }
        .adm-mobile-search-inner input {
          background: none; border: none; outline: none; width: 100%;
          font-size: 0.875rem; color: #111827; font-family: inherit;
        }

        .adm-content { flex: 1; padding: 24px; overflow-y: auto; color: #111827; }
        .adm-page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .adm-title { font-size: 1.4rem; font-weight: 700; color: #111827; letter-spacing: -0.02em; }

        /* Stat grid */
        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
        .stat-card {
          background: #ffffff; border-radius: 12px; padding: 20px;
          border: 1px solid #E5E7EB; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .chart-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px; }

        /* Table */
        .adm-table-wrap {
          background: #ffffff; border-radius: 12px; border: 1px solid #E5E7EB;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03); overflow: hidden;
        }
        .adm-table { width: 100%; border-collapse: collapse; text-align: left; }
        .adm-th { padding: 14px 20px; font-size: 0.75rem; font-weight: 600; color: #6B7280; text-transform: uppercase; border-bottom: 1px solid #E5E7EB; background: #F9FAFB; white-space: nowrap; }
        .adm-td { padding: 14px 20px; font-size: 0.875rem; color: #374151; border-bottom: 1px solid #F3F4F6; }
        .adm-tr:last-child .adm-td { border-bottom: none; }
        .adm-tr:hover .adm-td { background: #F9FAFB; }
        .adm-action-btn { padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; border: none; white-space: nowrap; }

        /* Mobile card list for tables */
        .adm-card-list { display: none; flex-direction: column; gap: 12px; }
        .adm-mobile-card {
          background: #fff; border: 1px solid #E5E7EB; border-radius: 12px;
          padding: 16px; display: flex; flex-direction: column; gap: 10px;
        }
        .adm-mc-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
        .adm-mc-label { font-size: 0.72rem; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
        .adm-mc-val { font-size: 0.875rem; color: #111827; font-weight: 500; }
        .adm-mc-actions { display: flex; gap: 8px; margin-top: 4px; }

        /* 1280px+ */
        @media (min-width: 1280px) {
          .stat-grid { grid-template-columns: repeat(4, 1fr); }
        }
        /* 1024px */
        @media (max-width: 1024px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .chart-grid { grid-template-columns: 1fr; }
        }
        /* 768px */
        @media (max-width: 768px) {
          .adm-sidebar { display: none; }
          .adm-drawer-overlay.open { display: block; }
          .adm-content { padding: 16px; }
          .adm-topbar { padding: 0 16px; }
          .stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .stat-card { padding: 14px; }
          .adm-search { display: none; }
          .adm-mobile-search { display: block; }
          /* Hide table, show cards */
          .adm-table-wrap .adm-table-scroll { display: none; }
          .adm-card-list { display: flex; }
          .adm-title { font-size: 1.2rem; }
          .chart-grid { gap: 12px; }
        }
        /* 480px */
        @media (max-width: 480px) {
          .stat-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
          .stat-card { padding: 12px; }
          .adm-content { padding: 12px; }
          .adm-page-header { margin-bottom: 16px; }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="adm-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <div className={`adm-drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`adm-drawer ${drawerOpen ? 'open' : ''}`}>
        <SidebarContent />
      </div>

      <div className="adm-main">
        {/* Top Header */}
        <header className="adm-topbar">
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
            {isMobile && (
              <button onClick={() => setDrawerOpen(true)} style={{ background:'none', border:'none', cursor:'pointer' }}>
                <Menu size={24} color="#374151" />
              </button>
            )}
            {!isMobile && <div className="adm-title" style={{ fontSize:'1.1rem' }}>{NAV.find(n=>n.id===activeTab)?.label || 'Admin'}</div>}
          </div>

          <div className="adm-search">
            <Search size={16} color="#9CA3AF" />
            <input placeholder="Search orders, products..." value={searchQ} onChange={e=>setSearchQ(e.target.value)} />
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
            <button style={{ background:'none', border:'none', color:'#6B7280', cursor:'pointer', position:'relative' }}>
              <Bell size={20} />
              <div style={{ position:'absolute', top:'-2px', right:'-2px', width:'8px', height:'8px', background:'#EF4444', borderRadius:'50%' }} />
            </button>
            <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, color:'#374151', cursor:'pointer' }}>
              A
            </div>
          </div>
        </header>

        {/* Mobile search bar */}
        <div className="adm-mobile-search">
          <div className="adm-mobile-search-inner">
            <Search size={16} color="#9CA3AF" />
            <input placeholder="Search orders, products..." value={searchQ} onChange={e=>setSearchQ(e.target.value)} />
          </div>
        </div>

        <div className="adm-content">

          {/* Toast Notification */}
          {toast && (
            <div style={{ padding:'12px 16px', borderRadius:'8px', marginBottom:'20px', background: toast.type==='success' ? '#ECFDF5' : '#FEF2F2', border:`1px solid ${toast.type==='success' ? '#A7F3D0' : '#FECACA'}`, color: toast.type==='success' ? '#059669' : '#DC2626', fontWeight:500, fontSize:'0.875rem', display:'flex', alignItems:'center', gap:'8px' }}>
              {toast.type==='success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>} {toast.msg}
            </div>
          )}

          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="adm-page-header">
                <div className="adm-title">Dashboard Overview</div>
              </div>

              {/* Stats Grid */}
              <div className="stat-grid">
                {[
                  { title: 'Total Orders', value: orders.length, icon: ShoppingBag, color: '#3B82F6', bg: '#DBEAFE' },
                  { title: 'Total Revenue', value: `₹${revenue}`, icon: TrendingUp, color: '#10B981', bg: '#D1FAE5' },
                  { title: 'Active Users', value: '142', icon: Users, color: '#8B5CF6', bg: '#EDE9FE' },
                  { title: 'Pending Deliveries', value: pendingCount, icon: Clock, color: '#F59E0B', bg: '#FEF3C7' }
                ].map(stat => (
                  <div key={stat.title} className="stat-card">
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
                      <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#6B7280' }}>{stat.title}</div>
                      <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:stat.bg, color:stat.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <stat.icon size={16} />
                      </div>
                    </div>
                    <div style={{ fontSize:'1.75rem', fontWeight:800, color:'#111827' }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Charts area */}
              <div className="chart-grid">
                <div className="stat-card" style={{ minHeight:'300px' }}>
                  <div style={{ fontSize:'1rem', fontWeight:700, color:'#111827', marginBottom:'20px' }}>Sales Chart</div>
                  {/* Fake SVG Line Graph */}
                  <div style={{ width:'100%', height:'220px', position:'relative', borderBottom:'1px solid #E5E7EB', borderLeft:'1px solid #E5E7EB' }}>
                    <svg viewBox="0 0 500 200" preserveAspectRatio="none" style={{ width:'100%', height:'100%', overflow:'visible' }}>
                      <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path d="M0,180 L50,150 L100,160 L150,100 L200,120 L250,60 L300,90 L350,40 L400,60 L450,20 L500,40 L500,200 L0,200 Z" fill="url(#lineGrad)" />
                      <polyline points="0,180 50,150 100,160 150,100 200,120 250,60 300,90 350,40 400,60 450,20 500,40" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                <div className="stat-card" style={{ minHeight:'300px' }}>
                  <div style={{ fontSize:'1rem', fontWeight:700, color:'#111827', marginBottom:'20px' }}>Orders Overview</div>
                  {/* Fake Bar Chart */}
                  <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', height:'220px', gap:'8px' }}>
                     {[40, 70, 45, 90, 60, 100, 80].map((h, i) => (
                       <div key={i} style={{ width:'12%', height:`${h}%`, background: i===5 ? '#10B981' : '#E5E7EB', borderRadius:'4px 4px 0 0' }} />
                     ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {activeTab === 'orders' && (
            <div>
              <div className="adm-page-header">
                <div className="adm-title">Orders Management</div>
                <div style={{ fontSize:'0.85rem', color:'#6B7280', fontWeight:500 }}>{filteredOrders.length} order{filteredOrders.length!==1?'s':''}</div>
              </div>
              <div className="adm-table-wrap">
                {/* Desktop table */}
                <div className="adm-table-scroll" style={{ overflowX:'auto' }}>
                  <table className="adm-table">
                     <thead>
                       <tr>
                         <th className="adm-th">Order ID</th>
                         <th className="adm-th">Items</th>
                         <th className="adm-th">Customer</th>
                         <th className="adm-th">Amount</th>
                         <th className="adm-th">Status</th>
                         <th className="adm-th">Action</th>
                       </tr>
                     </thead>
                     <tbody>
                       {filteredOrders.length===0 && <tr><td colSpan="6" className="adm-td" style={{textAlign:'center', padding:'32px', color:'#6B7280'}}>No orders found</td></tr>}
                       {filteredOrders.map(o => {
                         const items = o.order_items || [];
                         const previewImgs = items.slice(0,2).map(i => i.product?.image_url).filter(Boolean);
                         const extra = items.length - 2;
                         return (
                           <tr className="adm-tr" key={o.id} style={{ cursor:'pointer' }} onClick={() => setSelectedOrder(o)}>
                             <td className="adm-td">
                               <div style={{ fontWeight:700, color:'#111827' }}>#{o.id.slice(0,6).toUpperCase()}</div>
                               <div style={{ fontSize:'0.72rem', color:'#9CA3AF', marginTop:'2px' }}>
                                 {o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : ''}
                               </div>
                             </td>
                             {/* Items Preview */}
                             <td className="adm-td">
                               <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                                 <div style={{ display:'flex' }}>
                                   {previewImgs.map((img, idx) => (
                                     <div key={idx} style={{ width:'32px', height:'32px', borderRadius:'8px', overflow:'hidden', border:'2px solid #fff', marginLeft: idx>0 ? '-10px' : '0', boxShadow:'0 1px 3px rgba(0,0,0,0.12)', flexShrink:0 }}>
                                       <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                                     </div>
                                   ))}
                                   {previewImgs.length === 0 && (
                                     <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>🛒</div>
                                   )}
                                 </div>
                                 <div style={{ fontSize:'0.75rem', color:'#6B7280' }}>
                                   {items.length} item{items.length!==1?'s':''}
                                   {extra > 0 && <span style={{ color:'#10B981', fontWeight:600 }}> +{extra}</span>}
                                 </div>
                               </div>
                             </td>
                             <td className="adm-td">
                               <div style={{ fontWeight:600, color:'#111827', fontSize:'0.875rem' }}>{o.customer_details?.name || 'Unknown'}</div>
                               <div style={{ fontSize:'0.72rem', color:'#6B7280' }}>{o.customer_details?.phone}</div>
                             </td>
                             <td className="adm-td">
                               <div style={{ fontWeight:700, color:'#111827' }}>₹{o.grand_total}</div>
                               <div style={{ fontSize:'0.72rem', marginTop:'2px' }}>
                                 <span style={{ background: o.payment_method==='cod' ? '#FEF2F2' : '#F0FDF4', color: o.payment_method==='cod' ? '#DC2626' : '#059669', padding:'2px 6px', borderRadius:'4px', fontWeight:600, fontSize:'0.68rem' }}>
                                   {o.payment_method==='cod' ? 'COD' : 'PAID'}
                                 </span>
                               </div>
                             </td>
                             <td className="adm-td"><StatusBadge status={o.status} /></td>
                             <td className="adm-td" onClick={e => e.stopPropagation()}>
                               <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
                                 <button
                                   onClick={() => setSelectedOrder(o)}
                                   style={{ display:'flex', alignItems:'center', gap:'4px', padding:'6px 10px', background:'#EFF6FF', color:'#2563EB', border:'none', borderRadius:'6px', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}
                                 >
                                   <Eye size={13} /> View
                                 </button>
                                 <OrderAction order={o} />
                               </div>
                             </td>
                           </tr>
                         );
                       })}
                     </tbody>
                  </table>
                </div>
                {/* Mobile card list */}
                <div className="adm-card-list" style={{ padding:'12px' }}>
                  {filteredOrders.length===0 && <div style={{textAlign:'center',padding:'32px',color:'#6B7280'}}>No orders found</div>}
                  {filteredOrders.map(o => {
                    const items = o.order_items || [];
                    const previewImgs = items.slice(0,3).map(i => i.product?.image_url).filter(Boolean);
                    return (
                      <div className="adm-mobile-card" key={o.id}>
                        <div className="adm-mc-row">
                          <div>
                            <div className="adm-mc-label">Order ID</div>
                            <div className="adm-mc-val" style={{fontWeight:700,color:'#111827'}}>#{o.id.slice(0,6).toUpperCase()}</div>
                          </div>
                          <StatusBadge status={o.status} />
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 0', borderTop:'1px solid #F3F4F6', borderBottom:'1px solid #F3F4F6' }}>
                          <div style={{ display:'flex' }}>
                            {previewImgs.map((img,idx) => (
                              <div key={idx} style={{ width:'34px', height:'34px', borderRadius:'8px', overflow:'hidden', border:'2px solid #fff', marginLeft:idx>0?'-10px':'0', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', flexShrink:0 }}>
                                <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                              </div>
                            ))}
                            {previewImgs.length===0 && <div style={{ width:'34px', height:'34px', borderRadius:'8px', background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center' }}>🛒</div>}
                          </div>
                          <span style={{ fontSize:'0.8rem', color:'#6B7280', fontWeight:500 }}>{items.length} item{items.length!==1?'s':''}</span>
                        </div>
                        <div>
                          <div className="adm-mc-label">Customer</div>
                          <div className="adm-mc-val" style={{fontWeight:600}}>{o.customer_details?.name || 'Unknown'}</div>
                          <div style={{fontSize:'0.78rem',color:'#6B7280'}}>{o.customer_details?.phone}</div>
                        </div>
                        <div className="adm-mc-row">
                          <div>
                            <div className="adm-mc-label">Amount</div>
                            <div className="adm-mc-val" style={{fontWeight:700,color:'#059669'}}>₹{o.grand_total}</div>
                          </div>
                          <button
                            onClick={() => setSelectedOrder(o)}
                            style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', background:'#EFF6FF', color:'#2563EB', border:'none', borderRadius:'8px', fontSize:'0.8rem', fontWeight:700, cursor:'pointer' }}
                          >
                            <Eye size={14} /> View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}

          {/* ── PRODUCTS ── */}
          {activeTab === 'products' && (
            <div>
              <div className="adm-page-header">
                <div className="adm-title">Product Catalog</div>
                <button onClick={openAddProduct} style={{ padding:'10px 16px', background:'#111827', color:'white', border:'none', borderRadius:'8px', fontWeight:600, display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}>
                  <Plus size={16}/> Add Product
                </button>
              </div>
              <div className="adm-table-wrap">
                {/* Desktop table */}
                <div className="adm-table-scroll" style={{ overflowX:'auto' }}>
                  <table className="adm-table">
                     <thead>
                       <tr>
                         <th className="adm-th" style={{ width:'60px' }}>Image</th>
                         <th className="adm-th">Product Name</th>
                         <th className="adm-th">Category</th>
                         <th className="adm-th">Price</th>
                         <th className="adm-th">Stock</th>
                         <th className="adm-th">Actions</th>
                       </tr>
                     </thead>
                     <tbody>
                       {filteredProducts.length===0 && <tr><td colSpan="6" className="adm-td" style={{textAlign:'center', padding:'32px', color:'#6B7280'}}>No products</td></tr>}
                       {filteredProducts.map(p => (
                         <tr className="adm-tr" key={p.id}>
                           <td className="adm-td">
                             <img src={p.image_url} alt="" style={{ width:'40px', height:'40px', borderRadius:'6px', objectFit:'cover', border:'1px solid #E5E7EB' }} />
                           </td>
                           <td className="adm-td" style={{ fontWeight:500, color:'#111827' }}>{p.name}</td>
                           <td className="adm-td">
                             <span style={{ background:'#F3F4F6', color:'#4B5563', padding:'4px 8px', borderRadius:'6px', fontSize:'0.75rem', fontWeight:500 }}>{p.category}</span>
                           </td>
                           <td className="adm-td" style={{ fontWeight:600 }}>₹{p.price}</td>
                           <td className="adm-td" style={{ color: p.stock < 10 ? '#DC2626' : '#059669', fontWeight:600 }}>{p.stock}</td>
                           <td className="adm-td">
                             <div style={{ display:'flex', gap:'8px' }}>
                               <IconBtn color="blue" onClick={()=>openEditProduct(p)}><Edit size={14}/></IconBtn>
                               <IconBtn color="red" onClick={()=>deleteProduct(p.id)}><Trash2 size={14}/></IconBtn>
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                  </table>
                </div>
                {/* Mobile card list */}
                <div className="adm-card-list" style={{ padding:'12px' }}>
                  {filteredProducts.length===0 && <div style={{textAlign:'center',padding:'32px',color:'#6B7280'}}>No products</div>}
                  {filteredProducts.map(p => (
                    <div className="adm-mobile-card" key={p.id}>
                      <div className="adm-mc-row">
                        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                          <img src={p.image_url} alt="" style={{width:'48px',height:'48px',borderRadius:'8px',objectFit:'cover',border:'1px solid #E5E7EB'}} />
                          <div>
                            <div className="adm-mc-val" style={{fontWeight:600}}>{p.name}</div>
                            <span style={{background:'#F3F4F6',color:'#4B5563',padding:'2px 8px',borderRadius:'6px',fontSize:'0.72rem',fontWeight:500}}>{p.category}</span>
                          </div>
                        </div>
                        <div className="adm-mc-actions">
                          <IconBtn color="blue" onClick={()=>openEditProduct(p)}><Edit size={14}/></IconBtn>
                          <IconBtn color="red" onClick={()=>deleteProduct(p.id)}><Trash2 size={14}/></IconBtn>
                        </div>
                      </div>
                      <div className="adm-mc-row" style={{paddingTop:'4px',borderTop:'1px solid #F3F4F6'}}>
                        <div><div className="adm-mc-label">Price</div><div className="adm-mc-val" style={{fontWeight:700}}>₹{p.price}</div></div>
                        <div style={{textAlign:'right'}}><div className="adm-mc-label">Stock</div><div className="adm-mc-val" style={{color:p.stock<10?'#DC2626':'#059669',fontWeight:700}}>{p.stock}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CATEGORIES ── */}
          {activeTab === 'categories' && (
            <div>
              <div className="adm-page-header">
                <div className="adm-title">Categories</div>
                <button onClick={openAddCat} style={{ padding:'10px 16px', background:'#111827', color:'white', border:'none', borderRadius:'8px', fontWeight:600, display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}>
                  <Plus size={16}/> Add Category
                </button>
              </div>
              <div className="adm-table-wrap">
                {/* Desktop table */}
                <div className="adm-table-scroll" style={{ overflowX:'auto' }}>
                  <table className="adm-table">
                     <thead>
                       <tr>
                         <th className="adm-th" style={{ width:'60px' }}>Image</th>
                         <th className="adm-th">Name</th>
                         <th className="adm-th">Items Count</th>
                         <th className="adm-th">Actions</th>
                       </tr>
                     </thead>
                     <tbody>
                       {dbCategories.length===0 && <tr><td colSpan="4" className="adm-td" style={{textAlign:'center', padding:'32px'}}>No categories</td></tr>}
                       {dbCategories.map(c => (
                         <tr className="adm-tr" key={c.id}>
                           <td className="adm-td"><img src={c.image_url} alt="" style={{ width:'40px', height:'40px', borderRadius:'6px', border:'1px solid #E5E7EB', objectFit:'cover' }} /></td>
                           <td className="adm-td" style={{ fontWeight:500 }}>{c.name}</td>
                           <td className="adm-td">{products.filter(p=>p.category===c.name).length}</td>
                           <td className="adm-td">
                             <div style={{ display:'flex', gap:'8px' }}>
                               <IconBtn color="blue" onClick={()=>openEditCat(c)}><Edit size={14}/></IconBtn>
                               <IconBtn color="red" onClick={()=>deleteCategory(c.id)}><Trash2 size={14}/></IconBtn>
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                  </table>
                </div>
                {/* Mobile card list */}
                <div className="adm-card-list" style={{ padding:'12px' }}>
                  {dbCategories.length===0 && <div style={{textAlign:'center',padding:'32px',color:'#6B7280'}}>No categories</div>}
                  {dbCategories.map(c => (
                    <div className="adm-mobile-card" key={c.id}>
                      <div className="adm-mc-row">
                        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                          <img src={c.image_url} alt="" style={{width:'48px',height:'48px',borderRadius:'8px',objectFit:'cover',border:'1px solid #E5E7EB'}} />
                          <div>
                            <div className="adm-mc-val" style={{fontWeight:600}}>{c.name}</div>
                            <div style={{fontSize:'0.78rem',color:'#6B7280'}}>{products.filter(p=>p.category===c.name).length} items</div>
                          </div>
                        </div>
                        <div className="adm-mc-actions">
                          <IconBtn color="blue" onClick={()=>openEditCat(c)}><Edit size={14}/></IconBtn>
                          <IconBtn color="red" onClick={()=>deleteCategory(c.id)}><Trash2 size={14}/></IconBtn>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── DELIVERY BOYS ── */}
          {activeTab === 'delivery' && (
            <div>
              <div className="adm-page-header">
                <div className="adm-title">Delivery Boys</div>
                <button onClick={openAddDriver} style={{ padding:'10px 16px', background:'#111827', color:'white', border:'none', borderRadius:'8px', fontWeight:600, display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', whiteSpace:'nowrap' }}>
                  <Plus size={16}/> Add Driver
                </button>
              </div>
              <div className="adm-table-wrap">
                {/* Desktop table */}
                <div className="adm-table-scroll" style={{ overflowX:'auto' }}>
                  <table className="adm-table">
                     <thead>
                       <tr>
                         <th className="adm-th">Name</th>
                         <th className="adm-th">Phone</th>
                         <th className="adm-th">Username</th>
                         <th className="adm-th">Actions</th>
                       </tr>
                     </thead>
                     <tbody>
                       {deliveryBoys.length===0 && <tr><td colSpan="4" className="adm-td" style={{textAlign:'center',padding:'32px',color:'#6B7280'}}>No delivery boys added yet</td></tr>}
                       {deliveryBoys.map(d => (
                         <tr className="adm-tr" key={d.id}>
                           <td className="adm-td" style={{ fontWeight:500 }}>
                             <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                               <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#E0E7FF', color:'#4F46E5', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{d.name.charAt(0)}</div>
                               {d.name}
                             </div>
                           </td>
                           <td className="adm-td">{d.phone}</td>
                           <td className="adm-td"><span style={{ color:'#6B7280' }}>@{d.username}</span></td>
                           <td className="adm-td">
                             <div style={{ display:'flex', gap:'8px' }}>
                               <IconBtn color="blue" onClick={()=>openEditDriver(d)}><Edit size={14}/></IconBtn>
                               <IconBtn color="red" onClick={()=>deleteDeliveryBoy(d.id)}><Trash2 size={14}/></IconBtn>
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                  </table>
                </div>
                {/* Mobile card list */}
                <div className="adm-card-list" style={{ padding:'12px' }}>
                  {deliveryBoys.length===0 && <div style={{textAlign:'center',padding:'32px',color:'#6B7280'}}>No delivery boys added yet</div>}
                  {deliveryBoys.map(d => (
                    <div className="adm-mobile-card" key={d.id}>
                      <div className="adm-mc-row">
                        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                          <div style={{width:'44px',height:'44px',borderRadius:'50%',background:'#E0E7FF',color:'#4F46E5',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'1.1rem',flexShrink:0}}>{d.name.charAt(0)}</div>
                          <div>
                            <div className="adm-mc-val" style={{fontWeight:700}}>{d.name}</div>
                            <div style={{fontSize:'0.78rem',color:'#6B7280'}}>@{d.username}</div>
                          </div>
                        </div>
                        <div className="adm-mc-actions">
                          <IconBtn color="blue" onClick={()=>openEditDriver(d)}><Edit size={14}/></IconBtn>
                          <IconBtn color="red" onClick={()=>deleteDeliveryBoy(d.id)}><Trash2 size={14}/></IconBtn>
                        </div>
                      </div>
                      <div style={{paddingTop:'8px',borderTop:'1px solid #F3F4F6'}}>
                        <div className="adm-mc-label">Phone</div>
                        <div className="adm-mc-val">{d.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeTab === 'settings' && (
            <div>
              <div className="adm-page-header">
                <div className="adm-title">Store Settings</div>
              </div>

              {/* Store Open/Close System */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', animation: 'slideDown 0.3s ease-out' }}>
                
                {/* Main Control Card */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isStoreOpen ? '#DCFCE7' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isStoreOpen ? <CheckCircle2 size={24} color="#16A34A" /> : <AlertCircle size={24} color="#DC2626" />}
                      </div>
                      <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          Store Status
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: isStoreOpen ? '#DCFCE7' : '#FEE2E2', color: isStoreOpen ? '#166534' : '#991B1B' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isStoreOpen ? '#16A34A' : '#DC2626', animation: isStoreOpen ? 'pulse 2s infinite' : 'none' }} />
                            {isStoreOpen ? 'LIVE OPEN' : 'CLOSED'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '4px', fontWeight: 500 }}>
                          {isStoreOpen ? 'Customers are able to browse and place orders.' : 'The store is paused. Customers cannot place new orders.'}
                        </div>
                      </div>
                    </div>

                    {/* Master Toggle */}
                    <div
                      onClick={() => setStoreOpen(!isStoreOpen)}
                      style={{
                        width: '80px', height: '36px', borderRadius: '18px', cursor: 'pointer',
                        background: isStoreOpen ? '#16A34A' : '#E5E7EB',
                        position: 'relative', transition: 'background 0.3s', flexShrink: 0,
                        border: isStoreOpen ? 'none' : '1px solid #D1D5DB'
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: '2px', left: isStoreOpen ? '46px' : '2px',
                        width: '32px', height: '32px', borderRadius: '16px', background: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transition: 'left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {isStoreOpen ? <CheckCircle2 size={16} color="#16A34A" /> : <X size={16} color="#9CA3AF" />}
                      </div>
                    </div>

                  </div> 

                  {/* Info Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ background: '#F8FAFC', borderRadius: '14px', border: '1px solid #F1F5F9', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: '#E2E8F0', padding: '10px', borderRadius: '10px', color: '#475569' }}><Clock size={20} /></div>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Business Hours</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>8:00 AM - 10:00 PM</div>
                      </div>
                    </div>
                    
                    <div style={{ background: '#F8FAFC', borderRadius: '14px', border: '1px solid #F1F5F9', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: '#E2E8F0', padding: '10px', borderRadius: '10px', color: '#475569' }}><Package size={20} /></div>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Existing Orders</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>Processing normally</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Divider */}
                  <div style={{ height: '1px', background: '#F3F4F6', margin: '24px 0' }} />

                  {/* Quick Actions */}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '12px' }}>Quick Actions</div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button
                        className="press-scale"
                        onClick={() => setStoreOpen(true)}
                        disabled={isStoreOpen}
                        style={{
                          flex: '1 1 200px', height: '44px', borderRadius: '9999px', border: 'none',
                          background: isStoreOpen ? '#F1F5F9' : 'linear-gradient(135deg, #16A34A, #22C55E)',
                          color: isStoreOpen ? '#94A3B8' : '#fff',
                          fontWeight: 700, fontSize: '0.9rem', cursor: isStoreOpen ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          boxShadow: isStoreOpen ? 'none' : '0 4px 12px rgba(22, 163, 74, 0.25)',
                          transition: 'all 0.2s', opacity: isStoreOpen ? 0.6 : 1
                        }}
                      >
                        <CheckCircle2 size={18} /> Enable Operations
                      </button>
                      <button
                        className="press-scale"
                        onClick={() => setStoreOpen(false)}
                        disabled={!isStoreOpen}
                        style={{
                          flex: '1 1 200px', height: '44px', borderRadius: '9999px', border: 'none',
                          background: !isStoreOpen ? '#F1F5F9' : '#FFF1F2',
                          color: !isStoreOpen ? '#94A3B8' : '#E11D48',
                          fontWeight: 700, fontSize: '0.9rem', cursor: !isStoreOpen ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          transition: 'all 0.2s', opacity: !isStoreOpen ? 0.6 : 1
                        }}
                      >
                        <AlertCircle size={18} /> Suspend Ordering
                      </button>
                    </div>
                  </div>

                </div>

                {/* Collapsible Info Box */}
                <details style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', padding: '16px 20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <summary style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', fontWeight: 700, color: '#334155', outline: 'none' }}>
                    <div style={{ background: '#EFF6FF', padding: '8px', borderRadius: '8px', color: '#2563EB', display: 'flex' }}><AlertCircle size={18} /></div>
                    How does the Store Toggle work?
                  </summary>
                  <div style={{ marginTop: '16px', paddingLeft: '50px', fontSize: '0.85rem', color: '#64748B', lineHeight: 1.6 }}>
                    <p style={{ margin: '0 0 8px' }}>• <strong>When Closed:</strong> Customers will see a "Store Closed" banner on the app. Ordering is completely disabled at checkout. Active carts are preserved.</p>
                    <p style={{ margin: 0 }}>• <strong>Active Orders:</strong> Disabling the store does NOT affect existing orders. Orders currently in the pipeline will still be processed and tracked by the delivery team.</p>
                  </div>
                </details>

              </div>
            </div>
          )}

          {/* Placeholders for users/analytics */}
          {['users', 'analytics'].includes(activeTab) && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', color:'#9CA3AF' }}>
              <div style={{ padding:'24px', background:'#ffffff', borderRadius:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', textAlign:'center' }}>
                <Settings size={48} color="#D1D5DB" style={{ marginBottom:'16px' }} />
                <h3 style={{ fontSize:'1.25rem', color:'#111827', marginBottom:'8px' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
                <p style={{ fontSize:'0.875rem' }}>This feature is coming soon in the next update.</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODALS */}
      <Modal open={isProdOpen} onClose={()=>setProdOpen(false)} title={editingProdId ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSaveProduct} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <Field label="Product Name *"><input style={mInput} value={prodForm.name} onChange={e=>setProdForm({...prodForm,name:e.target.value})} required placeholder="e.g. Basmati Rice"/></Field>
          <div style={{ display:'flex', gap:'12px' }}>
            <div style={{ flex:1 }}><Field label="Price (â‚¹) *"><input type="number" style={mInput} value={prodForm.price} onChange={e=>setProdForm({...prodForm,price:e.target.value})} required/></Field></div>
            <div style={{ flex:1 }}><Field label="Stock Count *"><input type="number" style={mInput} value={prodForm.stock} onChange={e=>setProdForm({...prodForm,stock:e.target.value})} required/></Field></div>
          </div>
          <Field label="Category *">
            <select style={{ ...mInput, cursor:'pointer' }} value={prodForm.category} onChange={e=>setProdForm({...prodForm,category:e.target.value})} required>
              <option value="">Select category...</option>
              {dbCategories.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Product Image">
             {prodPreview || prodForm.image_url ? <img src={prodPreview||prodForm.image_url} alt="" style={{ width:'60px', height:'60px', borderRadius:'8px', objectFit:'cover', marginBottom:'10px', border:'1px solid #E5E7EB' }}/> : null}
             <input type="file" accept="image/*" style={{ ...mInput, background:'#ffffff' }} onChange={e=>{if(e.target.files?.[0]){setProdFile(e.target.files[0]);setProdPreview(URL.createObjectURL(e.target.files[0]));}}}/>
          </Field>
          <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
            <CancelBtn onClick={()=>setProdOpen(false)}/>
            <SaveBtn loading={prodUploading} label="Save Product"/>
          </div>
        </form>
      </Modal>

      <Modal open={isCatOpen} onClose={()=>setCatOpen(false)} title={editingCatId ? 'Edit Category' : 'Add New Category'}>
        <form onSubmit={handleSaveCat} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <Field label="Category Name *"><input style={mInput} value={catForm.name} onChange={e=>setCatForm({...catForm,name:e.target.value})} required placeholder="e.g. Snacks"/></Field>
          <Field label="Category Image">
             {catPreview || catForm.image_url ? <img src={catPreview||catForm.image_url} alt="" style={{ width:'60px', height:'60px', borderRadius:'8px', objectFit:'cover', marginBottom:'10px', border:'1px solid #E5E7EB' }}/> : null}
             <input type="file" accept="image/*" style={{ ...mInput, background:'#ffffff' }} onChange={e=>{if(e.target.files?.[0]){setCatFile(e.target.files[0]);setCatPreview(URL.createObjectURL(e.target.files[0]));}}}/>
          </Field>
          <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
            <CancelBtn onClick={()=>setCatOpen(false)}/>
            <SaveBtn loading={catUploading} label="Save Category"/>
          </div>
        </form>
      </Modal>

      <Modal open={isDriverOpen} onClose={()=>setDriverOpen(false)} title={editingDriverId ? 'Edit Delivery Boy' : 'Add Delivery Boy'}>
        <form onSubmit={handleSaveDriver} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <Field label="Full Name *"><input style={mInput} value={driverForm.name} onChange={e=>setDriverForm({...driverForm,name:e.target.value})} required/></Field>
          <Field label="Phone *"><input type="tel" style={mInput} value={driverForm.phone} onChange={e=>setDriverForm({...driverForm,phone:e.target.value})} required/></Field>
          <Field label="Username *"><input style={mInput} value={driverForm.username} onChange={e=>setDriverForm({...driverForm,username:e.target.value})} required/></Field>
          <Field label="Password *"><input type="text" style={mInput} value={driverForm.password} onChange={e=>setDriverForm({...driverForm,password:e.target.value})} required/></Field>
          <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
            <CancelBtn onClick={()=>setDriverOpen(false)}/>
            <SaveBtn loading={false} label="Save Delivery Boy"/>
          </div>
        </form>
      </Modal>
    </div>
  );
}
