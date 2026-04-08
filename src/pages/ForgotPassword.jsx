import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Phone, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Simple hash using a reproducible method (same as used during signup)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Step 1: phone check state
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState(1); // 1 = phone, 2 = reset, 3 = success

  // Step 2: password reset state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundUser, setFoundUser] = useState(null);

  // ── STEP 1: Check if phone exists ──
  const handlePhoneCheck = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setError('');
    setLoading(true);

    const { data, error: dbError } = await supabase
      .from('users')
      .select('id, name, phone')
      .eq('phone', phone.trim())
      .single();

    setLoading(false);

    if (dbError || !data) {
      setError('No account found with this phone number.');
    } else {
      setFoundUser(data);
      setStep(2);
    }
  };

  // ── STEP 2: Reset password ──
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);

    // Check if the app stores plain text passwords (based on existing loginUser query in store.js)
    // The store does plain text comparison, so we store plain text to keep it consistent
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', foundUser.id);

    setLoading(false);

    if (updateError) {
      setError('Failed to update password. Please try again.');
    } else {
      setStep(3);
    }
  };

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
        .press-scale { transition: transform 0.15s ease; cursor: pointer; }
        .press-scale:active { transform: scale(0.96); }
        .fp-input {
          width: 100%; height: 50px; border-radius: 14px; border: 2px solid transparent;
          padding: 12px 16px 12px 42px; font-size: 14px; font-family: Inter, sans-serif;
          color: #111827; background: #F3F4F6; box-sizing: border-box; transition: all 0.2s ease; outline: none; font-weight: 500;
          user-select: text; -webkit-user-select: text;
        }
        .fp-input::placeholder { color: #9CA3AF; font-weight: 400; }
        .fp-input:focus { border-color: #16A34A; background: #fff; box-shadow: 0 0 0 3px rgba(22,163,74,0.1); }
        .fp-input-error { border-color: #EF4444 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.1) !important; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '380px', animation: 'fadeSlideUp 0.4s ease-out forwards' }}>
        
        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <div className="press-scale" onClick={() => step === 1 ? navigate('/login') : setStep(1)} style={{ width: '36px', height: '36px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginRight: '12px', flexShrink: 0 }}>
            <ArrowLeft size={18} color="#111827" />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
              {step === 1 ? 'Forgot Password' : step === 2 ? 'Create New Password' : 'Password Reset!'}
            </h1>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0 0' }}>
              {step === 1 ? 'Enter your phone to continue' : step === 2 ? `Resetting for ${foundUser?.name}` : 'You can now login with your new password'}
            </p>
          </div>
        </div>

        {/* ── CARD ── */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
          
          {/* Progress indicator */}
          {step < 3 && (
            <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
              {[1, 2].map(s => (
                <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= s ? '#16A34A' : '#E5E7EB', transition: 'background 0.3s ease' }} />
              ))}
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#FEF2F2', color: '#B91C1C', padding: '12px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: Phone Entry ── */}
          {step === 1 && (
            <form onSubmit={handlePhoneCheck} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Phone Number</div>
                <Phone size={18} style={{ position: 'absolute', left: '14px', bottom: '16px', color: '#9CA3AF', zIndex: 1 }} />
                <input
                  type="tel"
                  placeholder="Enter registered phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className={`fp-input ${error ? 'fp-input-error' : ''}`}
                  autoFocus
                />
              </div>
              <button type="submit" disabled={!phone.trim() || loading} className="press-scale" style={{
                width: '100%', height: '50px', background: phone.trim() ? 'linear-gradient(90deg, #16A34A, #22C55E)' : '#E5E7EB',
                color: phone.trim() ? '#fff' : '#9CA3AF', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '600',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: phone.trim() ? 'pointer' : 'not-allowed',
                boxShadow: phone.trim() ? '0 4px 14px rgba(22,163,74,0.3)' : 'none', transition: 'all 0.2s'
              }}>
                {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Checking...</> : 'Find My Account'}
              </button>
            </form>
          )}

          {/* ── STEP 2: New Password ── */}
          {step === 2 && (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>New Password</div>
                <Lock size={18} style={{ position: 'absolute', left: '14px', bottom: '16px', color: '#9CA3AF', zIndex: 1 }} />
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter new password (min 6 chars)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className={`fp-input ${error ? 'fp-input-error' : ''}`}
                  style={{ paddingRight: '42px' }}
                  autoFocus
                />
                <div onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '14px', bottom: '16px', color: '#9CA3AF', cursor: 'pointer', zIndex: 1 }}>
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Confirm Password</div>
                <Lock size={18} style={{ position: 'absolute', left: '14px', bottom: '16px', color: '#9CA3AF', zIndex: 1 }} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={`fp-input ${error ? 'fp-input-error' : ''}`}
                  style={{ paddingRight: '42px' }}
                />
                <div onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '14px', bottom: '16px', color: '#9CA3AF', cursor: 'pointer', zIndex: 1 }}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>

              {/* Password match indicator */}
              {confirmPassword && (
                <div style={{ fontSize: '12px', fontWeight: '500', color: newPassword === confirmPassword ? '#16A34A' : '#EF4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: newPassword === confirmPassword ? '#16A34A' : '#EF4444' }} />
                  {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}

              <button type="submit" disabled={!newPassword || !confirmPassword || loading} className="press-scale" style={{
                width: '100%', height: '50px', background: (newPassword && confirmPassword) ? 'linear-gradient(90deg, #16A34A, #22C55E)' : '#E5E7EB',
                color: (newPassword && confirmPassword) ? '#fff' : '#9CA3AF', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '600',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                cursor: (newPassword && confirmPassword) ? 'pointer' : 'not-allowed',
                boxShadow: (newPassword && confirmPassword) ? '0 4px 14px rgba(22,163,74,0.3)' : 'none', transition: 'all 0.2s'
              }}>
                {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</> : 'Reset Password'}
              </button>
            </form>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
              <div style={{ width: '64px', height: '64px', background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={32} color="#16A34A" />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Password Updated!</h2>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px' }}>Your password has been successfully reset. Login with your new password.</p>
              <button onClick={() => navigate('/login')} className="press-scale" style={{
                width: '100%', height: '50px', background: 'linear-gradient(90deg, #16A34A, #22C55E)', color: '#fff', border: 'none', borderRadius: '14px',
                fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 14px rgba(22,163,74,0.3)'
              }}>
                Go to Login
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#6B7280' }}>
          Remember your password? <span onClick={() => navigate('/login')} style={{ color: '#16A34A', fontWeight: '700', cursor: 'pointer' }}>Login</span>
        </p>
      </div>
    </div>
  );
}
