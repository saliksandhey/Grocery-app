import { useState } from 'react';
import { useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, User, Phone, MapPin, ChevronRight,
  Package, ShieldCheck, HelpCircle, Bell, CreditCard, FileText,
  Gift, TrendingDown, X, Edit2, Save, Loader2, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Profile() {
  const navigate = useNavigate();
  const currentUser = useAppStore(s => s.currentUser);
  const logoutUser = useAppStore(s => s.logoutUser);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogout = () => {
    logoutUser();
    navigate('/home', { replace: true });
  };

  const openEditModal = () => {
    setEditForm({
      name: currentUser.name || '',
      phone: currentUser.phone || '',
      password: ''
    });
    setError('');
    setSuccess('');
    setEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editForm.name.trim()) {
      setError('Name is required');
      return;
    }

    if (editForm.password && editForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        name: editForm.name.trim(),
        phone: editForm.phone.trim()
      };

      // Only update password if provided
      if (editForm.password) {
        updateData.password = editForm.password;
      }

      const { error: updateError, data } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', currentUser.id)
        .select()
        .single();

      if (updateError) {
        if (updateError.code === '23505') {
          setError('Phone number already exists');
        } else {
          setError(updateError.message || 'Failed to update profile');
        }
        setSaving(false);
        return;
      }

      // Update local state
      useAppStore.setState({ currentUser: data });
      setSuccess('Profile updated successfully!');
      
      setTimeout(() => {
        setEditModalOpen(false);
      }, 1500);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div style={{ background: '#F9FAFB', minHeight: '100vh', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`.press-scale:active { transform: scale(0.97); }`}</style>
        <div style={{ width: '80px', height: '80px', background: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <User size={40} color="#9CA3AF" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Your Profile</h2>
        <p style={{ color: '#6B7280', marginBottom: '32px', fontSize: '14px', textAlign: 'center' }}>Login to see your orders, addresses, and manage account settings.</p>
        <button onClick={() => navigate('/login')} className="press-scale" style={{ width: '100%', maxWidth: '300px', background: '#16A34A', color: '#fff', padding: '14px 0', borderRadius: '12px', fontWeight: '700', fontSize: '15px', border: 'none', marginBottom: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.2)' }}>
          Login to Account
        </button>
        <button onClick={() => navigate('/signup')} className="press-scale" style={{ width: '100%', maxWidth: '300px', background: '#fff', color: '#16A34A', padding: '14px 0', borderRadius: '12px', fontWeight: '600', fontSize: '15px', border: '1px solid #16A34A', cursor: 'pointer' }}>
          Create Account
        </button>
      </div>
    );
  }

  const initial = currentUser.name?.charAt(0).toUpperCase() || 'U';

  const quickActions = [
    { label: 'My Orders', icon: Package, iconColor: '#1d4ed8', onClick: () => navigate('/orders') },
    { label: 'Saved Addresses', icon: MapPin, iconColor: '#b45309', onClick: () => navigate('/addresses') },
    { label: 'Payments', icon: CreditCard, iconColor: '#047857', onClick: () => alert('Payments coming soon!') },
    { label: 'Help & Support', icon: HelpCircle, iconColor: '#be185d', onClick: () => navigate('/help') }
  ];

  const listItems = [
    { label: 'Order History', icon: Package, onClick: () => navigate('/orders') },
    { label: 'Manage Addresses', icon: MapPin, onClick: () => navigate('/addresses') },
    { label: 'Payment Methods', icon: CreditCard, onClick: () => alert('Coming soon!') },
    { label: 'Notifications', icon: Bell, onClick: () => alert('Coming soon!') },
    { label: 'Privacy Policy', icon: ShieldCheck, onClick: () => navigate('/privacy') },
    { label: 'Terms & Conditions', icon: FileText, onClick: () => navigate('/terms') },
  ];

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', paddingBottom: '90px' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .press-scale { transition: transform 0.15s ease; cursor: pointer; }
        .press-scale:active { transform: scale(0.95); }
        .hover-shadow { transition: box-shadow 0.2s ease; }
        .hover-shadow:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
      `}</style>
      
      {/* ── STICKY HEADER ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Profile</h2>
      </div>

      <div style={{ padding: '16px' }}>

        {/* ── TOP HEADER SECTION (PROFILE SUMMARY) ── */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#16A34A', flexShrink: 0, border: '2px solid #e5e7eb' }}>
            {initial}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '2px' }}>{currentUser.name}</h3>
            <div style={{ fontSize: '13px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={12} /> {currentUser.phone}
            </div>
          </div>
          <button className="press-scale" onClick={openEditModal} style={{ padding: '6px 12px', background: '#16A34A', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Edit2 size={12} /> Edit
          </button>
        </div>

        {/* ── OPTIONAL PREMIUM SECTION (FIRE FIRE) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div className="press-scale" style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #dcfce7', position: 'relative', overflow: 'hidden' }}>
             <TrendingDown size={18} color="#16A34A" style={{ marginBottom: '8px' }} />
             <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Your Savings</div>
             <div style={{ fontSize: '16px', fontWeight: '700', color: '#16A34A' }}>₹240.00</div>
          </div>
          <div className="press-scale" style={{ background: '#16A34A', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(22,163,74,0.2)', position: 'relative', overflow: 'hidden', color: '#fff' }}>
             <Gift size={18} color="#fff" style={{ marginBottom: '8px' }} />
             <div style={{ fontSize: '12px', fontWeight: '500', opacity: 0.9 }}>Refer & Earn</div>
             <div style={{ fontSize: '14px', fontWeight: '700' }}>Get ₹100 Off</div>
          </div>
        </div>

        {/* ── QUICK ACTION CARDS (2 COL GRID) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <div key={action.label} className="press-scale hover-shadow" onClick={action.onClick} style={{ background: '#fff', borderRadius: '12px', padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <Icon size={24} color={action.iconColor} strokeWidth={2} />
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>{action.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── ACCOUNT OPTIONS LIST ── */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden', marginBottom: '24px' }}>
          {listItems.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === listItems.length - 1;
            return (
              <div key={item.label} className="press-scale" onClick={item.onClick} style={{ height: '56px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isLast ? 'none' : '1px solid #F3F4F6', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={20} color="#6B7280" strokeWidth={2} />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{item.label}</span>
                </div>
                <ChevronRight size={18} color="#9CA3AF" />
              </div>
            );
          })}
        </div>

        {/* ── LOGOUT BUTTON ── */}
        <button className="press-scale" onClick={handleLogout} style={{ width: '100%', height: '48px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}>
          <LogOut size={18} /> Logout
        </button>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF', marginTop: '24px', fontWeight: '500' }}>Malerkotla Fresh v1.0.0</p>
      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {editModalOpen && (
        <div
          onClick={(e) => e.target === e.currentTarget && !saving && setEditModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Edit Profile</h2>
              <button
                onClick={() => !saving && setEditModalOpen(false)}
                className="press-scale"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#F3F4F6',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <X size={18} color="#6B7280" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProfile} style={{ padding: '20px' }}>
              {/* Success Message */}
              {success && (
                <div style={{
                  background: '#DCFCE7',
                  border: '1px solid #86EFAC',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: '#166534'
                }}>
                  <Save size={16} />
                  {success}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div style={{
                  background: '#FEE2E2',
                  border: '1px solid #FECACA',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#991B1B'
                }}>
                  {error}
                </div>
              )}

              {/* Name Field */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Enter your name"
                    required
                    style={{
                      width: '100%',
                      height: '48px',
                      paddingLeft: '40px',
                      paddingRight: '12px',
                      borderRadius: '12px',
                      border: '1.5px solid #E5E7EB',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Phone Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                    required
                    style={{
                      width: '100%',
                      height: '48px',
                      paddingLeft: '40px',
                      paddingRight: '12px',
                      borderRadius: '12px',
                      border: '1.5px solid #E5E7EB',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  New Password <span style={{ color: '#9CA3AF', fontWeight: '400' }}>(optional)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Leave blank to keep current"
                    style={{
                      width: '100%',
                      height: '48px',
                      paddingLeft: '12px',
                      paddingRight: '44px',
                      borderRadius: '12px',
                      border: '1.5px solid #E5E7EB',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                  </button>
                </div>
                {editForm.password && editForm.password.length < 6 && (
                  <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px', marginBottom: 0 }}>
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="press-scale"
                style={{
                  width: '100%',
                  height: '48px',
                  background: saving ? '#9CA3AF' : 'linear-gradient(90deg, #16A34A, #22C55E)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: saving ? 'none' : '0 4px 12px rgba(22, 163, 74, 0.3)'
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
