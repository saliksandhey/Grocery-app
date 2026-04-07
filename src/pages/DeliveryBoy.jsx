import { useState } from 'react';
import { useAppStore } from '../store';
import {
  Phone, User, CheckCircle2,
  MapPin, AlertCircle,
  Zap, Eye, EyeOff, Lock,
  CircleDot, Bike, Map, LogOut
} from 'lucide-react';

/* ─── status pipeline ─── */
const statusMeta = {
  'Packed':           { label: 'Packed',     bg: '#fee2e2', color: '#ef4444' },
  'Out for Delivery': { label: 'On Route',   bg: '#dbeafe', color: '#3b82f6' },
  'Delivered':        { label: 'Delivered',  bg: '#dcfce7', color: '#16a34a' },
};

const STEPS = [
  { status: 'Packed',           label: 'Picked Up',      next: 'Out for Delivery', bg: '#f59e0b' },
  { status: 'Out for Delivery', label: 'Delivered',      next: 'Delivered',        bg: '#22c55e' },
];

/* ─── order card ─── */
const OrderCard = ({ order, onUpdateStatus }) => {
  const meta = statusMeta[order.status] || { label: order.status, bg: '#f1f5f9', color: '#64748b' };
  const step = STEPS.find(s => s.status === order.status);

  return (
    <div className="db-card">
      {/* Top: Order ID & Status */}
      <div className="db-card-top">
        <div className="db-order-id">Order #{order.id.slice(0, 6).toUpperCase()}</div>
        <div className="db-badge" style={{ background: meta.bg, color: meta.color }}>
          {meta.label}
        </div>
      </div>

      {/* Customer block */}
      <div className="db-customer-block">
        <div className="db-customer-row">
          <div className="db-avatar"><User size={18} color="#475569" /></div>
          <div className="db-customer-name">{order.customer_details?.name || 'Guest User'}</div>
        </div>
        <div className="db-address-row">
          <MapPin size={18} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
          <div className="db-address-text">
            {order.customer_details?.address || 'No address provided'}
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="db-amount-row">
        <span className="db-amount-label">Amount to Collect</span>
        <span className="db-amount-value">₹{order.grand_total}</span>
      </div>

      {/* Action links */}
      <div className="db-action-links">
        <a href={`tel:${order.customer_details?.phone}`} className="db-link db-link-call">
          <Phone size={20} /> Call Customer
        </a>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(order.customer_details?.address || '')}`}
          target="_blank" rel="noreferrer"
          className="db-link db-link-map"
        >
          <Map size={20} /> Open in Google Maps
        </a>
      </div>

      {/* Status action button */}
      {step && order.status !== 'Delivered' && (
        <button
          className="db-action-btn"
          style={{ background: step.bg }}
          onClick={() => onUpdateStatus(order.id, step.next, 'delivery')}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {step.label}
        </button>
      )}

      {order.status === 'Delivered' && (
        <div className="db-delivered-badge">
          <CheckCircle2 size={20} /> Delivered Successfully 🎉
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function DeliveryBoy() {
  const currentDeliveryBoy = useAppStore(s => s.currentDeliveryBoy);
  const loginDeliveryBoy   = useAppStore(s => s.loginDeliveryBoy);
  const logoutDeliveryBoy  = useAppStore(s => s.logoutDeliveryBoy);
  const orders             = useAppStore(s => s.orders);
  const updateOrderStatus  = useAppStore(s => s.updateOrderStatus);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  /* ─── Login Screen ─── */
  if (!currentDeliveryBoy) {
    return (
      <div className="db-login-root">
        <style>{CSS}</style>
        <div className="db-login-hero">
          <div className="db-login-icon"><Bike size={40} color="white" /></div>
          <h1 className="db-login-title">Rider Login</h1>
          <p className="db-login-sub">Malerkotla Fresh · Delivery Partner</p>
        </div>

        <div className="db-login-card">
          {error && (
            <div className="db-error-box">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          <form
            onSubmit={async e => {
              e.preventDefault();
              setLoading(true); setError('');
              const ok = await loginDeliveryBoy(username, password);
              setLoading(false);
              if (!ok) setError('Invalid username or password');
            }}
            className="db-login-form"
          >
            <div className="db-field">
              <label className="db-label">Username</label>
              <div className="db-input-wrap">
                <User size={20} color="#94a3b8" className="db-input-icon" />
                <input
                  type="text" placeholder="Enter username"
                  value={username} onChange={e => setUsername(e.target.value)}
                  required className="db-input"
                />
              </div>
            </div>

            <div className="db-field">
              <label className="db-label">Password</label>
              <div className="db-input-wrap">
                <Lock size={20} color="#94a3b8" className="db-input-icon" />
                <input
                  type={showPass ? 'text' : 'password'} placeholder="Enter password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required className="db-input db-input-pass"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="db-eye-btn">
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="db-submit-btn">
              {loading
                ? <><CircleDot size={22} style={{ animation: 'dbSpin 1s linear infinite' }} /> Logging in…</>
                : <><Zap size={22} /> Login</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ─── Dashboard ─── */
  const myOrders     = orders.filter(o => o.delivery_boy_id === currentDeliveryBoy.id);
  const activeOrders = myOrders.filter(o => o.status !== 'Delivered');
  const doneOrders   = myOrders.filter(o => o.status === 'Delivered');
  const todayEarnings = doneOrders.reduce((acc, o) => acc + (o.grand_total || 0), 0);

  return (
    <div className="db-root">
      <style>{CSS}</style>

      {/* Header */}
      <header className="db-header">
        <div className="db-header-title">My Deliveries</div>
        <div className="db-header-right">
          <span className="db-rider-name">{currentDeliveryBoy.name}</span>
          <button onClick={logoutDeliveryBoy} className="db-logout-btn" title="Logout">
            <LogOut size={20} color="#475569" />
          </button>
        </div>
      </header>

      <div className="db-body">
        {/* Earnings card */}
        <div className="db-earnings-card">
          <div className="db-earnings-block">
            <div className="db-earnings-label">Today's Earnings</div>
            <div className="db-earnings-value">₹{todayEarnings}</div>
          </div>
          <div className="db-earnings-divider" />
          <div className="db-earnings-block db-earnings-block-right">
            <div className="db-earnings-label">Deliveries Done</div>
            <div className="db-earnings-value db-earnings-value-white">{doneOrders.length}</div>
          </div>
        </div>

        {/* Orders heading */}
        <div className="db-orders-header">
          <span className="db-orders-title">Active Orders</span>
          <span className="db-orders-count">
            {activeOrders.length} {activeOrders.length === 1 ? 'Order' : 'Orders'}
          </span>
        </div>

        {/* Orders list */}
        {activeOrders.length === 0 ? (
          <div className="db-empty-state">
            <div className="db-empty-icon"><CheckCircle2 size={32} color="#94a3b8" /></div>
            <div className="db-empty-title">You're all caught up!</div>
            <div className="db-empty-sub">Waiting for new orders to be assigned.</div>
          </div>
        ) : (
          <div className="db-orders-grid">
            {activeOrders.map(order => (
              <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Scoped CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  @keyframes dbSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .db-root, .db-login-root {
    min-height: 100vh;
    font-family: 'Inter', system-ui, sans-serif;
    box-sizing: border-box;
  }

  /* ── Login ── */
  .db-login-root {
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
  }
  .db-login-hero { text-align: center; margin-bottom: 36px; }
  .db-login-icon {
    width: 80px; height: 80px; border-radius: 24px; background: #10b981;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px; box-shadow: 0 12px 32px rgba(16,185,129,0.3);
  }
  .db-login-title { font-size: 2rem; font-weight: 900; color: #1e293b; margin: 0 0 6px; }
  .db-login-sub { font-size: 0.9rem; color: #64748b; margin: 0; }

  .db-login-card {
    background: white; border-radius: 24px; padding: 32px 28px;
    width: 100%; max-width: 420px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.06);
  }
  .db-error-box {
    display: flex; align-items: center; gap: 10px;
    padding: 16px; border-radius: 12px; margin-bottom: 24px;
    background: #fee2e2; color: #ef4444; font-size: 0.9rem; font-weight: 700;
  }
  .db-login-form { display: flex; flex-direction: column; gap: 20px; }
  .db-field { display: flex; flex-direction: column; gap: 8px; }
  .db-label { font-size: 0.9rem; font-weight: 800; color: #475569; }
  .db-input-wrap { position: relative; }
  .db-input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); pointer-events: none; }
  .db-input {
    width: 100%; padding: 16px 16px 16px 48px;
    background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 14px;
    font-size: 1rem; font-weight: 600; color: #1e293b; outline: none;
    font-family: inherit; box-sizing: border-box; transition: border-color 0.2s;
  }
  .db-input:focus { border-color: #10b981; }
  .db-input-pass { padding-right: 48px; }
  .db-eye-btn {
    position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: #94a3b8;
    display: flex; align-items: center;
  }
  .db-submit-btn {
    width: 100%; padding: 18px; margin-top: 8px;
    background: #10b981; color: white; border: none; border-radius: 14px;
    font-size: 1.1rem; font-weight: 800; cursor: pointer; font-family: inherit;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    box-shadow: 0 8px 24px rgba(16,185,129,0.3); transition: opacity 0.2s;
  }
  .db-submit-btn:disabled { opacity: 0.7; cursor: default; }

  /* ── Dashboard ── */
  .db-root { background: #f1f5f9; }

  .db-header {
    background: white; padding: 18px 20px;
    display: flex; justify-content: space-between; align-items: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04); position: sticky; top: 0; z-index: 10;
  }
  .db-header-title { font-size: 1.4rem; font-weight: 900; color: #1e293b; }
  .db-header-right { display: flex; align-items: center; gap: 12px; }
  .db-rider-name { font-size: 0.9rem; font-weight: 700; color: #475569; }
  .db-logout-btn {
    background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 50%;
    width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s; flex-shrink: 0;
  }
  .db-logout-btn:hover { background: #fee2e2; border-color: #fecaca; }

  .db-body { padding: 20px 16px 40px; max-width: 900px; margin: 0 auto; }

  .db-earnings-card {
    background: linear-gradient(135deg, #1e293b, #0f172a);
    border-radius: 24px; padding: 24px 28px; color: white;
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px; box-shadow: 0 12px 32px rgba(15,23,42,0.2);
    gap: 16px;
  }
  .db-earnings-block { display: flex; flex-direction: column; gap: 4px; }
  .db-earnings-block-right { text-align: right; }
  .db-earnings-divider { width: 1px; background: rgba(255,255,255,0.15); align-self: stretch; }
  .db-earnings-label { font-size: 0.85rem; color: #94a3b8; font-weight: 700; }
  .db-earnings-value { font-size: 2rem; font-weight: 900; letter-spacing: -0.02em; color: #10b981; }
  .db-earnings-value-white { color: white; }

  .db-orders-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;
  }
  .db-orders-title { font-size: 1.2rem; font-weight: 900; color: #1e293b; }
  .db-orders-count {
    background: #e0e7ff; color: #4f46e5;
    padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 800;
  }

  /* Grid: 1 col on mobile, 2 on tablet+ */
  .db-orders-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  /* Card */
  .db-card {
    background: white; border-radius: 20px; padding: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;
  }
  .db-card-top {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;
  }
  .db-order-id { font-size: 1.1rem; font-weight: 800; color: #1e293b; }
  .db-badge { padding: 6px 12px; border-radius: 8px; font-size: 0.82rem; font-weight: 800; }

  .db-customer-block {
    background: #f8fafc; padding: 16px; border-radius: 14px; margin-bottom: 16px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .db-customer-row { display: flex; align-items: center; gap: 10px; }
  .db-avatar {
    width: 36px; height: 36px; border-radius: 50%; background: #e2e8f0;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .db-customer-name { font-size: 1rem; font-weight: 700; color: #334155; }
  .db-address-row { display: flex; align-items: flex-start; gap: 8px; }
  .db-address-text { font-size: 0.9rem; color: #475569; line-height: 1.5; font-weight: 500; }

  .db-amount-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 16px; border: 2px dashed #e2e8f0; border-radius: 14px; margin-bottom: 16px;
  }
  .db-amount-label { font-size: 0.9rem; color: #64748b; font-weight: 700; }
  .db-amount-value { font-size: 1.35rem; font-weight: 900; color: #10b981; }

  .db-action-links { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
  .db-link {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    padding: 16px; border-radius: 14px; text-decoration: none;
    font-weight: 800; font-size: 1rem; transition: opacity 0.2s; font-family: inherit;
  }
  .db-link:active { opacity: 0.8; }
  .db-link-call { background: #f1f5f9; color: #1e293b; }
  .db-link-map  { background: #eff6ff; color: #2563eb; }

  .db-action-btn {
    width: 100%; padding: 18px; border-radius: 14px;
    color: white; border: none; font-size: 1.1rem; font-weight: 800; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    font-family: inherit; transition: transform 0.1s, opacity 0.2s; letter-spacing: 0.01em;
  }
  .db-action-btn:hover { opacity: 0.92; }

  .db-delivered-badge {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: #f0fdf4; color: #16a34a; border-radius: 14px; padding: 16px;
    font-weight: 800; font-size: 1rem;
  }

  .db-empty-state {
    text-align: center; padding: 60px 20px;
    background: white; border-radius: 24px; border: 2px dashed #e2e8f0;
  }
  .db-empty-icon {
    width: 64px; height: 64px; background: #f1f5f9; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
  }
  .db-empty-title { font-size: 1.1rem; font-weight: 800; color: #334155; margin-bottom: 6px; }
  .db-empty-sub { font-size: 0.9rem; color: #64748b; }

  /* ── Responsive ── */
  @media (min-width: 640px) {
    .db-body { padding: 28px 32px 60px; }
    .db-header { padding: 20px 32px; }
    .db-earnings-value { font-size: 2.4rem; }
    .db-orders-grid { grid-template-columns: 1fr 1fr; }
    .db-action-links { flex-direction: row; }
    .db-link { flex: 1; }
  }

  @media (min-width: 1024px) {
    .db-header { padding: 20px 40px; }
    .db-body { padding: 36px 40px 60px; }
    .db-orders-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
    .db-earnings-card { padding: 28px 36px; }
  }
`;
