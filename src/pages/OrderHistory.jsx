import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, ShoppingBag, ChevronDown, ChevronRight } from 'lucide-react';

const STATUS_CONFIG = {
  pending:            { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  packed:             { bg: '#DBEAFE', color: '#1E40AF', label: 'Packed' },
  'out for delivery': { bg: '#E0F2FE', color: '#0369A1', label: 'Out for Delivery' },
  delivered:          { bg: '#DCFCE7', color: '#166534', label: 'Delivered' },
  cancelled:          { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
};

const FILTER_OPTIONS = ['All', 'Delivered', 'Pending', 'Cancelled'];

function getStatusCfg(status = '') {
  return STATUS_CONFIG[status.toLowerCase()] || { bg: '#F3F4F6', color: '#374151', label: status };
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ width: '80px', height: '14px', background: '#F3F4F6', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: '60px', height: '20px', background: '#F3F4F6', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />
      </div>
      <div style={{ width: '120px', height: '12px', background: '#F3F4F6', borderRadius: '6px', marginBottom: '12px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: '70px', height: '16px', background: '#F3F4F6', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '80px', height: '32px', background: '#F3F4F6', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: '80px', height: '32px', background: '#F3F4F6', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
    </div>
  );
}

export default function OrderHistory() {
  const navigate = useNavigate();
  const currentUser = useAppStore(s => s.currentUser);
  const allOrders = useAppStore(s => s.orders);
  const addToCart = useAppStore(s => s.addToCart);
  const clearCart = useAppStore(s => s.clearCart);
  const isStoreOpen = useAppStore(s => s.isStoreOpen);

  const [scrolled, setScrolled] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), 500);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); };
  }, []);

  if (!currentUser) {
    return (
      <div style={{ background: '#F9FAFB', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.4 }}>📦</div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Login to view orders</h2>
        <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', marginBottom: '24px' }}>Track and manage all your deliveries in one place.</p>
        <button onClick={() => navigate('/login')} style={{ background: '#16A34A', color: '#fff', padding: '12px 32px', borderRadius: '12px', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
          Login / Sign Up
        </button>
      </div>
    );
  }

  const myOrders = allOrders.filter(o => o.customer_details?.phone === currentUser.phone);
  const filteredOrders = activeFilter === 'All'
    ? myOrders
    : myOrders.filter(o => o.status?.toLowerCase() === activeFilter.toLowerCase());

  const handleReorder = (order) => {
    clearCart();
    order.order_items?.forEach(item => {
      if (item.product) {
        addToCart({ id: item.product.id || Math.random(), name: item.product.name, price: item.price, image_url: item.product.image_url });
      }
    });
    navigate('/cart');
  };

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', paddingBottom: '90px' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.45} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .press-scale { transition: transform 0.15s ease; cursor: pointer; }
        .press-scale:active { transform: scale(0.97); }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { scrollbar-width: none; }
        .order-card-hover { transition: box-shadow 0.2s ease, transform 0.15s ease; }
        .order-card-hover:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.06); transform: translateY(-1px); }
      `}</style>

      {/* ── STICKY HEADER ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, background: '#fff', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
        boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.04)' : 'none',
        borderBottom: scrolled ? 'none' : '1px solid #F3F4F6', transition: 'all 0.2s',
      }}>
        <div className="press-scale" onClick={() => navigate(-1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={22} color="#111827" />
        </div>
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Your Orders</span>
        <div style={{ width: '32px' }} />
      </div>

      {/* ── FILTER PILLS ── */}
      <div className="hide-scroll" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 16px' }}>
        {FILTER_OPTIONS.map(f => {
          const active = activeFilter === f;
          return (
            <div key={f} className="press-scale" onClick={() => setActiveFilter(f)} style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', flexShrink: 0, cursor: 'pointer',
              background: active ? '#16A34A' : '#fff', color: active ? '#fff' : '#4B5563',
              border: active ? '1px solid #16A34A' : '1px solid #E5E7EB',
              boxShadow: active ? '0 4px 10px rgba(22,163,74,0.2)' : 'none',
              transition: 'all 0.2s',
            }}>
              {f}
            </div>
          );
        })}
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* ── LOADING ── */}
        {!isReady && (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        )}

        {/* ── EMPTY STATE ── */}
        {isReady && filteredOrders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 16px' }}>
            <ShoppingBag size={56} color="#D1D5DB" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>No orders yet</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px' }}>Start shopping to see your orders here</p>
            <button onClick={() => navigate('/home')} className="press-scale" style={{ background: '#16A34A', color: '#fff', padding: '12px 28px', borderRadius: '12px', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
              Shop Now
            </button>
          </div>
        )}

        {/* ── ORDER CARDS ── */}
        {isReady && filteredOrders.map(order => {
          const cfg = getStatusCfg(order.status);
          const isOpen = expanded === order.id;
          const date = new Date(order.created_at).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
          });
          const items = order.order_items || [];
          const previewItems = items.slice(0, 3);
          const extraCount = items.length - previewItems.length;

          return (
            <div key={order.id} className="order-card-hover" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              
              {/* TOP ROW */}
              <div style={{ padding: '12px 12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={14} color="#6B7280" />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: '20px', background: cfg.bg, color: cfg.color, fontSize: '11px', fontWeight: '700' }}>
                    {cfg.label}
                  </div>
                </div>

                {/* DATE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', color: '#6B7280', fontSize: '12px' }}>
                  <Clock size={12} /> {date}
                </div>

                {/* PRODUCT PREVIEW */}
                {previewItems.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <div style={{ display: 'flex' }}>
                      {previewItems.map((item, idx) => (
                        <div key={idx} style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F9FAFB', border: '2px solid #fff', marginLeft: idx > 0 ? '-8px' : '0', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: previewItems.length - idx }}>
                          {item.product?.image_url
                            ? <img src={item.product.image_url} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }} />
                            : <span style={{ fontSize: '16px' }}>🛒</span>
                          }
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>
                      {items.length} item{items.length !== 1 ? 's' : ''}{extraCount > 0 ? ` (+${extraCount} more)` : ''}
                    </span>
                  </div>
                )}

                {/* BOTTOM ROW */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#16A34A' }}>₹{order.grand_total}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="press-scale" onClick={() => setExpanded(isOpen ? null : order.id)} style={{
                      height: '32px', padding: '0 14px', background: '#fff', color: '#374151', border: '1.5px solid #E5E7EB',
                      borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      Details {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <button className="press-scale" onClick={() => { if(isStoreOpen) handleReorder(order); }} disabled={!isStoreOpen} style={{
                      height: '32px', padding: '0 14px', background: isStoreOpen ? '#16A34A' : '#9CA3AF', color: '#fff', border: 'none',
                      borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: isStoreOpen ? 'pointer' : 'not-allowed', boxShadow: isStoreOpen ? '0 2px 8px rgba(22,163,74,0.2)' : 'none'
                    }}>
                      Reorder
                    </button>
                  </div>
                </div>
              </div>

              {/* EXPANDED DETAILS */}
              {isOpen && (
                <div style={{ borderTop: '1px dashed #E5E7EB', padding: '12px', background: '#FAFAFA', animation: 'slideDown 0.2s ease' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Order Items</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    {items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ minWidth: '24px', height: '24px', background: '#DCFCE7', color: '#166534', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800' }}>
                            {item.quantity}×
                          </div>
                          <span style={{ color: '#374151', fontWeight: '500' }}>{item.product?.name || 'Product'}</span>
                        </div>
                        <span style={{ fontWeight: '700', color: '#111827' }}>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280' }}>
                      <span>Item Total</span><span>₹{order.item_total}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280' }}>
                      <span>Delivery</span><span style={{ color: order.delivery_charge === 0 ? '#16A34A' : '#111827', fontWeight: '600' }}>{order.delivery_charge === 0 ? 'FREE' : `₹${order.delivery_charge}`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', color: '#111827', borderTop: '1px solid #E5E7EB', paddingTop: '8px', marginTop: '2px' }}>
                      <span>Paid via {order.payment_method?.toUpperCase()}</span>
                      <span>₹{order.grand_total}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
