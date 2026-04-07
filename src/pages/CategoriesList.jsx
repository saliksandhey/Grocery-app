import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store';

export default function CategoriesList() {
  const dbCategories = useAppStore(s => s.dbCategories);
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? dbCategories.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : dbCategories;

  return (
    <div style={{ paddingBottom: '100px' }}>

      {/* â”€â”€ PAGE HEADER â”€â”€ */}
      <div style={{
        background: 'var(--surface)',
        padding: '20px 16px 16px',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-1)', marginBottom: '14px', letterSpacing: '-0.02em' }}>
          All Categories
        </h1>
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={17} />
          <input
            type="text"
            id="cat-search"
            className="search-input"
            placeholder="Search categories..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ borderRadius: '12px', fontSize: '0.88rem' }}
          />
        </div>
      </div>

      {/* â”€â”€ GRID â”€â”€ */}
      <div style={{ padding: '16px' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">ðŸ—‚ï¸</div>
            <p className="empty-state-title">No categories found</p>
            <p className="empty-state-msg">Try a different search term</p>
          </div>
        ) : (
          <div className="category-grid-page">
            {filtered.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${encodeURIComponent(cat.name)}`}
                className="cat-card"
              >
                <div className="cat-card-img">
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
                <span className="cat-card-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
