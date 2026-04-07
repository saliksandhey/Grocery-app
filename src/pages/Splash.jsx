import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home', { replace: true });
    }, 1800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(150deg, #faf5ff 0%, #f3e8ff 60%, #faf5ff 100%)',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        width: '88px', height: '88px',
        backgroundColor: 'white',
        borderRadius: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '44px',
        boxShadow: '0 8px 32px rgba(109,40,217,0.2)',
        marginBottom: '20px',
        animation: 'popIn 0.5s ease',
      }}>ðŸ›’</div>

      <h1 style={{ color: '#14532d', fontSize: '1.75rem', fontWeight: '800', marginBottom: '6px' }}>
        Malerkotla Fresh
      </h1>
      <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Fast Delivery Â· 60â€“90 min ðŸš€</p>

      <div style={{ display: 'flex', gap: '6px', marginTop: '40px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: '#6d28d9',
            animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes popIn { 0% { transform: scale(0.7); opacity:0; } 80% { transform: scale(1.05); } 100% { transform: scale(1); opacity:1; } }
        @keyframes bounce { 0%,100% { transform: translateY(0); opacity:0.4; } 50% { transform: translateY(-8px); opacity:1; } }
      `}</style>
    </div>
  );
}
