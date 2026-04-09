import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Clock, MapPin, Phone, Share2, ArrowRight, Home } from 'lucide-react';
import { useAppStore } from '../store';

export default function Success() {
  const navigate = useNavigate();
  const orders = useAppStore(state => state.orders);
  const latestOrder = orders[0];
  const [isReady, setIsReady] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setIsReady(true);
    setTimeout(() => setShowContent(true), 300);
  }, []);

  if (!latestOrder) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
        <Package size={64} color="#D1D5DB" strokeWidth={1.5} />
        <p style={{ marginTop: '16px', color: '#6B7280', fontSize: '14px' }}>No order found</p>
        <Link to="/home" style={{ marginTop: '16px', color: '#16A34A', fontWeight: '600', fontSize: '14px' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  const orderDate = new Date(latestOrder.created_at).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const estimatedDelivery = new Date(new Date(latestOrder.created_at).getTime() + 60 * 60 * 1000).toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handleShare = () => {
    const text = `Order #${latestOrder.id.slice(0, 8).toUpperCase()} placed successfully! Total: ₹${latestOrder.grand_total}`;
    if (navigator.share) {
      navigator.share({ title: 'Order Confirmation', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Order details copied to clipboard!');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #ECFDF5 0%, #F9FAFB 40%)',
      padding: '0 0 32px 0',
      opacity: isReady ? 1 : 0,
      transition: 'opacity 0.4s ease'
    }}>
      <style>{`
        @keyframes checkPop {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(10deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .press-scale { transition: transform 0.15s ease; cursor: pointer; }
        .press-scale:active { transform: scale(0.97); }
      `}</style>

      {/* Success Animation */}
      <div style={{
        padding: '48px 24px 32px',
        textAlign: 'center',
        animation: showContent ? 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none'
      }}>
        {/* Animated Check Circle */}
        <div style={{
          width: '100px',
          height: '100px',
          margin: '0 auto 24px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 32px rgba(22, 163, 74, 0.3)',
          animation: showContent ? 'checkPop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
          position: 'relative'
        }}>
          <CheckCircle size={56} color="#fff" strokeWidth={2.5} />
          {/* Decorative ring */}
          <div style={{
            position: 'absolute',
            inset: '-8px',
            borderRadius: '50%',
            border: '3px solid rgba(22, 163, 74, 0.2)',
            animation: 'pulse 2s ease-in-out infinite'
          }} />
        </div>

        <h1 style={{
          fontSize: '26px',
          fontWeight: '800',
          color: '#111827',
          marginBottom: '8px',
          letterSpacing: '-0.02em'
        }}>
          Order Placed! 🎉
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#6B7280',
          lineHeight: 1.5,
          maxWidth: '320px',
          margin: '0 auto'
        }}>
          Your order has been confirmed and will be delivered soon
        </p>
      </div>

      {/* Order Details Card */}
      <div style={{
        padding: '0 16px',
        animation: showContent ? 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards' : 'none',
        opacity: showContent ? 1 : 0
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
          border: '1px solid #E5E7EB'
        }}>
          {/* Order Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '16px',
            borderBottom: '1px solid #F3F4F6',
            marginBottom: '16px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Order ID</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                #{latestOrder.id.slice(0, 8).toUpperCase()}
              </div>
            </div>
            <div style={{
              background: '#DCFCE7',
              color: '#166534',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              {latestOrder.status}
            </div>
          </div>

          {/* Delivery Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Clock size={20} color='#F59E0B' />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600', marginBottom: '2px' }}>Estimated Delivery</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{estimatedDelivery}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <MapPin size={20} color='#3B82F6' />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600', marginBottom: '2px' }}>Delivery Address</div>
                <div style={{ fontSize: '14px', color: '#111827', lineHeight: 1.4 }}>
                  {latestOrder.customer_details?.address || 'Address not available'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#F3E8FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Package size={20} color='#A855F7' />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600', marginBottom: '2px' }}>Payment Method</div>
                <div style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>
                  {latestOrder.payment_method === 'cod' ? '💵 Cash on Delivery' : '✅ Prepaid'}
                </div>
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px dashed #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600', marginBottom: '2px' }}>Total Amount</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#16A34A' }}>₹{latestOrder.grand_total}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Order placed at</div>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>{orderDate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animation: showContent ? 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards' : 'none',
        opacity: showContent ? 1 : 0
      }}>
        {/* Track Order Button */}
        <Link
          to={`/tracking/${latestOrder.id}`}
          className="press-scale"
          style={{
            height: '52px',
            background: 'linear-gradient(90deg, #16A34A 0%, #22C55E 100%)',
            color: '#fff',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: '700',
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(22, 163, 74, 0.3)'
          }}
        >
          <MapPin size={20} />
          Track Your Order
          <ArrowRight size={18} />
        </Link>

        {/* Secondary Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* WhatsApp Button */}
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="press-scale"
            style={{
              flex: 1,
              height: '48px',
              background: '#fff',
              border: '1.5px solid #E5E7EB',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#111827',
              textDecoration: 'none'
            }}
          >
            <Phone size={18} color='#25D366' />
            WhatsApp
          </a>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="press-scale"
            style={{
              flex: 1,
              height: '48px',
              background: '#fff',
              border: '1.5px solid #E5E7EB',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#111827',
              cursor: 'pointer'
            }}
          >
            <Share2 size={18} />
            Share
          </button>
        </div>

        {/* Back to Home */}
        <Link
          to="/home"
          className="press-scale"
          style={{
            height: '48px',
            background: '#fff',
            border: '1.5px solid #E5E7EB',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#6B7280',
            textDecoration: 'none',
            marginTop: '8px'
          }}
        >
          <Home size={18} />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
