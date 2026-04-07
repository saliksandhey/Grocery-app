import { Routes, Route, useLocation } from 'react-router-dom';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Category from './pages/Category';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Tracking from './pages/Tracking';
import OrderHistory from './pages/OrderHistory';
import CategoriesList from './pages/CategoriesList';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import SavedAddresses from './pages/SavedAddresses';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import Admin from './pages/Admin';
import DeliveryBoy from './pages/DeliveryBoy';

export default function App() {
  const location = useLocation();

  const isFullscreenPage = ['/', '/login', '/signup', '/checkout', '/success', '/cart', '/forgot-password', '/addresses'].includes(location.pathname) || location.pathname.startsWith('/product') || location.pathname.startsWith('/tracking');
  const isAdminOrDelivery = location.pathname.startsWith('/admin') || location.pathname.startsWith('/delivery');
  const isCustomerPage = !isAdminOrDelivery;
  
  // Show header only on Admin/Delivery if necessary, but strictly disabled for Customer mobile app layout
  const showHeader = false; 
  const showBottomNav = isCustomerPage && !isFullscreenPage;

  return (
    <div className={isCustomerPage ? 'app-container' : ''}>
      <main className={isCustomerPage ? 'page-content' : ''} style={{ paddingBottom: showBottomNav ? '90px' : '0' }}>
        <Routes>
          {/* Splash */}
          <Route path="/" element={<Splash />} />

          {/* Auth pages â€” public */}
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Customer pages */}
          <Route path="/home"          element={<Home />} />
          <Route path="/categories"    element={<CategoriesList />} />
          <Route path="/category/:id"  element={<Category />} />
          <Route path="/product/:id"   element={<ProductDetail />} />
          <Route path="/cart"          element={<Cart />} />
          <Route path="/checkout"      element={<Checkout />} />
          <Route path="/orders"        element={<OrderHistory />} />
          <Route path="/profile"       element={<Profile />} />
          <Route path="/addresses"     element={<SavedAddresses />} />
          <Route path="/success"       element={<Success />} />
          <Route path="/tracking/:id"  element={<Tracking />} />

          {/* Admin */}
          <Route path="/admin" element={<Admin />} />

          {/* Delivery Boy */}
          <Route path="/delivery" element={<DeliveryBoy />} />
        </Routes>
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
