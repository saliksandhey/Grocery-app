import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Phone, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import logoImg from '../assets/istockphoto-898475764-612x612-Photoroom.png';

export default function Signup() {
  const navigate = useNavigate();
  const signupUser = useAppStore(s => s.signupUser);

  const [form, setForm] = useState({ name: '', phone: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim())    { setError('Please enter your name.'); return; }
    if (!form.phone.trim())   { setError('Please enter your phone number.'); return; }
    if (form.phone.trim().length < 10) { setError('Enter a valid 10-digit phone number.'); return; }
    if (form.password.length < 6)      { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const result = await signupUser(form.name, form.phone, form.password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/home', { replace: true }), 1500);
    } else {
      setError(result.message);
    }
  };

  const handleSkip = () => {
    navigate('/home', { replace: true });
  };

  const isFormValid = form.name.trim() !== '' && form.phone.trim().length === 10 && form.password.length >= 6 && form.password === form.confirm;

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #ECFDF5 0%, #ffffff 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{ 
          width: '100%',
          maxWidth: '400px',
          background: 'white',
          borderRadius: '24px',
          padding: '48px 32px',
          textAlign: 'center',
          boxShadow: '0 12px 40px rgba(22, 163, 74, 0.12)'
        }}>
          <div style={{ 
            display: 'inline-flex', width: '80px', height: '80px', alignItems: 'center', justifyContent: 'center', 
            background: '#F0FDF4', borderRadius: '50%', marginBottom: '24px', color: '#16A34A'
          }}>
            <CheckCircle size={48} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Success!</h2>
          <p style={{ color: '#6B7280', fontSize: '15px' }}>Your account has been created. Taking you to the app...</p>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={24} color="#16A34A" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        </div>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #ECFDF5 0%, #ffffff 50%, #F9FAFB 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .press-scale { transition: transform 0.15s ease, box-shadow 0.15s ease; cursor: pointer; }
        .press-scale:active { transform: scale(0.96); }
        
        .input-wrap { position: relative; transition: all 0.2s; }
        .input-field {
          width: 100%; height: 52px; border-radius: 14px; border: 2px solid transparent;
          padding: 12px 16px 12px 44px; font-size: 14px; font-family: Inter, sans-serif;
          color: #111827; background: #F9FAFB; box-sizing: border-box; transition: all 0.2s ease;
          outline: none; font-weight: 500; user-select: text; -webkit-user-select: text;
        }
        .input-field::placeholder { color: #9CA3AF; font-weight: 400; }
        .input-field:focus {
          border-color: #16A34A; background: #fff; box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1);
        }
        .input-error {
          border-color: #EF4444 !important; background: #fff !important; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1) !important;
        }
        
        .hover-underline:hover { text-decoration: underline; }
      `}</style>

      {/* Skip Button */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10
      }}>
        <button
          onClick={handleSkip}
          className="press-scale"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid #E5E7EB',
            borderRadius: '24px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#6B7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
        >
          Skip
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'rgba(22, 163, 74, 0.05)',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '100px',
        left: '-30px',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'rgba(34, 197, 94, 0.05)',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ width: '100%', maxWidth: '400px', opacity: isReady ? 1 : 0, animation: 'fadeSlideUp 0.5s ease-out forwards' }}>
          
          {/* ── BRANDING ── */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              display: 'inline-flex', width: '80px', height: '80px', alignItems: 'center', justifyContent: 'center', 
              background: '#fff', borderRadius: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', marginBottom: '20px', overflow: 'hidden',
              border: '2px solid rgba(22, 163, 74, 0.1)'
            }}>
              <img src={logoImg} alt="Malerkotla Fresh" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
              Malerkotla Fresh
            </h1>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: 0, fontWeight: '500' }}>
              Fresh groceries delivered to your doorstep
            </p>
          </div>

          {/* ── FORM CARD ── */}
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
            border: '1px solid rgba(229, 231, 235, 0.5)'
          }}>
            
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px', marginTop: 0 }}>
              Create Account
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px', marginTop: 0 }}>
              Join us and start shopping today
            </p>

          {error && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#FEF2F2', color: '#B91C1C', padding: '12px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> <span style={{ lineHeight: 1.3 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div className="input-wrap">
              <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', zIndex: 1 }} />
              <input 
                type="text" 
                placeholder="Full name" 
                value={form.name} 
                onChange={e => set('name', e.target.value)} 
                className={`input-field ${error && !form.name ? 'input-error' : ''}`} 
                autoComplete="name"
              />
            </div>

            <div className="input-wrap">
              <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', zIndex: 1 }} />
              <input 
                type="tel" 
                placeholder="Phone number" 
                value={form.phone} 
                onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} 
                className={`input-field ${error && form.phone.length < 10 ? 'input-error' : ''}`} 
                maxLength={10}
                autoComplete="tel"
              />
            </div>

            <div className="input-wrap">
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', zIndex: 1 }} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Create password" 
                value={form.password} 
                onChange={e => set('password', e.target.value)} 
                className={`input-field ${error && form.password.length < 6 ? 'input-error' : ''}`} 
                style={{ paddingRight: '42px' }}
                autoComplete="new-password"
              />
              <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', cursor: 'pointer', zIndex: 1, padding: '4px' }} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            <div className="input-wrap">
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', zIndex: 1 }} />
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                placeholder="Confirm password" 
                value={form.confirm} 
                onChange={e => set('confirm', e.target.value)} 
                className={`input-field ${error && form.password !== form.confirm ? 'input-error' : ''}`} 
                style={{ paddingRight: '42px' }}
                autoComplete="new-password"
              />
              <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', cursor: 'pointer', zIndex: 1, padding: '4px' }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={isFormValid ? "press-scale" : ""} 
              style={{
                width: '100%', height: '52px', marginTop: '8px',
                background: isFormValid ? 'linear-gradient(90deg, #16A34A 0%, #22C55E 100%)' : '#E5E7EB', 
                color: isFormValid ? '#fff' : '#9CA3AF', 
                border: 'none', borderRadius: '16px',
                fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                cursor: isFormValid ? 'pointer' : (loading ? 'wait' : 'not-allowed'),
                transition: 'all 0.2s ease', 
                boxShadow: isFormValid ? '0 6px 18px rgba(22, 163, 74, 0.25)' : 'none'
              }}
            >
              {loading ? (
                <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight size={20} /></>
              )}
            </button>
          </form>

            {/* Sign Up Link */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="hover-underline"
                  style={{ color: '#16A34A', fontWeight: '700', textDecoration: 'none' }}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '11px', color: '#9CA3AF', opacity: 0.8 }}>
            <span className="hover-underline press-scale" style={{ cursor: 'pointer' }} onClick={() => navigate('/terms')}>Terms of Service</span>
            <span style={{ margin: '0 8px' }}>•</span>
            <span className="hover-underline press-scale" style={{ cursor: 'pointer' }} onClick={() => navigate('/privacy')}>Privacy Policy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

