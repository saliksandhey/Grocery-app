import { ArrowLeft, CheckCircle, Package, Truck, Home, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store';

export default function Tracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const orders = useAppStore(state => state.orders);
  const order = orders.find(o => o.id === id);

  if (!order) return <div style={{textAlign:'center', marginTop:'50px'}}>Order not found.</div>;

  const stepsList = [
    { status: 'Pending', title: 'Order Placed', icon: <Clock size={24} />, desc: 'Waiting for confirmation.' },
    { status: 'Accepted', title: 'Order Confirmed', icon: <CheckCircle size={24} />, desc: 'Store accepted your order.' },
    { status: 'Preparing', title: 'Preparing', icon: <Package size={24} />, desc: 'Your items are being packed.' },
    { status: 'Ready for Delivery', title: 'Ready', icon: <Package size={24} />, desc: 'Waiting for delivery partner.' },
    { status: 'Driver Accepted', title: 'Rider Assigned', icon: <Package size={24} />, desc: 'Partner is heading to store.' },
    { status: 'Out for Delivery', title: 'On the Way', icon: <Truck size={24} />, desc: 'Partner is on the way.' },
    { status: 'Delivered', title: 'Delivered', icon: <Home size={24} />, desc: 'Order delivered safely.' },
  ];

  const currentStepIndex = stepsList.findIndex(s => s.status === order.status);
  const stepIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate('/home')} style={{ padding: '8px 8px 8px 0', color: 'var(--text-1)' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginLeft: '8px' }}>Track Order #{order.id}</h2>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', marginBottom: '4px' }}>Current Status</p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>{order.status}</h3>
          </div>
          <div style={{ backgroundColor: '#f1f5f9', color: 'var(--text-1)', padding: '8px 12px', borderRadius: 'var(--radius-md)', fontWeight: 'bold', fontSize: '0.875rem' }}>
            â‚¹{order.grand_total}
          </div>
        </div>

        <div style={{ position: 'relative', paddingLeft: '32px' }}>
          <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '24px', width: '2px', backgroundColor: 'var(--border)', zIndex: 0 }}></div>
          <div style={{ position: 'absolute', left: '11px', top: '24px', height: `${(stepIndex / (stepsList.length - 1)) * 100}%`, width: '2px', backgroundColor: 'var(--primary)', zIndex: 0, transition: 'height 0.3s ease' }}></div>

          {stepsList.map((step, index) => {
            const isCompleted = index <= stepIndex;
            const isActive = index === stepIndex;
            
            return (
              <div key={index} style={{ position: 'relative', zIndex: 1, marginBottom: index === stepsList.length - 1 ? 0 : '32px', display: 'flex', gap: '16px' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '-32px', 
                  backgroundColor: isCompleted ? 'var(--primary)' : 'white', 
                  color: isCompleted ? 'white' : 'var(--text-3)',
                  border: `2px solid ${isCompleted ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '50%', 
                  width: '24px', 
                  height: '24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginLeft: '-11px',
                  boxShadow: isActive ? '0 0 0 4px rgba(109, 40, 217, 0.2)' : 'none'
                }}>
                  {isCompleted && <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%' }}></div>}
                </div>
                
                <div style={{ opacity: isCompleted ? 1 : 0.4 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: isActive ? '700' : '500', color: isActive ? 'var(--primary)' : 'var(--text-1)' }}>{step.title}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', marginTop: '4px' }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
