import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingCart, User } from 'lucide-react';

const tabs = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/categories', icon: LayoutGrid, label: 'Categories' },
  { to: '/cart', icon: ShoppingCart, label: 'Cart' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <div className="nav-icon">
            <Icon size={21} strokeWidth={1.8} />
          </div>
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
