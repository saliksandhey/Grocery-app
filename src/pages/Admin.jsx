import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Plus, X,
  Edit, Trash2, Tag, TrendingUp, Clock, CheckCircle2,
  Truck, ChevronRight, Search, Bell, LogOut,
  BarChart3, RefreshCw, Star, Menu, IndianRupee,
  AlertCircle, ImageIcon
} from 'lucide-react';
import { supabase } from '../supabaseClient';

/* â”€â”€â”€ constants â”€â”€â”€ */
const statusMeta = {
  Pending:              { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', dot: '#f59e0b' },
  Accepted:             { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', dot: '#3b82f6' },
  Preparing:            { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa', dot: '#8b5cf6' },
  'Ready for Delivery': { bg: 'rgba(109,40,217,0.15)',  color: '#c084fc', dot: '#6d28d9' },
  'Out for Delivery':   { bg: 'rgba(249,115,22,0.15)', color: '#fb923c', dot: '#f97316' },
  Delivered:            { bg: 'rgba(16,185,129,0.15)', color: '#34d399', dot: '#8b5cf6' },
};

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'orders',     label: 'Orders',       icon: ShoppingBag },
  { id: 'products',   label: 'Products',     icon: Package },
  { id: 'categories', label: 'Categories',   icon: Tag },
  { id: 'delivery',   label: 'Delivery Boys',icon: Truck },
];

/* â”€â”€â”€ sub-components â”€â”€â”€ */
const StatusBadge = ({ status }) => {
  const m = statusMeta[status] || { bg: 'rgba(100,116,139,0.2)', color: '#94a3b8', dot: '#64748b' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '20px',
      background: m.bg, color: m.color,
      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em',
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
    background: color === 'blue' ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)',
    color: color === 'blue' ? '#60a5fa' : '#f87171',
    border: `1px solid ${color === 'blue' ? 'rgba(59,130,246,0.25)' : 'rgba(239,68,68,0.25)'}`,
    borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.15s', flexShrink: 0,
  }}>{children}</button>
);

const Field = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: '7px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </label>
    {children}
  </div>
);

