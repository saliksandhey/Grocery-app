import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Plus, X,
  Edit, Trash2, Tag, TrendingUp, Clock, CheckCircle2,
  Truck, ChevronRight, Search, Bell, LogOut,
  Settings, BarChart2, Menu, AlertCircle
} from 'lucide-react';
import { supabase } from '../supabaseClient';

/* â”€â”€â”€ constants â”€â”€â”€ */
const statusMeta = {
  Pending:              { bg: '#FEF3C7', color: '#D97706', dot: '#D97706' },
  Accepted:             { bg: '#DBEAFE', color: '#2563EB', dot: '#2563EB' },
  Preparing:            { bg: '#E0E7FF', color: '#4F46E5', dot: '#4F46E5' },
  'Ready for Delivery': { bg: '#F3E8FF', color: '#9333EA', dot: '#9333EA' },
  'Out for Delivery':   { bg: '#FFEDD5', color: '#EA580C', dot: '#EA580C' },
  Delivered:            { bg: '#D1FAE5', color: '#059669', dot: '#059669' },
  Cancelled:            { bg: '#FEE2E2', color: '#DC2626', dot: '#DC2626' },
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
  const [activeTab,   setActiveTab]   = useState('dashboard');
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [isMobile,    setIsMobile]    = useState(window.innerWidth < 768);
  const [searchQ,     setSearchQ]     = useState('');

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

  /* â”€â”€â”€ Action button for orders â”€â”€â”€ */
  const OrderAction = ({ order }) => {
    if (order.status === 'Pending')
      return (
        <div style={{display:'flex', gap:'8px'}}>
          <button onClick={() => updateOrderStatus(order.id,'Accepted')} className="adm-action-btn" style={{ background:'#10B981', color:'white' }}>Accept</button>
          <button onClick={() => updateOrderStatus(order.id,'Cancelled')} className="adm-action-btn" style={{ background:'#FEE2E2', color:'#DC2626' }}>Cancel</button>
        </div>
      );
    if (order.status === 'Accepted')
      return <button onClick={() => updateOrderStatus(order.id,'Ready for Delivery')} className="adm-action-btn" style={{ background:'#3B82F6', color:'white' }}>Ready</button>;
    if (order.status === 'Ready for Delivery' && !order.delivery_boy_id)
      return (
        <select onChange={e => { if(e.target.value) assignDeliveryBoy(order.id, e.target.value); }}
          style={{ padding:'6px 8px', borderRadius:'6px', border:'1px solid #D1D5DB', background:'#F9FAFB', fontSize:'0.8rem', cursor:'pointer' }}>
          <option value="">Assign Riderâ€¦</option>
          {deliveryBoys.map(db => <option key={db.id} value={db.id}>{db.name}</option>)}
        </select>
      );
    if (order.delivery_boy_id && order.status !== 'Delivered')
      return <span style={{ fontSize:'0.8rem', color:'#4B5563', display:'flex', alignItems:'center', gap:'6px', fontWeight:500 }}><Truck size={14}/> En route</span>;
    if (order.status === 'Delivered')
      return <span style={{ fontSize:'0.8rem', color:'#059669', display:'flex', alignItems:'center', gap:'6px', fontWeight:500 }}><CheckCircle2 size={14}/> Completed</span>;
    if (order.status === 'Cancelled')
      return <span style={{ fontSize:'0.8rem', color:'#DC2626', fontWeight:500 }}>Cancelled</span>;
    return null;
  };

  /* â”€â”€â”€ Modal â”€â”€â”€ */
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
          position: fixed; top: 0; left: 0; width: 250px; height: 100vh;
          background: #111827; z-index: 201; transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .adm-drawer.open { transform: translateX(0); }
        .adm-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .adm-topbar {
          display: flex; align-items: center; justify-content: space-between;
          height: 60px; padding: 0 24px;
          background: #ffffff;
          border-bottom: 1px solid #E5E7EB;
          position: sticky; top: 0; z-index: 50;
        }
        .adm-search {
          display: flex; align-items: center; gap: 8px;
          background: #F3F4F6;
          border-radius: 8px; padding: 8px 12px; width: 300px;
        }
        .adm-search input {
          background: none; border: none; outline: none; width: 100%;
          font-size: 0.875rem; color: #111827;
        }
        .adm-content { flex: 1; padding: 24px; overflow-y: auto; color: #111827; }
        .adm-page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .adm-title { font-size: 1.5rem; font-weight: 700; color: #111827; letter-spacing: -0.02em; }
        
        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
        .stat-card {
          background: #ffffff; border-radius: 12px; padding: 20px;
          border: 1px solid #E5E7EB; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .chart-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px; }

        .adm-table-wrap {
          background: #ffffff; border-radius: 12px; border: 1px solid #E5E7EB;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03); overflow: hidden;
        }
        .adm-table { width: 100%; border-collapse: collapse; text-align: left; }
        .adm-th { padding: 14px 20px; font-size: 0.75rem; font-weight: 600; color: #6B7280; text-transform: uppercase; border-bottom: 1px solid #E5E7EB; background: #F9FAFB; }
        .adm-td { padding: 14px 20px; font-size: 0.875rem; color: #374151; border-bottom: 1px solid #F3F4F6; }
        .adm-tr:last-child .adm-td { border-bottom: none; }
        .adm-tr:hover .adm-td { background: #F9FAFB; }

        .adm-action-btn { padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; border: none; }

        @media (max-width: 1024px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .chart-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .adm-sidebar { display: none; }
          .adm-drawer-overlay.open { display: block; }
          .adm-content { padding: 16px; }
          .adm-topbar { padding: 0 16px; }
          .stat-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
          .adm-search { display: none; } /* Hide search topbar on mobile for clean UI */
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

        <div className="adm-content">

          {/* Toast Notification */}
          {toast && (
            <div style={{ padding:'12px 16px', borderRadius:'8px', marginBottom:'20px', background: toast.type==='success' ? '#ECFDF5' : '#FEF2F2', border:`1px solid ${toast.type==='success' ? '#A7F3D0' : '#FECACA'}`, color: toast.type==='success' ? '#059669' : '#DC2626', fontWeight:500, fontSize:'0.875rem', display:'flex', alignItems:'center', gap:'8px' }}>
              {toast.type==='success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>} {toast.msg}
            </div>
          )}

          {/* â”€â”€ DASHBOARD â”€â”€ */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="adm-page-header">
                <div className="adm-title">Dashboard Overview</div>
              </div>

              {/* Stats Grid */}
              <div className="stat-grid">
                {[
                  { title: 'Total Orders', value: orders.length, icon: ShoppingBag, color: '#3B82F6', bg: '#DBEAFE' },
                  { title: 'Total Revenue', value: `â‚¹${revenue}`, icon: TrendingUp, color: '#10B981', bg: '#D1FAE5' },
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

          {/* â”€â”€ ORDERS â”€â”€ */}
          {activeTab === 'orders' && (
            <div>
              <div className="adm-page-header">
                <div className="adm-title">Orders Management</div>
              </div>
              <div className="adm-table-wrap">
                <div style={{ overflowX:'auto' }}>
                  <table className="adm-table">
                     <thead>
                       <tr>
                         <th className="adm-th">Order ID</th>
                         <th className="adm-th">Customer Name</th>
                         <th className="adm-th">Address</th>
                         <th className="adm-th">Amount</th>
                         <th className="adm-th">Status</th>
                         <th className="adm-th">Action</th>
                       </tr>
                     </thead>
                     <tbody>
                       {filteredOrders.length===0 && <tr><td colSpan="6" className="adm-td" style={{textAlign:'center', padding:'32px', color:'#6B7280'}}>No orders found</td></tr>}
                       {filteredOrders.map(o => (
                         <tr className="adm-tr" key={o.id}>
                           <td className="adm-td" style={{ fontWeight:600, color:'#111827' }}>#{o.id.slice(0,6).toUpperCase()}</td>
                           <td className="adm-td">
                             <div style={{ fontWeight:500, color:'#111827' }}>{o.customer_details?.name || 'Unknown'}</div>
                             <div style={{ fontSize:'0.75rem', color:'#6B7280' }}>{o.customer_details?.phone}</div>
                           </td>
                           <td className="adm-td" style={{ maxWidth:'200px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                             {o.customer_details?.address || 'N/A'}
                           </td>
                           <td className="adm-td" style={{ fontWeight:600 }}>â‚¹{o.grand_total}</td>
                           <td className="adm-td"><StatusBadge status={o.status} /></td>
                           <td className="adm-td"><OrderAction order={o} /></td>
                         </tr>
                       ))}
                     </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* â”€â”€ PRODUCTS â”€â”€ */}
          {activeTab === 'products' && (
            <div>
              <div className="adm-page-header">
                <div className="adm-title">Product Catalog</div>
                <button onClick={openAddProduct} style={{ padding:'10px 16px', background:'#111827', color:'white', border:'none', borderRadius:'8px', fontWeight:600, display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}>
                  <Plus size={16}/> Add Product
                </button>
              </div>
              <div className="adm-table-wrap">
                <div style={{ overflowX:'auto' }}>
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
                           <td className="adm-td" style={{ fontWeight:600 }}>â‚¹{p.price}</td>
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
              </div>
            </div>
          )}

          {/* â”€â”€ CATEGORIES â”€â”€ */}
          {activeTab === 'categories' && (
            <div>
              <div className="adm-page-header">
                <div className="adm-title">Categories</div>
                <button onClick={openAddCat} style={{ padding:'10px 16px', background:'#111827', color:'white', border:'none', borderRadius:'8px', fontWeight:600, display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}>
                  <Plus size={16}/> Add Category
                </button>
              </div>
              <div className="adm-table-wrap">
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
            </div>
          )}

          {/* â”€â”€ DELIVERY BOYS â”€â”€ */}
          {activeTab === 'delivery' && (
            <div>
              <div className="adm-page-header">
                <div className="adm-title">Delivery Boys</div>
                <button onClick={openAddDriver} style={{ padding:'10px 16px', background:'#111827', color:'white', border:'none', borderRadius:'8px', fontWeight:600, display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}>
                  <Plus size={16}/> Add Driver
                </button>
              </div>
              <div className="adm-table-wrap">
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
            </div>
          )}

          {/* Placeholders for settings/users/analytics */}
          {['users', 'analytics', 'settings'].includes(activeTab) && (
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
