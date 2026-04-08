import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { supabase } from '../supabaseClient';
import { ArrowLeft, MapPin, Plus, ChevronRight, Loader2, Star, Check } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const cart = useAppStore(state => state.cart);
  const placeOrder = useAppStore(state => state.placeOrder);
  const currentUser = useAppStore(state => state.currentUser);
  const isStoreOpen = useAppStore(state => state.isStoreOpen);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [manualAddress, setManualAddress] = useState('');
  const [manualLandmark, setManualLandmark] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [payment, setPayment] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loadingAddr, setLoadingAddr] = useState(true);

  const itemTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryCharge = itemTotal > 299 || itemTotal === 0 ? 0 : 30;
  const grandTotal = itemTotal + deliveryCharge;

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/checkout' }, replace: true });
      return;
    }
    fetchAddresses();
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [currentUser, navigate]);

  const fetchAddresses = async () => {
    setLoadingAddr(true);
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('is_default', { ascending: false });
    setAddresses(data || []);
    // Auto-select default
    const def = (data || []).find(a => a.is_default);
    if (def) setSelectedAddr(def.id);
    else if (data?.length) setSelectedAddr(data[0].id);
    setLoadingAddr(false);
  };

  if (!currentUser) return null;

  const finalAddress = showManual
    ? manualAddress.trim()
    : addresses.find(a => a.id === selectedAddr)?.address || '';
  const finalLandmark = showManual
    ? manualLandmark.trim()
    : addresses.find(a => a.id === selectedAddr)?.landmark || '';

  const canOrder = cart.length > 0 && finalAddress && isStoreOpen;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canOrder) {
      if (!isStoreOpen) {
        alert('Store is currently closed. Please order between 10:00 AM - 10:00 PM');
      } else if (cart.length === 0) {
        alert('Your cart is empty');
      } else if (!finalAddress) {
        alert('Please select or enter a delivery address');
      }
      return;
    }
    
    console.log('Submitting order...');
    setPlacing(true);

    const orderData = {
      customer: {
        name: currentUser.name,
        phone: currentUser.phone,
        address: finalAddress,
        landmark: finalLandmark,
      },
      items: cart,
      summary: { itemTotal, deliveryCharge, grandTotal },
      paymentMethod: payment,
    };

    console.log('Order data:', orderData);

    try {
      const result = await placeOrder(orderData);
      console.log('placeOrder result:', result);
      
      if (result) {
        setPlacing(false);
        console.log('Order placed successfully, navigating to success');
        navigate('/success');
      } else {
        setPlacing(false);
        console.error('Order placement failed - result was null');
        alert('Failed to place order. Please check console for details and try again.');
      }
    } catch (error) {
      console.error('Exception during order placement:', error);
      setPlacing(false);
      alert('An error occurred while placing your order: ' + error.message);
    }
  };

  return (
    <div style={{ background: '#F3F4F6', minHeight: '100vh', paddingBottom: '90px' }}>
      <style>{`
        .press-scale { transition: transform 0.15s ease; cursor: pointer; }
        .press-scale:active { transform: scale(0.95); }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.45} }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, background: '#fff', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
        boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.04)' : 'none',
        borderBottom: scrolled ? 'none' : '1px solid #E5E7EB', transition: 'all 0.2s',
      }}>
        <div className="press-scale" onClick={() => navigate(-1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={22} color="#111827" />
        </div>
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Checkout</span>
        <div style={{ width: '32px' }} />
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '12px 16px' }}>

        {/* ── STORE CLOSED BANNER ── */}
        {!isStoreOpen && (
          <div style={{ animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)', marginBottom: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
              border: '1.5px solid #FECDD3',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex', alignItems: 'center', gap: '14px',
              boxShadow: '0 8px 24px rgba(225, 29, 72, 0.08)',
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 10px rgba(225, 29, 72, 0.12)' }}>
                <span style={{ fontSize: '22px' }}>🕙</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#9F1239', marginBottom: '3px' }}>Store Closed</div>
                <div style={{ fontSize: '12px', color: '#BE123C', fontWeight: '600' }}>Ordering resumes from 10:00 AM</div>
              </div>
              <button type="button" style={{
                background: '#E11D48', color: '#fff', border: 'none', borderRadius: '10px',
                padding: '8px 12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)', flexShrink: 0
              }}>Notify Me</button>
            </div>
          </div>
        )}

        {/* ── DELIVERY ADDRESS ── */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} color="#16A34A" /> Delivery Address
            </h3>
            {!showManual && (
              <span className="press-scale" onClick={() => navigate('/addresses')} style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600' }}>
                Manage <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
              </span>
            )}
          </div>

          {/* Saved addresses list */}
          {!showManual && (
            <>
              {loadingAddr ? (
                <div style={{ height: '60px', background: '#F9FAFB', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />
              ) : addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px', color: '#6B7280', fontSize: '13px' }}>
                  No saved addresses yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {addresses.map(addr => {
                    const selected = selectedAddr === addr.id;
                    return (
                      <div key={addr.id} className="press-scale" onClick={() => setSelectedAddr(addr.id)} style={{
                        padding: '12px', borderRadius: '10px', cursor: 'pointer',
                        border: selected ? '1.5px solid #16A34A' : '1.5px solid #E5E7EB',
                        background: selected ? '#F0FDF4' : '#fff', transition: 'all 0.2s',
                        display: 'flex', gap: '10px', alignItems: 'flex-start'
                      }}>
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%', border: selected ? '2px solid #16A34A' : '2px solid #D1D5DB',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px'
                        }}>
                          {selected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16A34A' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>{addr.label}</span>
                            {addr.is_default && (
                              <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '6px', fontWeight: '700' }}>Default</span>
                            )}
                          </div>
                          <p style={{ fontSize: '12px', color: '#4B5563', margin: 0, lineHeight: 1.3 }}>{addr.address}</p>
                          {addr.landmark && <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '2px 0 0' }}>Near {addr.landmark}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button type="button" className="press-scale" onClick={() => setShowManual(true)} style={{
                width: '100%', height: '40px', marginTop: '10px', background: '#fff', border: '1.5px dashed #D1D5DB', borderRadius: '10px',
                color: '#6B7280', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}>
                <Plus size={16} /> Use a different address
              </button>
            </>
          )}

          {/* Manual address form */}
          {showManual && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea value={manualAddress} onChange={e => setManualAddress(e.target.value)} placeholder="House No., Street, Area, City" required style={{
                width: '100%', minHeight: '70px', padding: '10px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13px',
                fontFamily: 'Inter, sans-serif', resize: 'vertical', outline: 'none', boxSizing: 'border-box', background: '#F9FAFB',
              }} />
              <input value={manualLandmark} onChange={e => setManualLandmark(e.target.value)} placeholder="Landmark (optional)" style={{
                width: '100%', height: '44px', padding: '0 10px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13px',
                fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', background: '#F9FAFB',
                userSelect: 'text', WebkitUserSelect: 'text',
              }} />
              {addresses.length > 0 && (
                <button type="button" onClick={() => setShowManual(false)} style={{
                  background: 'none', border: 'none', color: '#16A34A', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', padding: '4px 0'
                }}>
                  ← Use saved address instead
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── PAYMENT ── */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>💳 Payment Method</h3>
          {[['cod', '💵 Cash on Delivery'], ['upi', '📱 UPI (GPay, PhonePe)']].map(([val, label]) => {
            const active = payment === val;
            return (
              <div key={val} className="press-scale" onClick={() => setPayment(val)} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', marginBottom: '8px', cursor: 'pointer',
                border: active ? '1.5px solid #16A34A' : '1.5px solid #E5E7EB', borderRadius: '12px',
                background: active ? '#F0FDF4' : '#fff', transition: 'all 0.2s'
              }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', border: active ? '2px solid #16A34A' : '2px solid #D1D5DB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {active && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16A34A' }} />}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* ── BILL SUMMARY ── */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '14px' }}>🧾 Bill Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px', color: '#4B5563' }}>
            <span>Item Total ({cart.length} items)</span><span style={{ fontWeight: '500', color: '#111827' }}>₹{itemTotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px', color: '#4B5563' }}>
            <span>Delivery Fee</span>
            <span style={{ fontWeight: '500', color: deliveryCharge === 0 ? '#16A34A' : '#111827' }}>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
          </div>
          <div style={{ borderTop: '1px dashed #E5E7EB', marginTop: '10px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Grand Total</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>₹{grandTotal}</span>
          </div>
        </div>
      </form>

      {/* ── BOTTOM CTA ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '480px', height: '64px', background: '#fff',
        borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 100, boxShadow: '0 -4px 12px rgba(0,0,0,0.03)'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>Total</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>₹{grandTotal}</div>
        </div>
        <button
          className="press-scale"
          type="button"
          onClick={handleSubmit}
          disabled={!canOrder || placing}
          style={{
            height: '48px', padding: '0 24px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '700',
            background: canOrder ? 'linear-gradient(90deg, #16A34A, #22C55E)' : '#E5E7EB',
            color: canOrder ? '#fff' : '#9CA3AF', cursor: canOrder ? 'pointer' : 'not-allowed',
            boxShadow: canOrder ? '0 4px 14px rgba(22,163,74,0.3)' : 'none',
            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
          }}
        >
          {placing ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Placing...</> : isStoreOpen ? 'Place Order' : '🔴 Store Closed'}
        </button>
      </div>
    </div>
  );
}
