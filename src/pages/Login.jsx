import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';
import { Phone, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import logoImg from '../assets/istockphoto-898475764-612x612-Photoroom.png';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginUser = useAppStore(s => s.loginUser);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const from = location.state?.from || '/home';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !password) return;
    setError('');

    setLoading(true);
    const result = await loginUser(phone, password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  const isFormValid = phone.trim() !== '' && password !== '';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #ECFDF5 0%, #ffffff 100%)', padding: '24px', fontFamily: 'Inter, sans-serif'
    }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(15px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .press-scale { transition: transform 0.15s ease, box-shadow 0.15s ease; cursor: pointer; }
        .press-scale:active { transform: scale(0.96); }
        
        .input-wrap { position: relative; transition: all 0.2s; }
        .input-field {
          width: 100%; height: 50px; border-radius: 14px; border: 2px solid transparent;
          padding: 12px 16px 12px 42px; font-size: 14px; font-family: Inter, sans-serif;
          color: #111827; background: #F3F4F6; box-sizing: border-box; transition: all 0.2s ease;
          outline: none; font-weight: 500; user-select: text; -webkit-user-select: text;
        }
        .input-field::placeholder { color: #9CA3AF; font-weight: 400; }
        .input-field:focus {
          border-color: #16A34A; background: #fff; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
        }
        .input-error {
          border-color: #EF4444 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }
        
        .hover-underline:hover { text-decoration: underline; }
        .btn-guest:hover { background: #F9FAFB !important; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', opacity: isReady ? 1 : 0, animation: 'fadeSlideUp 0.4s ease-out forwards' }}>
        
        {/* ── BRANDING ── */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ 
            display: 'inline-flex', width: '60px', height: '60px', alignItems: 'center', justifyContent: 'center', 
            background: '#fff', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', marginBottom: '16px', overflow: 'hidden' 
          }}>
            <img src={logoImg} alt="Malerkotla Fresh" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>Malerkotla Fresh</h1>
          <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>Groceries delivered in minutes</p>
        </div>

        {/* ── FORM CARD ── */}
        <div style={{
          background: '#fff', borderRadius: '20px', padding: '20px', marginTop: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.02)'
        }}>
          
          {error && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#FEF2F2', color: '#B91C1C', padding: '12px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> <span style={{ lineHeight: 1.3 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div className="input-wrap">
              <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', zIndex: 1 }} />
              <input type="tel" placeholder="Enter phone number" value={phone} onChange={e => setPhone(e.target.value)} className={`input-field ${error ? 'input-error' : ''}`} autoFocus />
            </div>

            <div className="input-wrap">
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', zIndex: 1 }} />
              <input type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} className={`input-field ${error ? 'input-error' : ''}`} style={{ paddingRight: '42px' }} />
              <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', cursor: 'pointer', zIndex: 1, padding: '4px' }} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '2px', marginBottom: '4px' }}>
               <span className="hover-underline" onClick={() => navigate('/forgot-password')} style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600', cursor: 'pointer' }}>Forgot Password?</span>
            </div>

            <button type="submit" disabled={!isFormValid || loading} className={isFormValid ? "press-scale" : ""} style={{
              width: '100%', height: '50px', 
              background: isFormValid ? 'linear-gradient(90deg, #16A34A 0%, #22C55E 100%)' : '#E5E7EB', 
              color: isFormValid ? '#fff' : '#9CA3AF', 
              border: 'none', borderRadius: '14px',
              fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease', 
              boxShadow: isFormValid ? '0 4px 14px rgba(22, 163, 74, 0.3)' : 'none'
            }}>
              {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Logging in...</> : 'Login'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#F3F4F6' }} />
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', letterSpacing: '0.05em' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#F3F4F6' }} />
          </div>

          <button onClick={() => navigate('/home')} className="press-scale btn-guest" style={{
            width: '100%', height: '50px', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: '14px', 
            fontSize: '14px', fontWeight: '600', color: '#4B5563', cursor: 'pointer', transition: 'background 0.2s'
          }}>
            Continue as Guest
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#6B7280' }}>
            Don't have an account? <Link to="/signup" className="hover-underline" style={{ color: '#16A34A', fontWeight: '700', textDecoration: 'none' }}>Sign up</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '11px', color: '#6B7280', opacity: 0.7 }}>
           <span style={{ cursor: 'pointer' }} className="hover-underline">Terms of Service</span>
           <span style={{ margin: '0 8px' }}>•</span>
           <span style={{ cursor: 'pointer' }} className="hover-underline">Privacy Policy</span>
        </div>
      </div>
    </div>
  );
}
