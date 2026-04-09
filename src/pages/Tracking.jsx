import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Package, Truck, Home, Clock, Phone, MapPin, Navigation } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { supabase } from '../supabaseClient';

export default function Tracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const orders = useAppStore(state => state.orders);
  const order = orders.find(o => o.id === id);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [localOrder, setLocalOrder] = useState(null);

  // Set ready state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Update local order when store order changes
  useEffect(() => {
    if (order) {
      console.log('📦 Order data received:', order);
      setLocalOrder(order);
    }
  }, [order]);

  // Real-time subscription for this specific order
  useEffect(() => {
    if (!id) return;

    console.log('🎧 Setting up real-time tracking for order:', id);

    const channel = supabase
      .channel(`tracking-order-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`
        },
        async (payload) => {
          console.log('🔔 Order status updated in real-time:', payload.new);
          
          // Fetch the complete order data with items
          const { data: updatedOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();
          
          if (updatedOrder) {
            // Fetch order items
            const { data: items } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', id);
            
            const completeOrder = {
              ...updatedOrder,
              order_items: items || []
            };
            
            console.log('✅ Updated order data:', completeOrder);
            setLocalOrder(completeOrder);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time tracking active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time tracking error');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Cleaning up real-time tracking');
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Use localOrder if available, otherwise fall back to store order
  const displayOrder = localOrder || order;

  // Loading state
  if (loading || !displayOrder) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
        <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
          <Package size={64} color="#D1D5DB" />
        </div>
        <p style={{ marginTop: '16px', color: '#6B7280', fontSize: '14px', fontWeight: '600' }}>
          {loading ? 'Loading order details...' : 'Order not found'}
        </p>
        {!loading && (
          <button onClick={() => navigate('/home')} style={{ marginTop: '16px', color: '#16A34A', fontWeight: '600', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}>
            Back to Home
          </button>
        )}
      </div>
    );
  }

  const stepsList = [
    { status: 'PLACED', title: 'Order Placed', icon: Clock, desc: 'Your order has been received', time: displayOrder.placed_at },
    { status: 'CONFIRMED', title: 'Confirmed', icon: CheckCircle, desc: 'Store is preparing your order', time: displayOrder.confirmed_at },
    { status: 'PACKED', title: 'Packed', icon: Package, desc: 'Your order is ready for pickup', time: displayOrder.packed_at },
    { status: 'ASSIGNED', title: 'Delivery Assigned', icon: Navigation, desc: 'Delivery partner assigned', time: displayOrder.assigned_at },
    { status: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', icon: Truck, desc: 'On the way to your location', time: displayOrder.out_for_delivery_at },
    { status: 'DELIVERED', title: 'Delivered', icon: Home, desc: 'Order delivered successfully', time: displayOrder.delivered_at },
  ];

  const currentStepIndex = stepsList.findIndex(s => s.status === displayOrder.status);
  const stepIndex = currentStepIndex === -1 ? 0 : currentStepIndex;
  const currentStep = stepsList[stepIndex];
  const CurrentIcon = currentStep?.icon || Clock;

  if (displayOrder.status === 'CANCELLED') {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
            <ArrowLeft size={24} color="#111827" />
          </button>
          <span style={{ marginLeft: '12px', fontSize: '18px', fontWeight: '700', color: '#111827' }}>Order Details</span>
        </div>
        <div style={{ background: '#FEE2E2', padding: '32px 24px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', borderRadius: '50%', background: '#FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={32} color="#DC2626" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#991B1B', marginBottom: '8px' }}>Order Cancelled</h2>
          <p style={{ fontSize: '14px', color: '#B91C1C' }}>This order has been cancelled</p>
        </div>
      </div>
    );
  }

  // Calculate estimated delivery time
  const getEstimatedTime = () => {
    if (displayOrder.status === 'DELIVERED') return null;
    if (displayOrder.status === 'PLACED') return '30-40 min';
    if (displayOrder.status === 'CONFIRMED') return '25-35 min';
    if (displayOrder.status === 'PACKED') return '20-30 min';
    if (displayOrder.status === 'ASSIGNED') return '15-20 min';
    if (displayOrder.status === 'OUT_FOR_DELIVERY') return '10-15 min';
    return null;
  };

  const estimatedTime = getEstimatedTime();

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
        .press-scale { transition: transform 0.15s ease; cursor: pointer; }
        .press-scale:active { transform: scale(0.97); }
      `}</style>

      {/* Header */}
      <div style={{
        background: '#fff',
        padding: '16px',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} className="press-scale" style={{ background: '#F3F4F6', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowLeft size={20} color="#111827" />
            </button>
            <div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600' }}>Order</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>#{displayOrder.id.slice(0, 8).toUpperCase()}</div>
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
            {displayOrder.status}
          </div>
        </div>
      </div>

      {/* Live Status Banner */}
      {displayOrder.status !== 'DELIVERED' && (
        <div style={{
          background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
          padding: '24px 16px',
          color: '#fff',
          animation: 'slideUp 0.5s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <CurrentIcon size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>{currentStep?.desc}</div>
              <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>{currentStep?.title}</div>
              {estimatedTime && (
                <div style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} />
                  Arriving in {estimatedTime}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delivery Address */}
      <div style={{
        background: '#fff',
        margin: '16px',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        animation: 'slideUp 0.5s ease 0.1s forwards',
        opacity: isReady ? 1 : 0
      }}>
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
            <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Delivery Address</div>
            <div style={{ fontSize: '14px', color: '#111827', lineHeight: 1.5, fontWeight: '500' }}>
              {displayOrder.customer_details?.address || 'Address not available'}
            </div>
            {displayOrder.customer_details?.phone && (
              <a
                href={`tel:${displayOrder.customer_details.phone}`}
                className="press-scale"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '8px',
                  fontSize: '13px',
                  color: '#16A34A',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                <Phone size={14} />
                {displayOrder.customer_details.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div style={{
        background: '#fff',
        margin: '0 16px 16px',
        borderRadius: '12px',
        padding: '20px 16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        animation: 'slideUp 0.5s ease 0.2s forwards',
        opacity: isReady ? 1 : 0
      }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>
          Order Tracking
        </div>

        <div style={{ position: 'relative', paddingLeft: '32px' }}>
          {/* Progress Line Background */}
          <div style={{
            position: 'absolute',
            left: '11px',
            top: '20px',
            bottom: '20px',
            width: '2px',
            background: '#E5E7EB'
          }} />
          
          {/* Progress Line Active */}
          <div style={{
            position: 'absolute',
            left: '11px',
            top: '20px',
            height: `${(stepIndex / (stepsList.length - 1)) * 100}%`,
            width: '2px',
            background: 'linear-gradient(180deg, #16A34A, #22C55E)',
            transition: 'height 0.5s ease'
          }} />

          {stepsList.map((step, index) => {
            const isCompleted = index <= stepIndex;
            const isActive = index === stepIndex;
            const StepIcon = step.icon;
            
            return (
              <div
                key={index}
                style={{
                  position: 'relative',
                  marginBottom: index === stepsList.length - 1 ? 0 : '28px',
                  opacity: isCompleted ? 1 : 0.4,
                  transition: 'opacity 0.3s ease'
                }}
              >
                {/* Timeline Dot */}
                <div style={{
                  position: 'absolute',
                  left: '-32px',
                  top: '2px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isCompleted ? 'linear-gradient(135deg, #16A34A, #22C55E)' : '#fff',
                  border: `2px solid ${isCompleted ? '#16A34A' : '#D1D5DB'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive ? '0 0 0 4px rgba(22, 163, 74, 0.15)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {isCompleted && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#fff'
                    }} />
                  )}
                </div>

                {/* Content */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <StepIcon
                      size={18}
                      color={isActive ? '#16A34A' : isCompleted ? '#16A34A' : '#9CA3AF'}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: isActive ? '700' : '600',
                      color: isActive ? '#16A34A' : '#111827'
                    }}>
                      {step.title}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', paddingLeft: '26px' }}>
                    {step.desc}
                  </div>
                  {step.time && (
                    <div style={{ fontSize: '11px', color: '#9CA3AF', paddingLeft: '26px', marginTop: '2px' }}>
                      {new Date(step.time).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary */}
      <div style={{
        background: '#fff',
        margin: '0 16px 16px',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        animation: 'slideUp 0.5s ease 0.3s forwards',
        opacity: isReady ? 1 : 0
      }}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
          Order Summary
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#6B7280' }}>Item Total</span>
            <span style={{ color: '#111827', fontWeight: '600' }}>₹{displayOrder.item_total}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#6B7280' }}>Delivery Fee</span>
            <span style={{ color: displayOrder.delivery_charge === 0 ? '#16A34A' : '#111827', fontWeight: '600' }}>
              {displayOrder.delivery_charge === 0 ? 'FREE' : `₹${displayOrder.delivery_charge}`}
            </span>
          </div>
          <div style={{ borderTop: '1px dashed #E5E7EB', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
            <span style={{ color: '#111827', fontWeight: '700' }}>Total</span>
            <span style={{ color: '#16A34A', fontWeight: '800' }}>₹{displayOrder.grand_total}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
            Payment: {displayOrder.payment_method === 'cod' ? '💵 Cash on Delivery' : '✅ Prepaid'}
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div style={{ padding: '0 16px', animation: 'slideUp 0.5s ease 0.4s forwards', opacity: isReady ? 1 : 0 }}>
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="press-scale"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            height: '48px',
            background: '#fff',
            border: '1.5px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#111827',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
        >
          <Phone size={18} color='#25D366' />
          Need Help? Contact on WhatsApp
        </a>
      </div>
    </div>
  );
}
