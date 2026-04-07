import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Plus, MapPin, Star, Trash2, Edit3, Home, Briefcase, X, Loader2, Navigation, CheckCircle } from 'lucide-react';

const ADDRESS_TYPES = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'work', label: 'Work', icon: Briefcase },
  { key: 'other', label: 'Other', icon: MapPin },
];

// ── Reverse geocode using free OpenStreetMap Nominatim API ──
async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  if (data?.display_name) {
    const a = data.address || {};
    // Build a clean readable address
    const parts = [
      a.house_number, a.road, a.neighbourhood || a.suburb,
      a.city || a.town || a.village || a.state_district,
      a.state, a.postcode
    ].filter(Boolean);
    return parts.join(', ');
  }
  return null;
}

function AddressForm({ onClose, onSaved, editAddress }) {
  const [label, setLabel] = useState(editAddress?.label || 'home');
  const [fullAddress, setFullAddress] = useState(editAddress?.address || '');
  const [landmark, setLandmark] = useState(editAddress?.landmark || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const [locSuccess, setLocSuccess] = useState(false);
  const currentUser = useAppStore(s => s.currentUser);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setError('');
    setLocSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const addr = await reverseGeocode(position.coords.latitude, position.coords.longitude);
          if (addr) {
            setFullAddress(addr);
            setLocSuccess(true);
            setTimeout(() => setLocSuccess(false), 3000);
          } else {
            setError('Could not detect address. Please enter manually.');
          }
        } catch {
          setError('Failed to fetch address. Check your internet.');
        }
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setError('Location permission denied. Please allow location access.');
        else setError('Could not get location. Please try again.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullAddress.trim()) { setError('Address is required.'); return; }
    setError('');
    setSaving(true);

    const payload = {
      user_id: currentUser.id,
      label,
      address: fullAddress.trim(),
      landmark: landmark.trim(),
    };

    let result;
    if (editAddress) {
      result = await supabase.from('addresses').update(payload).eq('id', editAddress.id).select().single();
    } else {
      result = await supabase.from('addresses').insert(payload).select().single();
    }

    setSaving(false);
    if (result.error) {
      setError(result.error.message);
    } else {
      onSaved();
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: '480px', background: '#fff', borderRadius: '20px 20px 0 0', padding: '20px', boxShadow: '0 -8px 32px rgba(0,0,0,0.08)', animation: 'slideUp 0.3s ease', maxHeight: '90vh', overflowY: 'auto' }}>
        <style>{`
          @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
          @keyframes locPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.3); } 50% { box-shadow: 0 0 0 8px rgba(22,163,74,0); } }
        `}</style>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{editAddress ? 'Edit Address' : 'Add New Address'}</h3>
          <div onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color="#6B7280" />
          </div>
        </div>

        {/* ── USE CURRENT LOCATION BUTTON ── */}
        <button type="button" onClick={handleDetectLocation} disabled={locating} style={{
          width: '100%', height: '48px', borderRadius: '12px', border: '1.5px solid #DCFCE7', background: locSuccess ? '#F0FDF4' : '#FAFFFE',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginBottom: '14px',
          transition: 'all 0.2s', animation: locating ? 'locPulse 1.5s infinite' : 'none',
        }}>
          {locating ? (
            <><Loader2 size={18} color="#16A34A" style={{ animation: 'spin 1s linear infinite' }} /> <span style={{ fontSize: '13px', fontWeight: '600', color: '#16A34A' }}>Detecting location...</span></>
          ) : locSuccess ? (
            <><CheckCircle size={18} color="#16A34A" /> <span style={{ fontSize: '13px', fontWeight: '600', color: '#16A34A' }}>Location detected!</span></>
          ) : (
            <><Navigation size={18} color="#16A34A" /> <span style={{ fontSize: '13px', fontWeight: '600', color: '#16A34A' }}>Use Current Location</span></>
          )}
        </button>

        {error && (
          <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: '10px', borderRadius: '10px', fontSize: '13px', marginBottom: '12px' }}>{error}</div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Label selector */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Save as</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {ADDRESS_TYPES.map(t => {
                const Icon = t.icon;
                const active = label === t.key;
                return (
                  <div key={t.key} onClick={() => setLabel(t.key)} style={{
                    flex: 1, padding: '10px 8px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                    background: active ? '#DCFCE7' : '#F9FAFB', border: active ? '1.5px solid #16A34A' : '1.5px solid #E5E7EB',
                    transition: 'all 0.2s'
                  }}>
                    <Icon size={18} color={active ? '#16A34A' : '#9CA3AF'} style={{ margin: '0 auto 4px', display: 'block' }} />
                    <div style={{ fontSize: '12px', fontWeight: '600', color: active ? '#16A34A' : '#6B7280' }}>{t.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Full Address *</div>
            <textarea value={fullAddress} onChange={e => setFullAddress(e.target.value)} placeholder="House No., Street, Area, City" style={{
              width: '100%', minHeight: '80px', padding: '12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px',
              fontFamily: 'Inter, sans-serif', resize: 'vertical', outline: 'none', boxSizing: 'border-box', background: '#F9FAFB',
            }} />
            <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>You can edit the auto-detected address above</p>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Landmark (optional)</div>
            <input value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="Near school, temple, etc." style={{
              width: '100%', height: '48px', padding: '0 12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px',
              fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', background: '#F9FAFB',
            }} />
          </div>

          <button type="submit" disabled={saving} style={{
            width: '100%', height: '50px', borderRadius: '14px', border: 'none', fontSize: '15px', fontWeight: '700',
            background: 'linear-gradient(90deg, #16A34A, #22C55E)', color: '#fff', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(22,163,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            {saving ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : (editAddress ? 'Update Address' : 'Save Address')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SavedAddresses() {
  const navigate = useNavigate();
  const currentUser = useAppStore(s => s.currentUser);

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editAddr, setEditAddr] = useState(null);

  const fetchAddresses = async () => {
    if (!currentUser) return;
    setLoading(true);
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    setAddresses(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSetDefault = async (id) => {
    // Remove default from all, then set this one
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', currentUser.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    fetchAddresses();
  };

  const handleDelete = async (id) => {
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const handleEdit = (addr) => {
    setEditAddr(addr);
    setShowForm(true);
  };

  const handleFormSaved = () => {
    setShowForm(false);
    setEditAddr(null);
    fetchAddresses();
  };

  const getLabelIcon = (label) => {
    const t = ADDRESS_TYPES.find(a => a.key === label);
    return t ? t.icon : MapPin;
  };

  if (!currentUser) {
    return (
      <div style={{ background: '#F9FAFB', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <MapPin size={48} color="#D1D5DB" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Login to manage addresses</h2>
        <button onClick={() => navigate('/login')} style={{ background: '#16A34A', color: '#fff', padding: '12px 32px', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', paddingBottom: '90px' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.45} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .press-scale { transition: transform 0.15s ease; cursor: pointer; }
        .press-scale:active { transform: scale(0.95); }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, background: '#fff', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
        boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.04)' : 'none',
        borderBottom: scrolled ? 'none' : '1px solid #F3F4F6', transition: 'all 0.2s',
      }}>
        <div className="press-scale" onClick={() => navigate(-1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={22} color="#111827" />
        </div>
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Saved Addresses</span>
        <div className="press-scale" onClick={() => { setEditAddr(null); setShowForm(true); }} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={22} color="#16A34A" />
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* LOADING */}
        {loading && (
          <>
            {[1, 2].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '16px', height: '90px', animation: 'pulse 1.5s infinite' }} />
            ))}
          </>
        )}

        {/* EMPTY */}
        {!loading && addresses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 16px' }}>
            <MapPin size={48} color="#D1D5DB" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>No saved addresses</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px' }}>Add an address for faster checkout</p>
            <button className="press-scale" onClick={() => { setEditAddr(null); setShowForm(true); }} style={{
              background: '#16A34A', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer'
            }}>
              Add Address
            </button>
          </div>
        )}

        {/* ADDRESS CARDS */}
        {!loading && addresses.map(addr => {
          const LabelIcon = getLabelIcon(addr.label);
          const isDefault = addr.is_default;
          return (
            <div key={addr.id} style={{
              background: '#fff', borderRadius: '12px', padding: '16px',
              border: isDefault ? '1.5px solid #16A34A' : '1.5px solid transparent',
              boxShadow: isDefault ? '0 4px 12px rgba(22,163,74,0.08)' : '0 2px 8px rgba(0,0,0,0.03)',
              position: 'relative', transition: 'all 0.2s'
            }}>
              {/* Default badge */}
              {isDefault && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '4px', background: '#DCFCE7', color: '#166534', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}>
                  <Star size={12} fill="#166534" /> Default
                </div>
              )}

              {/* Label + icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LabelIcon size={16} color="#6B7280" />
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>{addr.label}</span>
              </div>

              {/* Address text */}
              <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.4, marginBottom: '4px' }}>{addr.address}</p>
              {addr.landmark && <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Near {addr.landmark}</p>}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: '1px solid #F3F4F6', paddingTop: '12px' }}>
                {!isDefault && (
                  <button className="press-scale" onClick={() => handleSetDefault(addr.id)} style={{
                    flex: 1, height: '34px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #DCFCE7',
                    borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                  }}>
                    <Star size={14} /> Set Default
                  </button>
                )}
                <button className="press-scale" onClick={() => handleEdit(addr)} style={{
                  flex: 1, height: '34px', background: '#fff', color: '#374151', border: '1px solid #E5E7EB',
                  borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}>
                  <Edit3 size={14} /> Edit
                </button>
                <button className="press-scale" onClick={() => handleDelete(addr.id)} style={{
                  height: '34px', width: '34px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA',
                  borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {/* ADD BUTTON (floating at bottom if cards exist) */}
        {!loading && addresses.length > 0 && (
          <button className="press-scale" onClick={() => { setEditAddr(null); setShowForm(true); }} style={{
            width: '100%', height: '48px', background: '#fff', border: '1.5px dashed #16A34A', borderRadius: '12px',
            color: '#16A34A', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px'
          }}>
            <Plus size={18} /> Add New Address
          </button>
        )}
      </div>

      {/* ── ADDRESS FORM MODAL ── */}
      {showForm && (
        <AddressForm
          onClose={() => { setShowForm(false); setEditAddr(null); }}
          onSaved={handleFormSaved}
          editAddress={editAddr}
        />
      )}
    </div>
  );
}
