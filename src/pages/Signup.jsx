import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Phone, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: 'linear-gradient(150deg, #faf5ff 0%, #f3e8ff 50%, #faf5ff 100%)',
  fontFamily: 'Inter, sans-serif',
};

const cardStyle = {
  width: '100%',
  maxWidth: '400px',
  backgroundColor: 'white',
  borderRadius: '20px',
  padding: '36px 32px',
  boxShadow: '0 8px 32px rgba(109,40,217,0.15), 0 2px 8px rgba(0,0,0,0.06)',
};

const inputBase = {
  width: '100%',
  padding: '13px 16px 13px 44px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '12px',
  fontSize: '1rem',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  color: '#0f172a',
  backgroundColor: 'white',
  boxSizing: 'border-box',
};

const primaryBtn = {
  width: '100%',
  padding: '14px',
  backgroundColor: '#6d28d9',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontWeight: '700',
  fontSize: '1rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontFamily: 'Inter, sans-serif',
};

export default function Signup() {
  const navigate = useNavigate();
  const signupUser = useAppStore(s => s.signupUser);

  const [form, setForm] = useState({ name: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  if (success) {
    return (
      <div style={pageStyle}>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 32px' }}>
          <CheckCircle size={60} color="#6d28d9" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#14532d', marginBottom: '8px' }}>Account Created!</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Taking you to the appâ€¦</p>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={22} color="#6d28d9" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Branding */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '52px', marginBottom: '10px' }}>ðŸ›’</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#14532d', margin: 0 }}>Malerkotla Fresh</h1>
        <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '4px' }}>Create your account to place orders</p>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '4px' }}>Create Account ðŸ™Œ</h2>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '24px' }}>Join Malerkotla Fresh today</p>

        {error && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '11px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px' }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Name */}
          <div style={{ position: 'relative' }}>
            <User size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              style={inputBase}
              onFocus={e => { e.target.style.borderColor = '#6d28d9'; e.target.style.boxShadow = '0 0 0 3px rgba(109,40,217,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              autoComplete="name"
              autoFocus
            />
          </div>

          {/* Phone */}
          <div style={{ position: 'relative' }}>
            <Phone size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
            <input
              type="tel"
              placeholder="Phone number (10 digits)"
              value={form.phone}
              onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              style={inputBase}
              onFocus={e => { e.target.style.borderColor = '#6d28d9'; e.target.style.boxShadow = '0 0 0 3px rgba(109,40,217,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              autoComplete="tel"
              maxLength={10}
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              style={inputBase}
              onFocus={e => { e.target.style.borderColor = '#6d28d9'; e.target.style.boxShadow = '0 0 0 3px rgba(109,40,217,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              autoComplete="new-password"
            />
          </div>

          {/* Confirm Password */}
          <div style={{ position: 'relative' }}>
            <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
            <input
              type="password"
              placeholder="Confirm password"
              value={form.confirm}
              onChange={e => set('confirm', e.target.value)}
              style={inputBase}
              onFocus={e => { e.target.style.borderColor = '#6d28d9'; e.target.style.boxShadow = '0 0 0 3px rgba(109,40,217,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" style={{ ...primaryBtn, opacity: loading ? 0.75 : 1 }} disabled={loading}>
            {loading
              ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creating accountâ€¦</>
              : <><span>Create Account</span><ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: '#6b7280' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#6d28d9', fontWeight: '700', textDecoration: 'none' }}>Login â†’</Link>
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
