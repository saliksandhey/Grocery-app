import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Trash2, ArrowLeft, Plus, Minus, Tag, ChevronRight } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const currentUser = useAppStore(state => state.currentUser);
  const cart = useAppStore(state => state.cart);
  const updateQty = useAppStore(state => state.updateQty);
  const removeFromCart = useAppStore(state => state.removeFromCart);
  const clearCart = useAppStore(state => state.clearCart);
  const isStoreOpen = useAppStore(state => state.isStoreOpen);
  
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Smooth skeleton load for premium app feel
    const t = setTimeout(() => setIsReady(true), 350);
    return () => {
       clearTimeout(t);
       window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'WELCOME50') {
      setPromoStatus({ message: '₹50 discount applied!', type: 'success', discount: 50 });
    } else if (promoCode.trim() !== '') {
      setPromoStatus({ message: 'Invalid or expired promo code', type: 'error', discount: 0 });
    }
  };

  const itemTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryCharge = itemTotal > 299 || itemTotal === 0 ? 0 : 30;
  const discount = promoStatus?.type === 'success' ? promoStatus.discount : 0;
  const grandTotal = Math.max(0, itemTotal + deliveryCharge - discount);

  if (!isReady) {
     return (
       <div style={{ background: '#F3F4F6', minHeight: '100vh', padding: '16px' }}>
          <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
          <div style={{ height: '56px', background: '#fff', borderRadius: '12px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: '100px', background: '#fff', borderRadius: '12px', marginBottom: '12px', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: '100px', background: '#fff', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
       </div>
     )
  }

  if (cart.length === 0) {
    return (
      <div style={{ background: '#F3F4F6', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative' }}>
        <style>{`.press-scale { transition: transform 0.15s ease; } .press-scale:active { transform: scale(0.97); }`}</style>
        <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'absolute', top: '16px', left: '16px', cursor: 'pointer' }} onClick={() => navigate(-1)} className="press-scale">
          <ArrowLeft size={20} color="#111827" />
        </div>
        <div style={{ fontSize: '80px', marginBottom: '24px', opacity: 0.5 }}>🛒</div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Your cart is empty</h2>
        <p style={{ color: '#6B7280', marginBottom: '32px', fontSize: '14px' }}>Add items to get started</p>
        <Link to="/home" className="press-scale" style={{ background: '#16A34A', color: '#fff', padding: '14px 32px', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '16px', boxShadow: '0 6px 16px rgba(22,163,74,0.2)' }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#F3F4F6', minHeight: '100vh', paddingBottom: '90px' }}>
      <style>{`
        .press-scale { transition: transform 0.15s ease; }
        .press-scale:active { transform: scale(0.95); }
        .qty-stepper { transition: all 0.2s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, background: '#fff',
        height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
        boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.04)' : 'none',
        borderBottom: scrolled ? 'none' : '1px solid #e5e7eb',
        transition: 'box-shadow 0.2s ease, border-bottom 0.2s ease',
      }}>
        <div className="press-scale" onClick={() => navigate(-1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '-4px' }}>
          <ArrowLeft size={22} color="#111827" strokeWidth={2.5} />
        </div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
          Your Cart
        </div>
        <div className="press-scale" onClick={clearCart} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginRight: '-4px' }}>
          <Trash2 size={18} color="#EF4444" />
        </div>
      </div>

      <div style={{ padding: '12px 16px' }}>

        {/* ── STORE CLOSED BANNER ── */}
        {!isStoreOpen && (
          <div style={{ marginBottom: '16px', animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{
              background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
              border: '1.5px solid #FECDD3',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex', alignItems: 'center', gap: '14px',
              boxShadow: '0 8px 24px rgba(225, 29, 72, 0.08)',
            }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 10px rgba(225, 29, 72, 0.12)' }}>
                <span style={{ fontSize: '20px' }}>🕙</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#9F1239', marginBottom: '2px' }}>Store Closed</div>
                <div style={{ fontSize: '12px', color: '#BE123C', fontWeight: '600' }}>We'll be back at 10:00 AM</div>
              </div>
              <button style={{
                background: '#E11D48', color: '#fff', border: 'none', borderRadius: '10px',
                padding: '8px 12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)', flexShrink: 0
              }}>
                Notify Me
              </button>
            </div>
          </div>
        )}

        {/* ── CART ITEMS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cart.map(item => {
            const hasDiscount = item.orig_price && item.orig_price > item.price;
            return (
              <div key={item.id} style={{ background: '#fff', borderRadius: '12px', padding: '12px', display: 'flex', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'}}>
                {/* Img */}
                <div style={{ width: '72px', height: '72px', background: '#F9FAFB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={item.image_url || item.image || 'https://placehold.co/80x80?text=🛒'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} onError={e => { e.target.src = 'https://placehold.co/80x80?text=🛒'; }} />
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', paddingRight: '8px', lineHeight: 1.3 }}>
                      {item.name}
                    </div>
                    <Trash2 size={16} color="#9CA3AF" style={{ cursor: 'pointer', flexShrink: 0, marginTop: '2px' }} onClick={() => removeFromCart(item.id)} className="press-scale" />
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0' }}>{item.weight || '1 pc'}</div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#16A34A' }}>₹{item.price}</div>
                      {hasDiscount && <div style={{ fontSize: '12px', color: '#9CA3AF', textDecoration: 'line-through' }}>₹{item.orig_price}</div>}
                    </div>

                      {/* Stepper */}
                      <div className="qty-stepper" style={{ display: 'flex', alignItems: 'center', background: '#16A34A', borderRadius: '8px', padding: '2px', boxShadow: '0 4px 10px rgba(22, 163, 74, 0.2)' }}>
                        <button className="press-scale" onClick={() => updateQty(item.id, -1)} style={{ width: '26px', height: '26px', border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Minus size={16} strokeWidth={2.5} />
                        </button>
                        <div style={{ width: '28px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                          {item.qty}
                        </div>
                        <button className="press-scale" onClick={() => updateQty(item.id, 1)} disabled={!isStoreOpen} style={{ width: '26px', height: '26px', border: 'none', background: 'rgba(255,255,255,0.2)', color: !isStoreOpen ? 'rgba(255,255,255,0.4)' : '#fff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: !isStoreOpen ? 'not-allowed' : 'pointer' }}>
                          <Plus size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── PROMO CODE ── */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginTop: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '0 12px', height: '40px', background: '#F9FAFB' }}>
              <Tag size={16} color="#9CA3AF" style={{ marginRight: '8px' }} />
              <input 
                type="text" 
                placeholder="PROMO CODE (e.g. WELCOME50)"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: '13px', fontWeight: '600', color: '#111827', textTransform: 'uppercase', userSelect: 'text', WebkitUserSelect: 'text' }}
              />
            </div>
            <button className="press-scale" onClick={handleApplyPromo} style={{ background: '#16A34A', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 16px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
              Apply
            </button>
          </div>
          {promoStatus && (
            <div style={{ fontSize: '12px', fontWeight: '500', marginTop: '8px', color: promoStatus.type === 'success' ? '#16A34A' : '#EF4444' }}>
              {promoStatus.message}
            </div>
          )}
        </div>

        {/* ── BILL DETAILS ── */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginTop: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Bill Details</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', color: '#4B5563' }}>
            <span>Item Total</span>
            <span style={{ fontWeight: '500', color: '#111827' }}>₹{itemTotal}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', color: '#4B5563' }}>
            <span>Delivery Fee</span>
            <span style={{ fontWeight: '500', color: deliveryCharge === 0 ? '#16A34A' : '#111827' }}>
              {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
            </span>
          </div>

          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', color: '#16A34A', fontWeight: '500' }}>
              <span>Promo Discount</span>
              <span>-₹{discount}</span>
            </div>
          )}
          
          <div style={{ borderTop: '1px dashed #e5e7eb', margin: '12px 0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Grand Total</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', 
        width: '100%', maxWidth: '480px', height: '64px', background: '#fff', 
        borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 100, boxShadow: '0 -4px 12px rgba(0,0,0,0.03)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>Total</span>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>₹{grandTotal}</span>
        </div>

        <button 
          className="press-scale"
          disabled={!isStoreOpen}
          onClick={() => {
            if (!currentUser) {
              navigate('/login', { state: { from: '/checkout' } });
            } else {
              navigate('/checkout');
            }
          }}
          style={{ 
            height: '48px', 
            background: isStoreOpen ? '#16A34A' : '#D1D5DB', 
            color: isStoreOpen ? '#fff' : '#6B7280', 
            border: 'none', borderRadius: '12px', 
            padding: '0 24px', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: isStoreOpen ? '0 4px 14px rgba(22, 163, 74, 0.3)' : 'none', 
            cursor: isStoreOpen ? 'pointer' : 'not-allowed'
          }}
        >
          {isStoreOpen ? (
            <>Proceed to Checkout <ChevronRight size={18} strokeWidth={3} /></>
          ) : (
            'Store Closed'
          )}
        </button>
      </div>
    </div>
  );
}
