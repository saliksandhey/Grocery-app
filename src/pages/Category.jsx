import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Category() {
  const { id } = useParams();
  const navigate = useNavigate();
  const categoryName = decodeURIComponent(id || '');
  const products = useAppStore(s => s.products);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [activeSubCat, setActiveSubCat] = useState('All');
  const [isReady, setIsReady] = useState(false);

  // Fake network delay for premium loading experience
  useEffect(() => {
    setIsReady(false);
    const t = setTimeout(() => setIsReady(true), 350);
    return () => clearTimeout(t);
  }, [categoryName]);

  // Handle header drop-shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const baseProducts = products.filter(p => p.category?.toLowerCase() === categoryName.toLowerCase());
  
  const displayedProducts = baseProducts.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    // Mock subcat logic: if Not 'All', optionally filter by tagging in a real app
    return true; 
  });

  const subCats = ['All', 'Premium', 'Local Fresh', 'Discounted'];

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', paddingBottom: '90px' }}>
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { scrollbar-width: none; }
        .press-scale { transition: transform 0.15s ease; }
        .press-scale:active { transform: scale(0.95); }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        /* Add expand keyframe globally for ProductCard Steppers! */
        @keyframes expand { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* ── HEADER (STICKY) ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, background: '#fff',
        height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
        borderBottom: scrolled ? '1px solid transparent' : '1px solid #f3f4f6',
        boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.04)' : 'none',
        transition: 'all 0.2s ease',
      }}>
        <div className="press-scale" onClick={() => navigate(-1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '-4px' }}>
          <ArrowLeft size={22} color="#111827" />
        </div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>
          {categoryName}
        </div>
        <div className="press-scale" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginRight: '-4px' }}>
          <Search size={20} color="#111827" />
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* ── SEARCH + FILTER BAR ── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div style={{
            flex: 1, height: '40px', background: '#fff', borderRadius: '10px',
            display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #e5e7eb',
            transition: 'border 0.2s',
          }}>
            <Search size={16} color="#9CA3AF" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in this category"
              style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: '13px', color: '#111827', fontWeight: '500' }}
            />
          </div>
          <div className="press-scale" style={{
            height: '40px', padding: '0 16px', background: '#fff', borderRadius: '20px',
            border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <Filter size={14} color="#6B7280" /> Sort
          </div>
        </div>

        {/* ── SUBCATEGORIES (PRO ROW) ── */}
        <div className="hide-scroll" style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '12px', margin: '0 -16px 12px', padding: '0 16px' }}>
          {!isReady ? (
            <>
              <div style={{ width: '60px', height: '32px', background: '#e5e7eb', borderRadius: '16px', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
              <div style={{ width: '80px', height: '32px', background: '#f3f4f6', borderRadius: '16px', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
              <div style={{ width: '70px', height: '32px', background: '#f3f4f6', borderRadius: '16px', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
            </>
          ) : (
            subCats.map(sc => {
               const active = activeSubCat === sc;
               return (
                 <div
                   key={sc}
                   onClick={() => setActiveSubCat(sc)}
                   className="press-scale"
                   style={{
                     padding: '6px 16px', borderRadius: '16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0,
                     background: active ? '#16A34A' : '#fff',
                     color: active ? '#fff' : '#4B5563',
                     border: active ? '1px solid #16A34A' : '1px solid #e5e7eb',
                     boxShadow: active ? '0 4px 10px rgba(22, 163, 74, 0.2)' : '0 2px 6px rgba(0,0,0,0.02)',
                     transition: 'all 0.2s ease'
                   }}
                 >
                   {sc}
                 </div>
               )
            })
          )}
        </div>

        {/* ── PRODUCT GRID ── */}
        {!isReady ? (
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '12px', height: '220px', animation: 'pulse 1.5s infinite', border: '1px solid #f3f4f6' }} />
              <div style={{ background: '#fff', borderRadius: '12px', padding: '12px', height: '220px', animation: 'pulse 1.5s infinite', border: '1px solid #f3f4f6' }} />
              <div style={{ background: '#fff', borderRadius: '12px', padding: '12px', height: '220px', animation: 'pulse 1.5s infinite', border: '1px solid #f3f4f6' }} />
              <div style={{ background: '#fff', borderRadius: '12px', padding: '12px', height: '220px', animation: 'pulse 1.5s infinite', border: '1px solid #f3f4f6' }} />
           </div>
        ) : displayedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 16px', color: '#9CA3AF' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🛒</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>No products found in this category</div>
            <div style={{ fontSize: '13px', marginTop: '6px' }}>Try exploring other subcategories or search terms.</div>
            <button
               onClick={() => { setSearchQuery(''); setActiveSubCat('All'); }}
               style={{ marginTop: '20px', background: '#16A34A', color: '#fff', padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            {displayedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
