import { useState } from 'react';
import { useAppStore } from '../store';
import {
  Truck, CheckCircle2, Package, MapPin, Phone, User,
  LogOut, ShoppingBag, Clock, IndianRupee, Navigation,
  ChevronRight, Star, Zap, Eye, EyeOff, Lock, AlertCircle,
  ArrowRight, CircleDot, Bike
} from 'lucide-react';

/* â”€â”€â”€ status pipeline â”€â”€â”€ */
const STEPS = [
  { status: 'Ready for Delivery', label: 'Accept Order',     next: 'Driver Accepted',  icon: ShoppingBag, color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  { status: 'Driver Accepted',    label: 'Picked Up',        next: 'Out for Delivery', icon: Package,     color: '#6366f1', gradient: 'linear-gradient(135deg,#6366f1,#4338ca)' },
  { status: 'Out for Delivery',   label: 'Mark Delivered',   next: 'Delivered',        icon: CheckCircle2,color: '#6d28d9', gradient: 'linear-gradient(135deg,#6d28d9,#5b21b6)' },
];

const statusMeta = {
  'Ready for Delivery': { label: 'Pending Pickup',    bg: '#fef3c7', color: '#d97706', dot: '#f59e0b' },
  'Driver Accepted':    { label: 'Picked Up',         bg: '#ede9fe', color: '#7c3aed', dot: '#8b5cf6' },
  'Out for Delivery':   { label: 'Out for Delivery',  bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  'Delivered':          { label: 'Delivered âœ“',       bg: '#d1fae5', color: '#065f46', dot: '#8b5cf6' },
};

/* â”€â”€â”€ step progress bar â”€â”€â”€ */
const StepBar = ({ status }) => {
  const steps = ['Ready for Delivery','Driver Accepted','Out for Delivery','Delivered'];
  const idx = steps.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '20px' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: i <= idx
              ? 'linear-gradient(135deg,#6d28d9,#5b21b6)'
              : 'rgba(255,255,255,0.08)',
            border: i <= idx ? 'none' : '1.5px solid rgba(255,255,255,0.15)',
            fontSize: '0.65rem', fontWeight: 800,
            color: i <= idx ? 'white' : '#475569',
            transition: 'all 0.3s',
            boxShadow: i <= idx ? '0 2px 8px rgba(109,40,217,0.4)' : 'none',
          }}>
            {i < idx ? 'âœ“' : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: '3px', borderRadius: '2px',
              background: i < idx
                ? 'linear-gradient(90deg,#6d28d9,#5b21b6)'
                : 'rgba(255,255,255,0.08)',
              transition: 'background 0.4s',
              margin: '0 2px',
            }} />
          )}
        </div>
      ))}
    </div>
  );
};

