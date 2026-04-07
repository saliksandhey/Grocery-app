import { useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, User, Phone, MapPin, ChevronRight,
  Package, ShieldCheck, HelpCircle, Bell, CreditCard, FileText,
  Gift, TrendingDown
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const currentUser = useAppStore(s => s.currentUser);
  const logoutUser = useAppStore(s => s.logoutUser);

  const handleLogout = () => {
    logoutUser();
    navigate('/home', { replace: true });
  };

  if (!currentUser) {
    return (
      <div style={{ background: '#F9FAFB', minHeight: '100vh', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`.press-scale:active { transform: scale(0.97); }`}</style>
        <div style={{ width: '80px', height: '80px', background: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <User size={40} color="#9CA3AF" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Your Profile</h2>
        <p style={{ color: '#6B7280', marginBottom: '32px', fontSize: '14px', textAlign: 'center' }}>Login to see your orders, addresses, and manage account settings.</p>
        <button onClick={() => navigate('/login')} className="press-scale" style={{ width: '100%', maxWidth: '300px', background: '#16A34A', color: '#fff', padding: '14px 0', borderRadius: '12px', fontWeight: '700', fontSize: '15px', border: 'none', marginBottom: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.2)' }}>
          Login to Account
        </button>
        <button onClick={() => navigate('/signup')} className="press-scale" style={{ width: '100%', maxWidth: '300px', background: '#fff', color: '#16A34A', padding: '14px 0', borderRadius: '12px', fontWeight: '600', fontSize: '15px', border: '1px solid #16A34A', cursor: 'pointer' }}>
          Create Account
        </button>
      </div>
    );
  }

  const initial = currentUser.name?.charAt(0).toUpperCase() || 'U';

  const quickActions = [
    { label: 'My Orders', icon: Package, iconColor: '#1d4ed8', onClick: () => navigate('/orders') },
    { label: 'Saved Addresses', icon: MapPin, iconColor: '#b45309', onClick: () => navigate('/addresses') },
    { label: 'Payments', icon: CreditCard, iconColor: '#047857', onClick: () => alert('Payments coming soon!') },
    { label: 'Help & Support', icon: HelpCircle, iconColor: '#be185d', onClick: () => alert('Support coming soon!') }
  ];

  const listItems = [
    { label: 'Order History', icon: Package, onClick: () => navigate('/orders') },
    { label: 'Manage Addresses', icon: MapPin, onClick: () => navigate('/addresses') },
    { label: 'Payment Methods', icon: CreditCard, onClick: () => alert('Coming soon!') },
    { label: 'Notifications', icon: Bell, onClick: () => alert('Coming soon!') },
    { label: 'Privacy Policy', icon: ShieldCheck, onClick: () => alert('Coming soon!') },
    { label: 'Terms & Conditions', icon: FileText, onClick: () => alert('Coming soon!') },
  ];

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', paddingBottom: '90px' }}>
      <style>{`
        .press-scale { transition: transform 0.15s ease; cursor: pointer; }
        .press-scale:active { transform: scale(0.95); }
        .hover-shadow { transition: box-shadow 0.2s ease; }
        .hover-shadow:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
      `}</style>
      
      {/* ── STICKY HEADER ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Profile</h2>
      </div>

      <div style={{ padding: '16px' }}>

        {/* ── TOP HEADER SECTION (PROFILE SUMMARY) ── */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#16A34A', flexShrink: 0, border: '2px solid #e5e7eb' }}>
            {initial}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '2px' }}>{currentUser.name}</h3>
            <div style={{ fontSize: '13px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={12} /> {currentUser.phone}
            </div>
          </div>
          <button className="press-scale" style={{ padding: '6px 12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#16A34A' }}>
            Edit Profile
          </button>
        </div>

        {/* ── OPTIONAL PREMIUM SECTION (FIRE FIRE) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div className="press-scale" style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #dcfce7', position: 'relative', overflow: 'hidden' }}>
             <TrendingDown size={18} color="#16A34A" style={{ marginBottom: '8px' }} />
             <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Your Savings</div>
             <div style={{ fontSize: '16px', fontWeight: '700', color: '#16A34A' }}>₹240.00</div>
          </div>
          <div className="press-scale" style={{ background: '#16A34A', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(22,163,74,0.2)', position: 'relative', overflow: 'hidden', color: '#fff' }}>
             <Gift size={18} color="#fff" style={{ marginBottom: '8px' }} />
             <div style={{ fontSize: '12px', fontWeight: '500', opacity: 0.9 }}>Refer & Earn</div>
             <div style={{ fontSize: '14px', fontWeight: '700' }}>Get ₹100 Off</div>
          </div>
        </div>

        {/* ── QUICK ACTION CARDS (2 COL GRID) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <div key={action.label} className="press-scale hover-shadow" onClick={action.onClick} style={{ background: '#fff', borderRadius: '12px', padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <Icon size={24} color={action.iconColor} strokeWidth={2} />
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>{action.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── ACCOUNT OPTIONS LIST ── */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden', marginBottom: '24px' }}>
          {listItems.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === listItems.length - 1;
            return (
              <div key={item.label} className="press-scale" onClick={item.onClick} style={{ height: '56px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isLast ? 'none' : '1px solid #F3F4F6', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={20} color="#6B7280" strokeWidth={2} />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{item.label}</span>
                </div>
                <ChevronRight size={18} color="#9CA3AF" />
              </div>
            );
          })}
        </div>

        {/* ── LOGOUT BUTTON ── */}
        <button className="press-scale" onClick={handleLogout} style={{ width: '100%', height: '48px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}>
          <LogOut size={18} /> Logout
        </button>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF', marginTop: '24px', fontWeight: '500' }}>Malerkotla Fresh v1.0.0</p>
      </div>
    </div>
  );
}
