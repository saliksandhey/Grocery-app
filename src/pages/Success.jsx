import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAppStore } from '../store';

export default function Success() {
  const orders = useAppStore(state => state.orders);
  // Assuming the newest order is at index 0 because placeOrder unshifts it.
  const latestOrder = orders[0];

  if (!latestOrder) {
    return <div style={{textAlign:'center', marginTop:'50px'}}>No order found.</div>;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', backgroundColor: 'var(--secondary-color)' }}>
      <div style={{ color: 'var(--primary)', marginBottom: '24px' }}>
        <CheckCircle size={80} strokeWidth={1.5} />
      </div>
      
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '12px' }}>Order Placed Successfully!</h1>
      <p style={{ color: 'var(--text-3)', marginBottom: '32px', fontSize: '1rem' }}>
        Thank you for shopping with us. Your order will be delivered in <strong style={{ color: 'var(--text-1)' }}>60-90 minutes</strong>.
      </p>
      
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', width: '100%', marginBottom: '32px', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Order #{latestOrder.id}</h3>
        <p style={{ color: 'var(--text-3)', marginBottom: '16px' }}>Payment Method: {latestOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI'}</p>
        <Link to={`/tracking/${latestOrder.id}`} className="btn btn-primary" style={{ width: '100%' }}>
          Track Order
        </Link>
      </div>

      <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="btn" style={{ width: '100%', border: '1px solid var(--border)', backgroundColor: 'white' }}>
        Contact on WhatsApp
      </a>
      
      <Link to="/home" style={{ marginTop: '24px', color: 'var(--primary)', fontWeight: '600' }}>
        Back to Home
      </Link>
    </div>
  );
}
