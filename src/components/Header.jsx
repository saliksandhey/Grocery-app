import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, MapPin, LogOut, User } from 'lucide-react';
import { useAppStore } from '../store';

export default function Header() {
  const navigate = useNavigate();
  const cart = useAppStore(state => state.cart);
  const currentUser = useAppStore(state => state.currentUser);
  const logoutUser = useAppStore(state => state.logoutUser);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <Link to="/home" className="logo">
          <span style={{ fontSize: '22px' }}>ðŸ›’</span>
          Malerkotla Fresh
          <span className="logo-badge">FAST</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '2px' }}>
          <MapPin size={11} color="var(--primary)" />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 500 }}>
            Malerkotla, Punjab Â· 60â€“90 min delivery
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Cart */}
        <Link
          to="/cart"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: totalItems > 0 ? 'var(--primary)' : 'transparent',
            padding: totalItems > 0 ? '7px 12px' : '4px',
            borderRadius: 'var(--radius-md)',
            transition: 'all 0.2s',
          }}
        >
          <ShoppingCart size={21} color={totalItems > 0 ? 'white' : 'var(--text-1)'} />
          {totalItems > 0 && (
            <span style={{ color: 'white', fontSize: '0.78rem', fontWeight: '700' }}>
              {totalItems} Â· â‚¹{totalPrice}
            </span>
          )}
        </Link>

        {/* User indicator / Login button */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '5px 10px', textDecoration: 'none', transition: 'all 0.2s' }}>
              <User size={13} color="var(--primary)" />
              <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#4c1d95', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.name}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              title="Logout"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#9ca3af', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#9ca3af'; }}
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <Link to="/login"
            style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary)', border: '1.5px solid var(--primary)', borderRadius: '8px', padding: '6px 12px', textDecoration: 'none' }}>
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