/* â”€â”€â”€ order card â”€â”€â”€ */
const OrderCard = ({ order, onUpdateStatus }) => {
  const [expanded, setExpanded] = useState(true);
  const meta = statusMeta[order.status] || { label: order.status, bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' };
  const step = STEPS.find(s => s.status === order.status);
  const isDelivered = order.status === 'Delivered';
  const isCOD = order.payment_method === 'cod';

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))',
      border: `1px solid ${isDelivered ? 'rgba(109,40,217,0.3)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: isDelivered
        ? '0 4px 24px rgba(109,40,217,0.15)'
        : '0 4px 24px rgba(0,0,0,0.3)',
      transition: 'all 0.3s',
      marginBottom: '16px',
    }}>
      {/* card header */}
      <div
        style={{
          padding: '16px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer',
          borderBottom: expanded ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: isDelivered
              ? 'linear-gradient(135deg,#6d28d9,#5b21b6)'
              : 'linear-gradient(135deg,#f59e0b,#d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isDelivered
              ? '0 4px 12px rgba(109,40,217,0.4)'
              : '0 4px 12px rgba(245,158,11,0.4)',
          }}>
            {isDelivered ? <CheckCircle2 size={20} color="white" /> : <Bike size={20} color="white" />}
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '0.9rem' }}>
              Order #{order.id.slice(0, 8)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              {order.order_items?.length} item{order.order_items?.length !== 1 ? 's' : ''} Â· {isCOD ? 'Cash on Delivery' : 'Prepaid'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            padding: '4px 10px', borderRadius: '20px',
            background: meta.bg + '22',
            border: `1px solid ${meta.dot}44`,
            color: meta.color, fontSize: '0.68rem', fontWeight: 700,
            letterSpacing: '0.03em',
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: meta.dot, display: 'inline-block', marginRight: '5px', verticalAlign: 'middle' }} />
            {meta.label}
          </span>
          <ChevronRight size={16} color="#475569"
            style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </div>

      {/* expanded body */}
      {expanded && (
        <div style={{ padding: '18px' }}>

          {/* step progress */}
          <StepBar status={order.status} />

          {/* amount chip */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: isCOD ? 'rgba(239,68,68,0.12)' : 'rgba(109,40,217,0.1)',
            border: `1px solid ${isCOD ? 'rgba(239,68,68,0.25)' : 'rgba(109,40,217,0.2)'}`,
            borderRadius: '12px', padding: '12px 16px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IndianRupee size={18} color={isCOD ? '#f87171' : '#c084fc'} />
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {isCOD ? 'Collect Cash' : 'Prepaid Order'}
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.25rem', color: isCOD ? '#f87171' : '#c084fc' }}>
                  â‚¹{order.grand_total}
                </div>
              </div>
            </div>
            {isCOD && (
              <div style={{
                background: 'rgba(239,68,68,0.2)', color: '#f87171',
                fontSize: '0.68rem', fontWeight: 800, padding: '4px 10px',
                borderRadius: '8px', letterSpacing: '0.05em',
              }}>COD</div>
            )}
            {!isCOD && (
              <div style={{
                background: 'rgba(109,40,217,0.2)', color: '#c084fc',
                fontSize: '0.68rem', fontWeight: 800, padding: '4px 10px',
                borderRadius: '8px', letterSpacing: '0.05em',
              }}>PAID</div>
            )}
          </div>

          {/* customer block */}
          <div style={{
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '14px 16px',
            marginBottom: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#6366f1,#4338ca)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, color: 'white', fontSize: '0.85rem', flexShrink: 0,
              }}>
                {order.customer_details?.name?.[0]?.toUpperCase() || 'C'}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>{order.customer_details?.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Customer</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
              <MapPin size={14} color="#f59e0b" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
                {order.customer_details?.address || 'Address not provided'}
              </span>
            </div>
            {/* action buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href={`tel:${order.customer_details?.phone}`}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '10px', borderRadius: '10px',
                  background: 'linear-gradient(135deg,#6d28d9,#5b21b6)',
                  color: 'white', fontWeight: 700, fontSize: '0.8rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(109,40,217,0.3)',
                }}
              >
                <Phone size={14} /> Call
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(order.customer_details?.address || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '10px', borderRadius: '10px',
                  background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
                  color: 'white', fontWeight: 700, fontSize: '0.8rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                }}
              >
                <Navigation size={14} /> Navigate
              </a>
            </div>
          </div>

          {/* items list */}
          <div style={{
            background: 'rgba(15,23,42,0.4)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px', padding: '12px 14px',
            marginBottom: '16px',
          }}>
            <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Items to Deliver
            </div>
            {order.order_items?.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 0',
                borderBottom: idx < order.order_items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '6px',
                    background: 'rgba(109,40,217,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 800, color: '#c084fc',
                  }}>{item.quantity}Ã—</div>
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{item.product?.name}</span>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8' }}>â‚¹{item.quantity * (item.product?.price || 0)}</span>
              </div>
            ))}
          </div>

          {/* action button */}
          {step && (
            <button
              onClick={() => onUpdateStatus(order.id, step.next)}
              style={{
                width: '100%', padding: '15px',
                background: step.gradient,
                color: 'white', border: 'none', borderRadius: '14px',
                fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                fontFamily: 'inherit',
                boxShadow: `0 6px 20px ${step.color}44`,
                letterSpacing: '0.01em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <step.icon size={18} />
              {step.label}
              <ArrowRight size={16} />
            </button>
          )}

          {isDelivered && (
            <div style={{
              width: '100%', padding: '15px',
              background: 'rgba(109,40,217,0.12)',
              border: '1px solid rgba(109,40,217,0.25)',
              color: '#c084fc', borderRadius: '14px',
              fontWeight: 800, fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              textAlign: 'center',
            }}>
              <CheckCircle2 size={18} /> Delivered Successfully ðŸŽ‰
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function DeliveryBoy() {
  const currentDeliveryBoy = useAppStore(s => s.currentDeliveryBoy);
  const loginDeliveryBoy   = useAppStore(s => s.loginDeliveryBoy);
  const logoutDeliveryBoy  = useAppStore(s => s.logoutDeliveryBoy);
  const orders             = useAppStore(s => s.orders);
  const updateOrderStatus  = useAppStore(s => s.updateOrderStatus);

  const [username,   setUsername]   = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [activeTab,  setActiveTab]  = useState('active');

  /* â”€â”€ Login â”€â”€ */
  if (!currentDeliveryBoy) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px', fontFamily: "'Inter', sans-serif",
      }}>
        {/* bg decoration */}
        <div style={{
          position: 'fixed', top: '-80px', right: '-80px',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'fixed', bottom: '-100px', left: '-60px',
          width: '240px', height: '240px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* logo area */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #6d28d9, #5b21b6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(109,40,217,0.45)',
          }}>
            <Bike size={34} color="white" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
            Rider Portal
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>
            Malerkotla Fresh Â· Delivery Partner
          </div>
        </div>

        {/* login card */}
        <div style={{
          background: 'rgba(30,41,59,0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '32px 28px',
          width: '100%', maxWidth: '380px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px' }}>
            Welcome back ðŸ‘‹
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '28px' }}>
            Sign in with your rider credentials
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 14px', borderRadius: '10px', marginBottom: '18px',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171', fontSize: '0.85rem', fontWeight: 600,
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={async e => {
            e.preventDefault();
            setLoading(true); setError('');
            const ok = await loginDeliveryBoy(username, password);
            setLoading(false);
            if (!ok) setError('Invalid username or password');
          }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* username */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#475569" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px',
                    background: 'rgba(15,23,42,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', outline: 'none',
                    color: '#f1f5f9', fontSize: '0.9rem',
                    fontFamily: 'inherit', transition: 'border-color 0.18s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(109,40,217,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            {/* password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#475569" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '12px 44px 12px 42px',
                    background: 'rgba(15,23,42,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', outline: 'none',
                    color: '#f1f5f9', fontSize: '0.9rem',
                    fontFamily: 'inherit', transition: 'border-color 0.18s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(109,40,217,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? 'rgba(109,40,217,0.5)' : 'linear-gradient(135deg, #6d28d9, #5b21b6)',
                color: 'white', border: 'none', borderRadius: '12px',
                fontWeight: 800, fontSize: '0.95rem', cursor: loading ? 'default' : 'pointer',
                fontFamily: 'inherit', marginTop: '4px',
                boxShadow: '0 6px 20px rgba(109,40,217,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <><CircleDot size={18} style={{ animation: 'spin 1s linear infinite' }} /> Logging inâ€¦</>
              ) : (
                <><Zap size={18} /> Login to Dashboard</>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: '#475569', lineHeight: 1.6 }}>
            Don't have credentials?<br />
            Contact your Admin to get access.
          </div>
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* â”€â”€ Dashboard â”€â”€ */
  const myOrders    = orders.filter(o => o.delivery_boy_id === currentDeliveryBoy.id);
  const activeOrders = myOrders.filter(o => o.status !== 'Delivered');
  const doneOrders   = myOrders.filter(o => o.status === 'Delivered');
  const totalEarned  = doneOrders.reduce((s, o) => s + (o.grand_total || 0), 0);

  const displayed = activeTab === 'active' ? activeOrders : doneOrders;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* â”€â”€ Header â”€â”€ */}
      <div style={{
        background: 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 60%, #4c1d95 100%)',
        padding: '20px 18px 28px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* bg circles */}
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', right: '30px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, color: 'white', fontSize: '1.1rem',
              border: '1.5px solid rgba(255,255,255,0.3)',
            }}>
              {currentDeliveryBoy.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Good day,</div>
              <div style={{ fontWeight: 900, color: 'white', fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
                {currentDeliveryBoy.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e9d5ff', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Online Â· Ready</span>
              </div>
            </div>
          </div>
          <button
            onClick={logoutDeliveryBoy}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: 'white', fontWeight: 700, fontSize: '0.8rem',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '10px', marginTop: '20px', position: 'relative', zIndex: 1,
        }}>
          {[
            { label: 'Active',    value: activeOrders.length, icon: Bike },
            { label: 'Delivered', value: doneOrders.length,   icon: CheckCircle2 },
            { label: 'Earned',    value: `â‚¹${totalEarned}`,   icon: IndianRupee },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              borderRadius: '14px', padding: '12px 10px',
              border: '1px solid rgba(255,255,255,0.2)',
              textAlign: 'center',
            }}>
              <s.icon size={16} color="rgba(255,255,255,0.8)" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>{s.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* â”€â”€ Tab bar â”€â”€ */}
      <div style={{
        display: 'flex', gap: '0',
        background: 'rgba(30,41,59,0.8)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 18px',
      }}>
        {[
          { id: 'active',    label: `Active (${activeOrders.length})` },
          { id: 'delivered', label: `Delivered (${doneOrders.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: '14px 12px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 700, fontSize: '0.875rem',
              color: activeTab === t.id ? '#6d28d9' : '#475569',
              borderBottom: activeTab === t.id ? '2px solid #6d28d9' : '2px solid transparent',
              transition: 'all 0.18s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* â”€â”€ Orders list â”€â”€ */}
      <div style={{ padding: '18px 16px', paddingBottom: '40px' }}>
        {displayed.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '56px 24px',
            background: 'rgba(30,41,59,0.4)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '20px', marginTop: '8px',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '14px' }}>
              {activeTab === 'active' ? 'ðŸï¸' : 'âœ…'}
            </div>
            <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: '6px', fontSize: '1rem' }}>
              {activeTab === 'active' ? 'No Active Orders' : 'No Deliveries Yet'}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569' }}>
              {activeTab === 'active'
                ? 'Waiting for the admin to assign orders to you.'
                : 'Completed orders will appear here.'}
            </div>
          </div>
        ) : (
          displayed.map(order => (
            <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
          ))
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