const mInput = {
  width: '100%', padding: '11px 14px',
  background: 'rgba(15,23,42,0.8)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', outline: 'none',
  color: '#e2e8f0', fontSize: '0.875rem',
  fontFamily: 'inherit',
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function Admin() {
  const [activeTab,   setActiveTab]   = useState('orders');
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
  const filteredOrders   = orders.filter(o => o.customer_details?.name?.toLowerCase().includes(q) || o.id?.toLowerCase().includes(q));
  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
  const pendingCount    = orders.filter(o => o.status === 'Pending').length;
  const deliveredCount  = orders.filter(o => o.status === 'Delivered').length;
  const revenue         = orders.reduce((s, o) => s + (o.grand_total || 0), 0);

  /* nav handler: close drawer on mobile */
  const goTab = (id) => { setActiveTab(id); if (isMobile) setDrawerOpen(false); };

  /* â”€â”€â”€ Sidebar content (shared) â”€â”€â”€ */
  const SidebarContent = () => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:'12px' }}>
        <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'linear-gradient(135deg,#6d28d9,#5b21b6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0, boxShadow:'0 4px 14px rgba(109,40,217,0.4)' }}>ðŸ›’</div>
        <div>
          <div style={{ fontSize:'0.9rem', fontWeight:800, color:'#f1f5f9', lineHeight:1.2 }}>Admin</div>
          <div style={{ fontSize:'0.68rem', color:'#6d28d9', fontWeight:600 }}>Malerkotla Fresh</div>
        </div>
        {isMobile && (
          <button onClick={() => setDrawerOpen(false)} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'#475569', display:'flex' }}>
            <X size={20} />
          </button>
        )}
      </div>
      <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
        {NAV.map(n => {
          const active = activeTab === n.id;
          return (
            <button key={n.id} onClick={() => goTab(n.id)} style={{
              display:'flex', alignItems:'center', gap:'12px',
              width:'calc(100% - 0px)', padding:'11px 14px', margin:'2px 0',
              borderRadius:'10px', border:'none', cursor:'pointer',
              background: active ? 'linear-gradient(135deg,rgba(109,40,217,0.18),rgba(22,163,74,0.1))' : 'transparent',
              color: active ? '#6d28d9' : '#64748b',
              fontWeight: active ? 700 : 500,
              fontSize:'0.875rem', fontFamily:'inherit',
              textAlign:'left', transition:'all 0.18s',
              borderLeft: active ? '2px solid #6d28d9' : '2px solid transparent',
            }}>
              <n.icon size={18} style={{ flexShrink:0 }} />
              {n.label}
              {active && <ChevronRight size={14} style={{ marginLeft:'auto' }} />}
            </button>
          );
        })}
      </nav>
      <div style={{ padding:'12px 8px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
        <button style={{ display:'flex', alignItems:'center', gap:'12px', width:'100%', padding:'11px 14px', borderRadius:'10px', border:'none', cursor:'pointer', background:'transparent', color:'#ef4444', fontWeight:600, fontSize:'0.875rem', fontFamily:'inherit' }}>
          <LogOut size={18} style={{ flexShrink:0 }} /> Sign Out
        </button>
      </div>
    </div>
  );

  /* â”€â”€â”€ Action button for orders â”€â”€â”€ */
  const OrderAction = ({ order }) => {
    if (order.status === 'Pending')
      return <button onClick={() => updateOrderStatus(order.id,'Accepted')} className="adm-action-btn" style={{ background:'linear-gradient(135deg,#6d28d9,#5b21b6)' }}>Accept</button>;
    if (order.status === 'Accepted')
      return <button onClick={() => updateOrderStatus(order.id,'Preparing')} className="adm-action-btn" style={{ background:'linear-gradient(135deg,#3b82f6,#2563eb)' }}>Prepare</button>;
    if (order.status === 'Preparing')
      return <button onClick={() => updateOrderStatus(order.id,'Ready for Delivery')} className="adm-action-btn" style={{ background:'linear-gradient(135deg,#8b5cf6,#7c3aed)' }}>Mark Ready</button>;
    if (order.status === 'Ready for Delivery' && !order.delivery_boy_id)
      return (
        <select onChange={e => { if(e.target.value) assignDeliveryBoy(order.id, e.target.value); }}
          style={{ padding:'6px 10px', borderRadius:'8px', background:'#1e293b', border:'1px solid rgba(255,255,255,0.1)', color:'#cbd5e1', fontSize:'0.75rem', cursor:'pointer', width:'100%' }}>
          <option value="">Assign Riderâ€¦</option>
          {deliveryBoys.map(db => <option key={db.id} value={db.id}>{db.name}</option>)}
        </select>
      );
    if (order.delivery_boy_id && order.status !== 'Delivered')
      return <span style={{ fontSize:'0.72rem', color:'#475569', display:'flex', alignItems:'center', gap:'4px' }}><Truck size={12}/> En routeâ€¦</span>;
    if (order.status === 'Delivered')
      return <span style={{ fontSize:'0.72rem', color:'#c084fc', display:'flex', alignItems:'center', gap:'4px' }}><CheckCircle2 size={12}/> Done</span>;
    return null;
  };

  /* â”€â”€â”€ Modal â”€â”€â”€ */
  const Modal = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
      <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:400, padding:'16px' }}>
        <div style={{ background:'linear-gradient(145deg,#1e293b,#0f172a)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'20px', width:'100%', maxWidth:'480px', maxHeight:'92vh', overflowY:'auto', padding:'24px', boxShadow:'0 25px 80px rgba(0,0,0,0.5)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <h2 style={{ fontWeight:800, fontSize:'1.05rem', color:'#f1f5f9' }}>{title}</h2>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#475569', display:'flex' }}><X size={22}/></button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const SaveBtn = ({ loading, label, editLabel }) => (
    <button type="submit" disabled={loading} style={{ flex:1, padding:'12px', background:'linear-gradient(135deg,#6d28d9,#5b21b6)', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 16px rgba(109,40,217,0.3)' }}>
      {loading ? 'Savingâ€¦' : (editLabel || label)}
    </button>
  );
  const CancelBtn = ({ onClick }) => (
    <button type="button" onClick={onClick} style={{ flex:1, padding:'12px', background:'rgba(30,41,59,0.8)', color:'#94a3b8', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', fontWeight:600, fontSize:'0.875rem', cursor:'pointer', fontFamily:'inherit' }}>
      Cancel
    </button>
  );

  return (
    <div className="adm-root">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .adm-root {
          display: flex; min-height: 100vh;
          background: #0f172a;
          font-family: 'Inter', system-ui, sans-serif;
        }
        /* sidebar desktop */
        .adm-sidebar {
          width: 220px; flex-shrink: 0;
          background: linear-gradient(180deg,#1e293b 0%,#0f172a 100%);
          border-right: 1px solid rgba(255,255,255,0.06);
          height: 100vh; position: sticky; top: 0;
          overflow: hidden;
        }
        /* drawer overlay on mobile */
        .adm-drawer-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 200;
        }
        .adm-drawer {
          position: fixed; top: 0; left: 0;
          width: 240px; height: 100vh;
          background: linear-gradient(180deg,#1e293b,#0f172a);
          border-right: 1px solid rgba(255,255,255,0.08);
          z-index: 201; overflow: hidden;
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(.4,0,.2,1);
        }
        .adm-drawer.open { transform: translateX(0); }
        .adm-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .adm-topbar {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 20px;
          background: rgba(15,23,42,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky; top: 0; z-index: 50;
        }
        .adm-hamburger { display: none; }
        .adm-search-wrap {
          display: flex; align-items: center; gap: 8px;
          background: rgba(30,41,59,0.8);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 8px 14px;
          flex: 1; max-width: 360px;
        }
        .adm-search-input {
          background: none; border: none; outline: none;
          color: #e2e8f0; font-size: 0.875rem; width: 100%; font-family: inherit;
        }
        .adm-content { flex: 1; padding: 24px; overflow-y: auto; }
        .adm-page-title { font-size: 1.4rem; font-weight: 800; color: #f1f5f9; margin-bottom: 4px; letter-spacing: -0.02em; }
        .adm-page-sub { font-size: 0.82rem; color: #64748b; margin-bottom: 24px; }
        .adm-card {
          background: rgba(30,41,59,0.6);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          backdrop-filter: blur(8px);
        }
        /* stat grid */
        .adm-stat-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 14px; margin-bottom: 24px;
        }
        .adm-stat-card {
          border-radius: 16px; padding: 20px 18px;
          position: relative; overflow: hidden;
        }
        /* table */
        .adm-table { width: 100%; border-collapse: collapse; }
        .adm-th {
          padding: 12px 16px;
          font-size: 0.68rem; font-weight: 700; color: #475569;
          text-transform: uppercase; letter-spacing: 0.06em;
          text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(15,23,42,0.4); white-space: nowrap;
        }
        .adm-td {
          padding: 13px 16px;
          font-size: 0.875rem; color: #cbd5e1;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .adm-tr:hover .adm-td { background: rgba(255,255,255,0.02); }
        /* mobile order card */
        .adm-order-card {
          background: rgba(30,41,59,0.7);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 14px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .adm-action-btn {
          padding: 6px 14px; border-radius: 8px; border: none;
          color: white; font-weight: 700; font-size: 0.78rem;
          cursor: pointer; font-family: inherit;
          white-space: nowrap;
        }
        /* responsive */
        @media (max-width: 1024px) {
          .adm-stat-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 767px) {
          .adm-sidebar { display: none; }
          .adm-drawer-overlay.open { display: block; }
          .adm-hamburger { display: flex; }
          .adm-content { padding: 16px; }
          .adm-stat-grid { grid-template-columns: repeat(2,1fr); gap: 10px; margin-bottom: 16px; }
          .adm-stat-card { padding: 14px; }
          .adm-page-title { font-size: 1.15rem; }
          .adm-table-wrap { display: none; }
          .adm-mobile-list { display: flex !important; }
          .adm-topbar { padding: 12px 14px; }
        }
        @media (min-width: 768px) {
          .adm-mobile-list { display: none !important; }
        }
      `}</style>

      {/* â”€â”€ Desktop Sidebar â”€â”€ */}
      <aside className="adm-sidebar">
        <SidebarContent />
      </aside>

      {/* â”€â”€ Mobile Drawer â”€â”€ */}
      <div className={`adm-drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`adm-drawer ${drawerOpen ? 'open' : ''}`}>
        <SidebarContent />
      </div>

      {/* â”€â”€ Main â”€â”€ */}
      <div className="adm-main">

        {/* Topbar */}
        <div className="adm-topbar">
          <button className="adm-hamburger" onClick={() => setDrawerOpen(v=>!v)}
            style={{ background:'rgba(30,41,59,0.8)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'7px', cursor:'pointer', color:'#94a3b8', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Menu size={20} />
          </button>

          <div className="adm-search-wrap">
            <Search size={15} color="#475569" />
            <input className="adm-search-input" placeholder="Searchâ€¦" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginLeft:'auto' }}>
            <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,#6d28d9,#5b21b6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:800, color:'white', flexShrink:0 }}>AD</div>
          </div>
        </div>

        {/* Content */}
        <div className="adm-content">

          {/* Toast */}
          {toast && (
            <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', borderRadius:'12px', marginBottom:'18px', background: toast.type==='success' ? 'rgba(109,40,217,0.12)' : 'rgba(239,68,68,0.12)', border:`1px solid ${toast.type==='success' ? 'rgba(109,40,217,0.3)' : 'rgba(239,68,68,0.3)'}`, color: toast.type==='success' ? '#c084fc' : '#f87171', fontWeight:600, fontSize:'0.875rem' }}>
              {toast.type==='success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>} {toast.msg}
            </div>
          )}

          {/* â”€â”€ DASHBOARD â”€â”€ */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="adm-page-title">Dashboard</div>
              <div className="adm-page-sub">Malerkotla Fresh Â· Real-time overview</div>
              <div className="adm-stat-grid">
                {[
                  { label:'Total Orders', value:orders.length,     icon:ShoppingBag,  g:'linear-gradient(135deg,#6366f1,#4338ca)', glow:'rgba(99,102,241,0.3)' },
                  { label:'Pending',      value:pendingCount,       icon:Clock,         g:'linear-gradient(135deg,#f59e0b,#d97706)', glow:'rgba(245,158,11,0.3)' },
                  { label:'Delivered',    value:deliveredCount,     icon:CheckCircle2,  g:'linear-gradient(135deg,#6d28d9,#5b21b6)', glow:'rgba(109,40,217,0.3)' },
                  { label:'Revenue',      value:`â‚¹${revenue}`,      icon:TrendingUp,    g:'linear-gradient(135deg,#ec4899,#db2777)', glow:'rgba(236,72,153,0.3)' },
                ].map(s => (
                  <div key={s.label} className="adm-stat-card" style={{ background:s.g, boxShadow:`0 6px 24px ${s.glow}` }}>
                    <div style={{ position:'absolute', top:'-20px', right:'-20px', width:'80px', height:'80px', borderRadius:'50%', background:'rgba(255,255,255,0.08)' }} />
                    <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px', flexShrink:0 }}>
                      <s.icon size={18} color="white" />
                    </div>
                    <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.7)', marginBottom:'4px', fontWeight:600 }}>{s.label}</div>
                    <div style={{ fontSize:'1.6rem', fontWeight:900, color:'white', lineHeight:1 }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'14px' }}>
                <div className="adm-card" style={{ padding:'18px' }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem' }}>
                    <Package size={15} color="#6d28d9"/> Inventory
                  </div>
                  {[['Products',products.length],['Categories',dbCategories.length],['Riders',deliveryBoys.length]].map(([l,v])=>(
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color:'#64748b', fontSize:'0.85rem' }}>{l}</span>
                      <span style={{ color:'#f1f5f9', fontWeight:700 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="adm-card" style={{ padding:'18px' }}>
                  <div style={{ fontWeight:700, color:'#f1f5f9', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem' }}>
                    <Star size={15} color="#f59e0b"/> Recent Orders
                  </div>
                  {orders.slice(0,4).map(o => (
                    <div key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize:'0.82rem', color:'#cbd5e1', fontWeight:600 }}>{o.customer_details?.name}</div>
                      <StatusBadge status={o.status} />
                    </div>
                  ))}
                  {orders.length===0 && <div style={{ color:'#475569', fontSize:'0.82rem' }}>No orders yet.</div>}
                </div>
              </div>
            </div>
          )}

          {/* â”€â”€ ORDERS â”€â”€ */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'12px', marginBottom:'18px' }}>
                <div>
                  <div className="adm-page-title">Orders</div>
                  <div className="adm-page-sub" style={{ margin:0 }}>{filteredOrders.length} total orders</div>
                </div>
                <button onClick={() => {}} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', background:'rgba(30,41,59,0.8)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', color:'#94a3b8', fontWeight:600, fontSize:'0.8rem', cursor:'pointer', fontFamily:'inherit' }}>
                  <RefreshCw size={14}/> Refresh
                </button>
              </div>

              {/* Desktop table */}
              <div className="adm-table-wrap adm-card" style={{ overflow:'hidden' }}>
                <div style={{ overflowX:'auto' }}>
                  <table className="adm-table">
                    <thead>
                      <tr>
                        {['Order ID','Customer','Items','Total','Status','Action'].map(h=>(
                          <th key={h} className="adm-th">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length===0 && <tr><td colSpan="6" className="adm-td" style={{ textAlign:'center', padding:'40px', color:'#475569' }}>No orders found.</td></tr>}
                      {filteredOrders.map(order => (
                        <tr key={order.id} className="adm-tr">
                          <td className="adm-td"><span style={{ fontFamily:'monospace', color:'#6d28d9', fontWeight:700, fontSize:'0.8rem' }}>#{order.id.slice(0,8)}</span></td>
                          <td className="adm-td">
                            <div style={{ fontWeight:600, color:'#f1f5f9' }}>{order.customer_details?.name}</div>
                            <div style={{ fontSize:'0.72rem', color:'#475569', marginTop:'2px' }}>{order.customer_details?.phone}</div>
                          </td>
                          <td className="adm-td"><div style={{ fontSize:'0.78rem', color:'#64748b', maxWidth:'160px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{order.order_items?.map(i=>`${i.quantity}Ã— ${i.product?.name}`).join(', ')}</div></td>
                          <td className="adm-td"><span style={{ fontWeight:800, color:'#6d28d9' }}>â‚¹{order.grand_total}</span></td>
                          <td className="adm-td"><StatusBadge status={order.status}/></td>
                          <td className="adm-td" style={{ minWidth:'130px' }}><OrderAction order={order}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="adm-mobile-list" style={{ flexDirection:'column', gap:'10px' }}>
                {filteredOrders.length===0 && <div style={{ textAlign:'center', padding:'40px', color:'#475569' }}>No orders found.</div>}
                {filteredOrders.map(order => (
                  <div key={order.id} className="adm-order-card">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <span style={{ fontFamily:'monospace', color:'#6d28d9', fontWeight:700, fontSize:'0.82rem' }}>#{order.id.slice(0,8)}</span>
                      <StatusBadge status={order.status}/>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'0.875rem' }}>{order.customer_details?.name}</div>
                        <div style={{ fontSize:'0.72rem', color:'#475569' }}>{order.customer_details?.phone}</div>
                      </div>
                      <div style={{ fontWeight:900, color:'#6d28d9', fontSize:'1rem' }}>â‚¹{order.grand_total}</div>
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'#64748b', lineHeight:1.5 }}>
                      {order.order_items?.map(i=>`${i.quantity}Ã— ${i.product?.name}`).join(' Â· ')}
                    </div>
                    <OrderAction order={order}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* â”€â”€ PRODUCTS â”€â”€ */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'12px', marginBottom:'18px' }}>
                <div>
                  <div className="adm-page-title">Products</div>
                  <div className="adm-page-sub" style={{ margin:0 }}>{filteredProducts.length} items</div>
                </div>
                <button onClick={openAddProduct} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'10px 16px', background:'linear-gradient(135deg,#6d28d9,#5b21b6)', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 16px rgba(109,40,217,0.35)', whiteSpace:'nowrap' }}>
                  <Plus size={16}/> Add Product
                </button>
              </div>

              {/* Desktop table */}
              <div className="adm-table-wrap adm-card" style={{ overflow:'hidden' }}>
                <div style={{ overflowX:'auto' }}>
                  <table className="adm-table">
                    <thead>
                      <tr>{['','Name','Category','Stock','Price','Actions'].map(h=><th key={h} className="adm-th">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length===0 && <tr><td colSpan="6" className="adm-td" style={{ textAlign:'center', padding:'40px', color:'#475569' }}>No products yet.</td></tr>}
                      {filteredProducts.map(p=>(
                        <tr key={p.id} className="adm-tr">
                          <td className="adm-td" style={{ width:'56px' }}>
                            <img src={p.image_url} alt={p.name} onError={e=>e.target.src='https://placehold.co/44?text=ðŸ“¦'} style={{ width:'44px', height:'44px', objectFit:'contain', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', background:'#1e293b' }}/>
                          </td>
                          <td className="adm-td" style={{ fontWeight:600, color:'#f1f5f9' }}>{p.name}</td>
                          <td className="adm-td"><span style={{ padding:'3px 10px', borderRadius:'20px', background:'rgba(109,40,217,0.1)', color:'#c084fc', fontSize:'0.72rem', fontWeight:600 }}>{p.category}</span></td>
                          <td className="adm-td"><span style={{ color:p.stock<10?'#f87171':'#cbd5e1', fontWeight:600 }}>{p.stock}</span></td>
                          <td className="adm-td" style={{ fontWeight:800, color:'#6d28d9' }}>â‚¹{p.price}</td>
                          <td className="adm-td">
                            <div style={{ display:'flex', gap:'6px' }}>
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

              {/* Mobile cards */}
              <div className="adm-mobile-list" style={{ flexDirection:'column', gap:'10px' }}>
                {filteredProducts.length===0 && <div style={{ textAlign:'center', padding:'40px', color:'#475569' }}>No products yet.</div>}
                {filteredProducts.map(p=>(
                  <div key={p.id} className="adm-card" style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:'12px' }}>
                    <img src={p.image_url} alt={p.name} onError={e=>e.target.src='https://placehold.co/48?text=ðŸ“¦'} style={{ width:'52px', height:'52px', objectFit:'contain', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', background:'#1e293b', flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'0.875rem', marginBottom:'3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                        <span style={{ padding:'2px 8px', borderRadius:'20px', background:'rgba(109,40,217,0.1)', color:'#c084fc', fontSize:'0.68rem', fontWeight:600 }}>{p.category}</span>
                        <span style={{ fontSize:'0.72rem', color: p.stock<10?'#f87171':'#64748b' }}>Stock: {p.stock}</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' }}>
                      <span style={{ fontWeight:800, color:'#6d28d9', fontSize:'0.95rem' }}>â‚¹{p.price}</span>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <IconBtn color="blue" onClick={()=>openEditProduct(p)}><Edit size={13}/></IconBtn>
                        <IconBtn color="red" onClick={()=>deleteProduct(p.id)}><Trash2 size={13}/></IconBtn>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* â”€â”€ CATEGORIES â”€â”€ */}
          {activeTab === 'categories' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'12px', marginBottom:'18px' }}>
                <div>
                  <div className="adm-page-title">Categories</div>
                  <div className="adm-page-sub" style={{ margin:0 }}>{dbCategories.length} categories</div>
                </div>
                <button onClick={openAddCat} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'10px 16px', background:'linear-gradient(135deg,#6d28d9,#5b21b6)', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 16px rgba(109,40,217,0.35)', whiteSpace:'nowrap' }}>
                  <Plus size={16}/> Add Category
                </button>
              </div>
              {dbCategories.length===0 ? (
                <div className="adm-card" style={{ padding:'56px', textAlign:'center' }}>
                  <div style={{ fontSize:'44px', marginBottom:'12px' }}>ðŸ·ï¸</div>
                  <div style={{ color:'#94a3b8', fontWeight:600 }}>No categories yet</div>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'14px' }}>
                  {dbCategories.map(cat=>(
                    <div key={cat.id} className="adm-card" style={{ overflow:'hidden', transition:'all 0.2s', cursor:'pointer' }}
                      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='rgba(109,40,217,0.3)';}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='none'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)';}}>
                      <div style={{ height:'100px', background:'rgba(15,23,42,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <img src={cat.image_url} alt={cat.name} onError={e=>e.target.src='https://placehold.co/70?text=ðŸ·ï¸'} style={{ width:'68px', height:'68px', objectFit:'cover', borderRadius:'12px' }}/>
                      </div>
                      <div style={{ padding:'10px 12px' }}>
                        <p style={{ fontWeight:700, color:'#f1f5f9', fontSize:'0.875rem', marginBottom:'8px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{cat.name}</p>
                        <div style={{ display:'flex', gap:'6px' }}>
                          <IconBtn color="blue" onClick={()=>openEditCat(cat)}><Edit size={13}/></IconBtn>
                          <IconBtn color="red" onClick={()=>deleteCategory(cat.id)}><Trash2 size={13}/></IconBtn>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* â”€â”€ DELIVERY BOYS â”€â”€ */}
          {activeTab === 'delivery' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'12px', marginBottom:'18px' }}>
                <div>
                  <div className="adm-page-title">Delivery Partners</div>
                  <div className="adm-page-sub" style={{ margin:0 }}>{deliveryBoys.length} riders</div>
                </div>
                <button onClick={openAddDriver} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'10px 16px', background:'linear-gradient(135deg,#6d28d9,#5b21b6)', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 16px rgba(109,40,217,0.35)', whiteSpace:'nowrap' }}>
                  <Plus size={16}/> Add Driver
                </button>
              </div>

              {/* Desktop table */}
              <div className="adm-table-wrap adm-card" style={{ overflow:'hidden' }}>
                <div style={{ overflowX:'auto' }}>
                  <table className="adm-table">
                    <thead>
                      <tr>{['Name','Username','Phone','Password','Actions'].map(h=><th key={h} className="adm-th">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {deliveryBoys.length===0 && <tr><td colSpan="5" className="adm-td" style={{ textAlign:'center', padding:'40px', color:'#475569' }}>No drivers yet.</td></tr>}
                      {deliveryBoys.map(db=>(
                        <tr key={db.id} className="adm-tr">
                          <td className="adm-td">
                            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                              <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#6d28d9,#5b21b6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'white', fontSize:'0.75rem', flexShrink:0 }}>{db.name?.[0]?.toUpperCase()}</div>
                              <span style={{ fontWeight:600, color:'#f1f5f9' }}>{db.name}</span>
                            </div>
                          </td>
                          <td className="adm-td" style={{ fontFamily:'monospace', color:'#6d28d9' }}>@{db.username}</td>
                          <td className="adm-td">{db.phone}</td>
                          <td className="adm-td" style={{ fontFamily:'monospace', color:'#475569' }}>{db.password}</td>
                          <td className="adm-td">
                            <div style={{ display:'flex', gap:'6px' }}>
                              <IconBtn color="blue" onClick={()=>openEditDriver(db)}><Edit size={14}/></IconBtn>
                              <IconBtn color="red" onClick={()=>deleteDeliveryBoy(db.id)}><Trash2 size={14}/></IconBtn>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="adm-mobile-list" style={{ flexDirection:'column', gap:'10px' }}>
                {deliveryBoys.length===0 && <div style={{ textAlign:'center', padding:'40px', color:'#475569' }}>No drivers yet.</div>}
                {deliveryBoys.map(db=>(
                  <div key={db.id} className="adm-card" style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:'linear-gradient(135deg,#6d28d9,#5b21b6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'white', fontSize:'0.95rem', flexShrink:0 }}>{db.name?.[0]?.toUpperCase()}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, color:'#f1f5f9', fontSize:'0.875rem' }}>{db.name}</div>
                      <div style={{ fontSize:'0.72rem', color:'#6d28d9', fontFamily:'monospace' }}>@{db.username}</div>
                      <div style={{ fontSize:'0.72rem', color:'#64748b', marginTop:'2px' }}>{db.phone}</div>
                    </div>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <IconBtn color="blue" onClick={()=>openEditDriver(db)}><Edit size={13}/></IconBtn>
                      <IconBtn color="red" onClick={()=>deleteDeliveryBoy(db.id)}><Trash2 size={13}/></IconBtn>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* â•â• MODAL: Product â•â• */}
      <Modal open={isProdOpen} onClose={()=>setProdOpen(false)} title={editingProdId ? 'âœï¸ Edit Product' : '+ New Product'}>
        <form onSubmit={handleSaveProduct} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <Field label="Product Name *"><input style={mInput} value={prodForm.name} onChange={e=>setProdForm({...prodForm,name:e.target.value})} required placeholder="e.g. Basmati Rice 1kg"/></Field>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <Field label="Price (â‚¹) *"><input type="number" style={mInput} value={prodForm.price} onChange={e=>setProdForm({...prodForm,price:e.target.value})} required/></Field>
            <Field label="Stock *"><input type="number" style={mInput} value={prodForm.stock} onChange={e=>setProdForm({...prodForm,stock:e.target.value})} required/></Field>
          </div>
          <Field label="Category *">
            <select style={{ ...mInput, appearance:'none' }} value={prodForm.category} onChange={e=>setProdForm({...prodForm,category:e.target.value})} required>
              <option value="">Select category</option>
              {dbCategories.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Product Image *">
            {(prodPreview||prodForm.image_url) && <img src={prodPreview||prodForm.image_url} alt="preview" style={{ width:'72px', height:'72px', objectFit:'cover', borderRadius:'10px', marginBottom:'8px', border:'1px solid rgba(255,255,255,0.1)' }}/>}
            <input type="file" accept="image/*" style={mInput} onChange={e=>{if(e.target.files?.[0]){setProdFile(e.target.files[0]);setProdPreview(URL.createObjectURL(e.target.files[0]));}}}/>
          </Field>
          <Field label="Description"><textarea style={{ ...mInput, resize:'vertical', minHeight:'68px' }} rows="2" value={prodForm.description} onChange={e=>setProdForm({...prodForm,description:e.target.value})}/></Field>
          <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
            <CancelBtn onClick={()=>setProdOpen(false)}/>
            <SaveBtn loading={prodUploading} label="Save Product" editLabel={editingProdId?'Save Changes':null}/>
          </div>
        </form>
      </Modal>

      {/* â•â• MODAL: Category â•â• */}
      <Modal open={isCatOpen} onClose={()=>setCatOpen(false)} title={editingCatId ? 'âœï¸ Edit Category' : '+ New Category'}>
        <form onSubmit={handleSaveCat} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <Field label="Category Name *"><input style={mInput} value={catForm.name} onChange={e=>setCatForm({...catForm,name:e.target.value})} required placeholder="e.g. Dairy & Eggs"/></Field>
          <Field label="Category Image *">
            {(catPreview||catForm.image_url) && <img src={catPreview||catForm.image_url} alt="preview" style={{ width:'72px', height:'72px', objectFit:'cover', borderRadius:'10px', marginBottom:'8px', border:'1px solid rgba(255,255,255,0.1)' }}/>}
            <input type="file" accept="image/*" style={mInput} onChange={e=>{if(e.target.files?.[0]){setCatFile(e.target.files[0]);setCatPreview(URL.createObjectURL(e.target.files[0]));}}}/>
          </Field>
          <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
            <CancelBtn onClick={()=>setCatOpen(false)}/>
            <SaveBtn loading={catUploading} label="Save Category" editLabel={editingCatId?'Save Changes':null}/>
          </div>
        </form>
      </Modal>

      {/* â•â• MODAL: Driver â•â• */}
      <Modal open={isDriverOpen} onClose={()=>setDriverOpen(false)} title={editingDriverId ? 'âœï¸ Edit Driver' : 'ðŸš´ Add Driver'}>
        <form onSubmit={handleSaveDriver} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {[['Full Name','text','name','e.g. Rahul Khan'],['Phone','tel','phone','03XX-XXXXXXX'],['Username','text','username','login handle'],['Password','text','password','min 6 chars']].map(([lbl,type,key,ph])=>(
            <Field key={key} label={`${lbl} *`}>
              <input type={type} style={mInput} value={driverForm[key]} onChange={e=>setDriverForm({...driverForm,[key]:e.target.value})} required placeholder={ph}/>
            </Field>
          ))}
          <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
            <CancelBtn onClick={()=>setDriverOpen(false)}/>
            <SaveBtn label="Save Driver" editLabel={editingDriverId?'Save Changes':null}/>
          </div>
        </form>
      </Modal>
    </div>
  );
}
