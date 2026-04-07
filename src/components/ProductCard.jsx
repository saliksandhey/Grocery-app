import { Link } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import { useAppStore } from '../store';

const S = {
  card: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #f3f4f6',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    textDecoration: 'none',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: '1/1',
    background: '#f9fafb',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '8px',
    mixBlendMode: 'multiply',
  },
  badge: {
    position: 'absolute',
    top: 0,
    left: 0,
    background: '#EF4444',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 800,
    padding: '4px 6px',
    borderTopLeftRadius: '12px',
    borderBottomRightRadius: '6px',
    fontFamily: "'Nunito', sans-serif",
    zIndex: 2,
  },
  infoWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    marginTop: '4px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#111827',
    fontFamily: "'Inter', sans-serif",
    lineHeight: 1.3,
    marginBottom: '4px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  weight: {
    fontSize: '11px',
    color: '#6B7280',
    marginBottom: '8px',
    fontWeight: 500,
  },
  priceRow: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minHeight: '30px', 
  },
  price: {
    fontSize: '14px',
    fontWeight: 800,
    color: '#16A34A',
    fontFamily: "'Inter', sans-serif",
  },
  origPrice: {
    fontSize: '11px',
    color: '#9CA3AF',
    textDecoration: 'line-through',
    fontWeight: 500,
  },
  addBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#16A34A',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.4)',
  },
  stepper: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    height: '32px',
    background: '#16A34A',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 4px',
    width: '80px',
    color: '#fff',
    boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)',
    transition: 'all 0.2s ease-in-out',
    animation: 'expand 0.2s ease-out forwards',
  },
  stepBtn: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    borderRadius: '50%',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
  qtyText: {
    fontSize: '13px',
    fontWeight: 800,
    fontFamily: "'Inter', sans-serif",
  }
};

export default function ProductCard({ product }) {
  const addToCart = useAppStore(s => s.addToCart);
  const updateQty = useAppStore(s => s.updateQty);
  const cart = useAppStore(s => s.cart);

  const cartItem = cart.find(i => i.id === product.id);
  const imageUrl = product.image_url || product.image || 'https://placehold.co/200x200?text=🛒';

  const hasDiscount = product.orig_price && product.orig_price > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.orig_price - product.price) / product.orig_price) * 100)
    : null;

  return (
    <div 
      style={S.card}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Image area */}
        <div style={S.imageWrap}>
          {discountPct && <div style={S.badge}>{discountPct}% OFF</div>}
          <img
            src={imageUrl}
            alt={product.name}
            style={S.image}
            loading="lazy"
            onError={e => { e.target.src = 'https://placehold.co/200x200?text=🛒'; }}
          />
        </div>

        {/* Info */}
        <div style={S.infoWrap}>
          <div style={S.title}>{product.name}</div>
          {product.weight && <div style={S.weight}>{product.weight}</div>}
          
          <div style={S.priceRow}>
            <div style={S.price}>₹{product.price}</div>
            {hasDiscount && (
              <div style={S.origPrice}>₹{product.orig_price}</div>
            )}
          </div>
        </div>
      </Link>

      {/* Add / Qty Stepper (positioned bottom right) */}
      {cartItem ? (
        <div style={S.stepper}>
          <button
            style={S.stepBtn}
            onClick={(e) => { e.preventDefault(); updateQty(product.id, -1); }}
            aria-label="Decrease quantity"
          >
            <Minus size={14} strokeWidth={3} />
          </button>
          <span style={S.qtyText}>{cartItem.qty}</span>
          <button
            style={S.stepBtn}
            onClick={(e) => { e.preventDefault(); updateQty(product.id, 1); }}
            aria-label="Increase quantity"
          >
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
      ) : (
        <div
          style={S.addBtn}
          onClick={(e) => { e.preventDefault(); addToCart(product); }}
          aria-label={`Add ${product.name} to cart`}
        >
          <Plus size={18} strokeWidth={3} />
        </div>
      )}
    </div>
  );
}
