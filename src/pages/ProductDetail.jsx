import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ArrowLeft, Package, Clock, CheckCircle2, ChevronDown, X, Minus, Plus } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const products = useAppStore(state => state.products);
  const addToCart = useAppStore(state => state.addToCart);
  const updateQty = useAppStore(state => state.updateQty);
  const cart = useAppStore(state => state.cart);
  const isStoreOpen = useAppStore(state => state.isStoreOpen);

  // Accordion states
  const [openSection, setOpenSection] = useState('description');
  const [isZoomed, setIsZoomed] = useState(false);

  const toggleSection = (section) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  const product = products.find(p => String(p.id) === String(id));

  if (!product) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '24px' }}>
        <Package size={64} color="var(--text-3)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-3)', marginBottom: '24px' }}>
          This product may have been removed or the link is incorrect.
        </p>
        <button 
          onClick={() => navigate('/home')} 
          className="btn btn-primary" 
          style={{ padding: '12px 24px' }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  const cartItem = cart.find(item => item.id === product.id);

  const imageUrl = product.image_url || product.image || 'https://placehold.co/400x400?text=No+Image';
  const hasDiscount = product.orig_price && product.orig_price > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.orig_price - product.price) / product.orig_price) * 100)
    : 0;

  const stockCount = product.stock !== undefined ? product.stock : 10;
  const stockIsLow = stockCount > 0 && stockCount <= 5;
  const stockStatus = stockCount === 0 ? "Out of Stock" : stockIsLow ? `Only ${stockCount} left` : "In Stock";
  const stockColor = stockCount === 0 ? "#ef4444" : stockIsLow ? "#f59e0b" : "#16A34A";

  const toggleAccordionStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', padding: '16px', background: 'white', border: 'none',
    borderBottom: '1px solid var(--border-light)', cursor: 'pointer',
    fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-1)',
    transition: 'background-color 0.2s ease',
    WebkitTapHighlightColor: 'rgba(0,0,0,0.05)'
  };

  const currentQty = cartItem ? cartItem.qty : 0;

  return (
    <div style={{ display: 'block', paddingBottom: '110px', background: 'white', minHeight: '100vh', position: 'relative' }}>
      
      {/* ── STICKY TOP NAV ── */}
      <div className="glass-header" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-1)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1, fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </div>
      </div>

      {/* ── ZOOM MODAL ── */}
      {isZoomed && (
        <div 
          onClick={() => setIsZoomed(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1, transition: 'opacity 0.3s' }}
        >
          <button style={{ position: 'absolute', top: 20, right: 20, color: 'white', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: '8px' }}>
            <X size={24} />
          </button>
          <img src={imageUrl} alt={product.name} style={{ width: '100%', maxHeight: '90%', objectFit: 'contain' }} />
        </div>
      )}

      {/* ── IMAGE CAROUSEL SECTION ── */}
      <div style={{ background: 'white', position: 'relative', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ 
          display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', 
          width: '100%', padding: '24px 0', scrollbarWidth: 'none', height: '300px'
        }} className="hide-scrollbar">
          <div style={{ minWidth: '100%', scrollSnapAlign: 'center', display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <img 
              src={imageUrl} 
              alt={product.name} 
              onClick={() => setIsZoomed(true)}
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0 20px', cursor: 'zoom-in', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.06))' }}
              onError={e => { e.target.src = 'https://placehold.co/400x400?text=No+Image'; }}
            />
          </div>
        </div>
        {/* Pagination Dots */}
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border)' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border)' }} />
        </div>
      </div>

      {/* ── PRODUCT INFO ── */}
      <div style={{ padding: '20px 16px', background: 'white' }}>
        {/* Title */}
        <h1 style={{ 
          fontSize: '18px', fontWeight: 'bold', color: 'var(--text-1)', 
          lineHeight: 1.3, marginBottom: '8px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {product.name}
        </h1>
        {product.weight && (
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>
            {product.weight}
          </p>
        )}

        {/* Pricing Segment */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#16A34A', letterSpacing: '-0.02em' }}>
            ₹{product.price}
          </span>
          {hasDiscount && (
            <>
              <span style={{ textDecoration: 'line-through', color: 'var(--text-4)', fontSize: '14px', fontWeight: 500 }}>
                MRP ₹{product.orig_price}
              </span>
              <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                {discountPct}% OFF
              </span>
            </>
          )}
        </div>

        {/* Stock Badges */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--surface-2)', padding: '6px 12px', borderRadius: '8px' }}>
          <CheckCircle2 size={16} color={stockColor} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: stockColor }}>{stockStatus}</span>
        </div>
      </div>

      <div style={{ height: '8px', background: 'var(--surface-2)' }} />

      {/* ── DELIVERY INFO ── */}
      <div style={{ padding: '16px', background: 'white', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '50%', color: 'var(--primary-dark)' }}>
           <Clock size={24} />
        </div>
        <div>
          <div style={{ fontSize: '15px', color: 'var(--text-1)', fontWeight: 700 }}>Delivery in 10-15 minutes</div>
          <div style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: 500 }}>Fastest delivery to your location</div>
        </div>
      </div>

      <div style={{ height: '8px', background: 'var(--surface-2)' }} />

      {/* ── ACCORDION DETAILS ── */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Description */}
        <button onClick={() => toggleSection('description')} style={toggleAccordionStyle}>
          <span>Description</span>
          <ChevronDown size={20} color="var(--text-3)" style={{ transform: openSection === 'description' ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
        </button>
        <div style={{ 
          maxHeight: openSection === 'description' ? '500px' : '0px', 
          overflow: 'hidden', 
          transition: 'max-height 0.3s ease-in-out',
          background: 'white'
        }}>
          <div style={{ padding: '16px', color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {product.description || 'Premium quality product sourced for the best taste and health. Stored and packed carefully to ensure absolute freshness upon delivery.'}
          </div>
        </div>

        {/* Nutritional Info */}
        <button onClick={() => toggleSection('nutrition')} style={toggleAccordionStyle}>
          <span>Nutritional Information</span>
          <ChevronDown size={20} color="var(--text-3)" style={{ transform: openSection === 'nutrition' ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
        </button>
        <div style={{ 
          maxHeight: openSection === 'nutrition' ? '500px' : '0px', 
          overflow: 'hidden', 
          transition: 'max-height 0.3s ease-in-out',
          background: 'white'
        }}>
          <div style={{ padding: '16px', color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Please check the product packaging for detailed nutritional information before consumption. High in essential nutrients.
          </div>
        </div>

        {/* Reviews */}
        <button onClick={() => toggleSection('reviews')} style={toggleAccordionStyle}>
          <span>Customer Reviews</span>
          <ChevronDown size={20} color="var(--text-3)" style={{ transform: openSection === 'reviews' ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
        </button>
        <div style={{ 
          maxHeight: openSection === 'reviews' ? '500px' : '0px', 
          overflow: 'hidden', 
          transition: 'max-height 0.3s ease-in-out',
          background: 'white'
        }}>
          <div style={{ padding: '16px', color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '0.8rem' }}>4.8 ★</span>
              <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>Excellent product</span>
            </div>
            Highly recommended! The quality is top notch and delivery was extremely quick.
          </div>
        </div>
      </div>

      <div style={{ height: '32px' }} />

      {/* ── STICKY BOTTOM BAR ── */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.06)',
        background: 'white',
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '480px', zIndex: 100,
        height: '72px'
      }}>
        <div style={{ flex: '1', display: 'flex', gap: '12px', width: '100%' }}>
          {/* Stepper on left */}
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            border: '1.5px solid var(--border-light)', borderRadius: '12px', padding: '4px', height: '48px', width: '120px', background: 'var(--surface)'
          }}>
            <button 
              onClick={() => currentQty > 0 ? updateQty(product.id, -1) : null} 
              style={{ width: '40px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: currentQty > 0 ? 'var(--surface-2)' : 'transparent', color: currentQty > 0 ? 'var(--text-1)' : 'var(--text-4)', cursor: currentQty === 0 ? 'not-allowed' : 'pointer' }}
              disabled={currentQty === 0}
            >
              <Minus size={18} />
            </button>
            <span style={{ fontWeight: '800', fontSize: '16px' }}>{currentQty}</span>
            <button 
              onClick={() => addToCart(product)} 
              style={{ width: '40px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: (!isStoreOpen || stockCount === 0 || currentQty >= stockCount) ? 'var(--surface-2)' : 'var(--primary-light)', color: (!isStoreOpen || stockCount === 0 || currentQty >= stockCount) ? 'var(--text-4)' : 'var(--primary-dark)', cursor: (!isStoreOpen || stockCount === 0 || currentQty >= stockCount) ? 'not-allowed' : 'pointer' }}
              disabled={!isStoreOpen || stockCount === 0 || currentQty >= stockCount}
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Add to Cart right */}
          <button 
            className="btn btn-primary" 
            style={{ 
              flex: 1, height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '16px', fontWeight: 'bold',
              background: !isStoreOpen ? '#9CA3AF' : undefined,
              cursor: (!isStoreOpen || stockCount === 0) ? 'not-allowed' : 'pointer',
              border: !isStoreOpen ? 'none' : undefined
            }} 
            onClick={() => { if (isStoreOpen && currentQty === 0) addToCart(product); }}
            disabled={!isStoreOpen || stockCount === 0}
          >
            {!isStoreOpen ? 'Store Closed' : stockCount === 0 ? 'Out of Stock' : (currentQty > 0 ? 'Added to Cart' : 'Add to Cart')}
          </button>
        </div>
      </div>
    </div>
  );
}
