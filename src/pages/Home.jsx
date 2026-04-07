import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, User, ChevronDown, ArrowRight, Zap, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import ProductCard from '../components/ProductCard';
import promoImage1 from '../assets/asset_Chips_&_namkeen_1697025537433.jpg';
import promoImage2 from '../assets/asset_V7_312x360_(2)_1774455548692.jpg';

// ── Promo banners ───────────────────────────────────────────────
const PROMOS = [
  {
    tag: 'LIMITED TIME',
    title: 'Chips & Namkeen\nUp to 30% OFF',
    sub: 'Instant delivery in minutes',
    image: promoImage1,
    gradient: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
    shadow: 'rgba(22, 163, 74, 0.3)',
  },
  {
    tag: 'FESTIVAL OFFER',
    title: 'Daily Essentials\nFlat ₹50 OFF',
    sub: 'On orders above ₹299',
    image: promoImage2,
    gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    shadow: 'rgba(217, 119, 6, 0.3)',
  },
];

// ── Countdown hook ──────────────────────────────────────────────
function useCountdown(totalSecs) {
  const [secs, setSecs] = useState(totalSecs);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return { h, m, s };
}

// ── Static categories ───────────────────────────────────────────
const STATIC_CATS = [
  { id: 'veg', name: 'Vegetables', emoji: '🥬', bg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' },
  { id: 'grain', name: 'Grains', emoji: '🌾', bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' },
  { id: 'dairy', name: 'Dairy', emoji: '🥛', bg: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)' },
  { id: 'fruit', name: 'Fruits', emoji: '🍎', bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' },
  { id: 'spice', name: 'Masala', emoji: '🫙', bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' },
  { id: 'oil', name: 'Oils', emoji: '🛢️', bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' },
];

// ── Skeleton Card ───────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '12px',
      border: '1px solid #f3f4f6',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    }}>
      <div style={{
        width: '100%',
        aspectRatio: '1/1',
        background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
        backgroundSize: '800px 100%',
        animation: 'shimmer 1.4s infinite',
        borderRadius: '8px',
        marginBottom: '12px',
      }} />
      <div style={{
        height: '14px',
        width: '80%',
        background: '#f3f4f6',
        borderRadius: '4px',
        marginBottom: '8px',
        animation: 'pulse 1.5s infinite',
      }} />
      <div style={{
        height: '12px',
        width: '50%',
        background: '#f3f4f6',
        borderRadius: '4px',
        animation: 'pulse 1.5s infinite',
      }} />
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────
export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [promoIdx, setPromoIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [activeCat, setActiveCat] = useState(null);
  const navigate = useNavigate();
  const catsRef = useRef(null);

  const products = useAppStore(s => s.products);
  const dbCategories = useAppStore(s => s.dbCategories);
  const cart = useAppStore(s => s.cart);
  const isStoreOpen = useAppStore(s => s.isStoreOpen);
  const isLoading = products.length === 0;

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const timer = useCountdown(2 * 3600 + 45 * 60);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-slide promo
  useEffect(() => {
    const t = setInterval(() => setPromoIdx(i => (i + 1) % PROMOS.length), 3000);
    return () => clearInterval(t);
  }, []);

  // Filter products
  const displayed = (() => {
    let list = products;
    if (searchQuery.trim()) list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (activeCat) list = list.filter(p => p.category === activeCat);
    return list;
  })();

  // Split products for sections
  const flashDeals = products.filter(p => p.orig_price && p.orig_price > p.price).slice(0, 8);
  const recommended = products.slice(4, 10);
  const bestSellers = products.slice(0, 4);

  // Categories merge
  const categories = dbCategories.length
    ? dbCategories.map((c, i) => ({
      id: c.id, name: c.name,
      emoji: STATIC_CATS[i % STATIC_CATS.length].emoji,
      bg: STATIC_CATS[i % STATIC_CATS.length].bg,
      image: c.image_url,
    }))
    : STATIC_CATS;

  const promo = PROMOS[promoIdx];

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', paddingBottom: '90px' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes bannerLoad { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { scrollbar-width: none; }
        .press-scale { transition: transform 0.15s ease; }
        .press-scale:active { transform: scale(0.95) !important; }
        .cat-item-wrap { transition: all 0.2s ease; cursor: pointer; }
        .cat-item-wrap:active { transform: scale(0.95); }
        .cat-item-wrap:hover .cat-icon { box-shadow: 0 4px 12px rgba(0,0,0,0.08); filter: brightness(1.02); }
        .view-all-btn { transition: opacity 0.2s ease; }
        .view-all-btn:hover { opacity: 0.7; }
      `}</style>

      {/* ═══════ HEADER ═══════ */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#fff',
        borderBottom: scrolled ? 'none' : '1px solid #f3f4f6',
        boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.04)' : 'none',
        transition: 'box-shadow 0.25s, border-bottom 0.25s',
      }}>
        {/* Top row: location + profile */}
        <div style={{ height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.5px' }}>
              Delivering to
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '500', color: '#111827', cursor: 'pointer' }}>
              Malerkotla <ChevronDown size={14} color="#6B7280" strokeWidth={2.5} />
            </div>
          </div>
          <div
            className="press-scale"
            onClick={() => navigate('/profile')}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <User size={16} color="#374151" strokeWidth={2.5} />
          </div>
        </div>

        {/* Search bar */}
        <div style={{ padding: '0 16px 12px' }}>
          <div className="press-scale" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#fff', borderRadius: '12px', height: '44px', padding: '0 14px',
            border: searchQuery ? '1.5px solid #16A34A' : '1.5px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>
            <Search size={18} color="#9ca3af" />
            <input
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: '#111827', fontWeight: '500' }}
              placeholder="Search for fruits, vegetables, groceries..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ color: '#9ca3af', padding: '4px', fontSize: '14px' }}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* ── STORE CLOSED BANNER ── */}
      {!isStoreOpen && (
        <div style={{ padding: '16px 16px 0', animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
            border: '1.5px solid #FECDD3',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex', alignItems: 'center', gap: '14px',
            boxShadow: '0 8px 24px rgba(225, 29, 72, 0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 10px rgba(225, 29, 72, 0.12)' }}>
               <Clock size={22} color="#E11D48" strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#9F1239', marginBottom: '2px', fontFamily: "'Inter', sans-serif" }}>Store Closed</div>
              <div style={{ fontSize: '13px', color: '#BE123C', fontWeight: '600' }}>We'll be back at 10:00 AM</div>
            </div>
            <button style={{
              background: '#E11D48', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)', transition: 'transform 0.15s ease'
            }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
              Notify Me
            </button>
          </div>
        </div>
      )}

      {/* ── STORE CLOSED GLOBAL OVERLAY ── */}
      {!isStoreOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(243, 244, 246, 0.25)',
          pointerEvents: 'none',
          zIndex: 40
        }} />
      )}

      {/* ═══════ CONTENT ═══════ */}
      {!searchQuery && !activeCat ? (
        <>
          {/* ── PROMO BANNER ── */}
          <div style={{ padding: '12px 16px 0', position: 'relative' }}>
            <div className="press-scale" key={promoIdx} style={{
              width: '100%', aspectRatio: '16/9', borderRadius: '16px', padding: '16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: promo.gradient, position: 'relative', overflow: 'hidden',
              boxShadow: `0 8px 24px ${promo.shadow}`,
              cursor: 'pointer',
              animation: 'bannerLoad 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
            }}>
              {/* Decorative bubbles - 10% opacity */}
              <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', right: '30%', bottom: '-30%', width: '90px', height: '90px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />

              <div style={{ position: 'relative', zIndex: 2, flex: 1, paddingRight: '8px' }}>
                <div style={{ display: 'inline-block', fontSize: '10px', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontWeight: '800', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  {promo.tag}
                </div>
                <div style={{ fontSize: '19px', fontWeight: '800', color: '#fff', whiteSpace: 'pre-line', lineHeight: 1.3, marginBottom: '6px' }}>
                  {promo.title}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '400' }}>{promo.sub}</div>
              </div>

              {/* PNG IMAGE on right side */}
              <div style={{ width: '45%', height: '80%', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                 <img 
                   src={promo.image} 
                   alt="Promo"
                   style={{
                     maxHeight: '100%',
                     maxWidth: '100%',
                     objectFit: 'contain',
                     filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.25))',
                     animation: 'floating 3s ease-in-out infinite'
                   }} 
                   onError={e => { e.target.src = 'https://placehold.co/400x400/transparent/white?text=🛒'; }}
                 />
              </div>
            </div>

            {/* Dots */}
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '12px' }}>
              {PROMOS.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setPromoIdx(i)}
                  style={{
                    width: i === promoIdx ? '20px' : '6px',
                    height: '6px', borderRadius: '3px',
                    background: i === promoIdx ? '#16A34A' : '#D1D5DB',
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── CATEGORIES ── */}
          <div style={{ marginTop: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Shop by Category</div>
              <div className="view-all-btn" onClick={() => navigate('/categories')} style={{ fontSize: '14px', color: '#16A34A', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
                View All <ArrowRight size={16} />
              </div>
            </div>
            <div className="hide-scroll" style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '0 16px 8px', scrollSnapType: 'x mandatory' }}>
              {categories.map((cat, i) => {
                const isActive = activeCat === cat.name;
                return (
                  <div
                    key={cat.id || i}
                    className="cat-item-wrap"
                    onClick={() => setActiveCat(isActive ? null : cat.name)}
                    style={{ scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, width: '72px' }}
                  >
                    <div className="cat-icon" style={{
                      width: '56px', height: '56px', borderRadius: '50%', background: cat.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 4px 12px rgba(22,163,74,0.2)' : 'inset 0 -2px 6px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)',
                      border: isActive ? '2px solid #16A34A' : '2px solid transparent',
                    }}>
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} style={{ width: '32px', height: '32px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }} loading="lazy" />
                      ) : (
                        <span style={{ display: 'block', transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s' }}>{cat.emoji}</span>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '12px', fontWeight: '500', color: '#374151', textAlign: 'center', lineHeight: 1.2,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {cat.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RECOMMENDED FOR YOU ── */}
          {recommended.length > 0 && (
            <div style={{ padding: '16px 0 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Recommended for You</span>
                </div>
                <div className="press-scale" onClick={() => navigate('/categories')} style={{ fontSize: '13px', color: '#16A34A', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
                  View All <ArrowRight size={14} />
                </div>
              </div>
              <div className="hide-scroll" style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '0 16px 8px', scrollSnapType: 'x mandatory' }}>
                {isLoading ? (
                  <><div style={{ minWidth: '155px', maxWidth: '165px' }}><SkeletonCard /></div><div style={{ minWidth: '155px', maxWidth: '165px' }}><SkeletonCard /></div></>
                ) : (
                  recommended.map(p => (
                    <div key={p.id} style={{ minWidth: '155px', maxWidth: '165px', flexShrink: 0, scrollSnapAlign: 'start' }}>
                      <ProductCard product={p} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── DAILY ESSENTIALS ── */}
          {flashDeals.length > 0 && (
            <div style={{ padding: '16px 0 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Daily Essentials</span>
                </div>
                <div className="press-scale" onClick={() => navigate('/categories')} style={{ fontSize: '13px', color: '#16A34A', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
                  View All <ArrowRight size={14} />
                </div>
              </div>
              <div className="hide-scroll" style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '0 16px 8px', scrollSnapType: 'x mandatory' }}>
                {isLoading ? (
                  <><div style={{ minWidth: '155px', maxWidth: '165px' }}><SkeletonCard /></div><div style={{ minWidth: '155px', maxWidth: '165px' }}><SkeletonCard /></div></>
                ) : (
                  flashDeals.map(p => (
                    <div key={p.id} style={{ minWidth: '155px', maxWidth: '165px', flexShrink: 0, scrollSnapAlign: 'start' }}>
                      <ProductCard product={p} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── BEST SELLERS ── */}
          <div style={{ padding: '16px 16px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Best Sellers</div>
              <div className="press-scale" onClick={() => navigate('/categories')} style={{ fontSize: '13px', color: '#16A34A', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
                View All <ArrowRight size={14} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {isLoading ? (
                <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
              ) : (
                bestSellers.map(p => <ProductCard key={p.id} product={p} />)
              )}
            </div>
          </div>
        </>
      ) : (
        /* ── SEARCH / CATEGORY RESULTS ── */
        <div style={{ padding: '16px' }}>
          {activeCat && !searchQuery && (
            <button
              className="press-scale"
              onClick={() => setActiveCat(null)}
              style={{ marginBottom: '16px', fontSize: '13px', color: '#16A34A', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              ← All categories
            </button>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
              {searchQuery ? 'Search Results' : activeCat}
            </div>
            <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{displayed.length} items</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {displayed.length > 0 ? (
              displayed.map(p => <ProductCard key={p.id} product={p} />)
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0', color: '#9CA3AF' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍃</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#6B7280' }}>No products found</div>
                <div style={{ fontSize: '13px', marginTop: '4px' }}>Try a different search term</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ CART BAR ═══════ */}
      {cartCount > 0 && (
        <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', padding: '0 16px', zIndex: 100 }}>
          <Link to="/cart" style={{
            background: '#16A34A', color: '#fff', borderRadius: '12px', padding: '14px 18px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontWeight: '700', textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(22, 163, 74, 0.35)',
            transform: 'translateY(0)',
            transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px', fontSize: '13px' }}>
                {cartCount} {cartCount > 1 ? 'items' : 'item'}
              </div>
              <span>·</span>
              <span style={{ fontSize: '15px' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
              View Cart <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}