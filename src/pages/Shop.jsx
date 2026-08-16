import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, resolveImageUrl } from '../lib/api';
import { useCart } from '../context/CartContext';
import '../components/Newsletter/newsletter.css';
import Newsletter from '../components/Newsletter/Newsletter';
import Footer from '../components/Footer/Footer';
import './Shop.css';

const PAGE_SIZE = 12;
const CATEGORY_OPTIONS = ['all', 'T-Shirts', 'Shirts', 'Jeans', 'Shoes', 'Accessories'];
const PRICE_OPTIONS = [
  { value: 'all', label: 'All prices' },
  { value: 'under-50', label: 'Under $50', min: 0, max: 49.99 },
  { value: '50-100', label: '$50 - $100', min: 50, max: 100 },
  { value: '100-200', label: '$100 - $200', min: 100, max: 200 },
  { value: '200-plus', label: '$200+', min: 200, max: Number.MAX_SAFE_INTEGER },
];
const SIZE_OPTIONS = ['all', 'S', 'M', 'L', 'XL', '6', '7', '8', '9', '10'];
const COLOR_OPTIONS = ['all', 'Black', 'White', 'Blue', 'Red', 'Green', 'Navy', 'Grey', 'Olive', 'Stone', 'Khaki', 'Tan', 'Cream', 'Forest', 'Sand', 'Brown', 'Gold', 'Silver'];

const getDiscountPercent = (product) => {
  if (!product || !product.oldPrice || product.oldPrice <= product.price) return null;
  return `-${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%`;
};

const formatPrice = (value) => `$${Number(value || 0).toFixed(2).replace(/\.00$/, '')}`;

function ProductCard({ product, onAddToCart }) {
  const discount = getDiscountPercent(product);

  return (
    <article className="shop-product-card">
      <Link to={`/product/${product.id}`} className="shop-product-image-wrap" aria-label={`View ${product.name}`}>
        <img
          src={resolveImageUrl(product.image || product.images?.[0])}
          alt={product.name}
          className="shop-product-image"
          onError={(event) => {
            event.currentTarget.src = 'https://placehold.co/800x1000/efefef/111?text=No+Image';
          }}
        />
        {discount && <span className="shop-discount-badge">{discount}</span>}
      </Link>

      <div className="shop-product-body">
        <div className="shop-product-meta">
          <div className="shop-rating" aria-label={`Rated ${product.rating || 4.5} out of 5`}>
            <span>★★★★★</span>
            <small>{Number(product.rating || 4.5).toFixed(1)}</small>
          </div>
          <span className="shop-review-count">({product.reviews || 0})</span>
        </div>

        <Link to={`/product/${product.id}`} className="shop-product-name">{product.name}</Link>

        <div className="shop-price-row">
          <span className="shop-current-price">{formatPrice(product.price)}</span>
          {product.oldPrice && <span className="shop-old-price">{formatPrice(product.oldPrice)}</span>}
        </div>

        <button
          type="button"
          className="shop-add-cart"
          onClick={(event) => {
            event.preventDefault();
            onAddToCart(product);
          }}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

function ProductSkeleton() {
  return (
    <div className="shop-skeleton-card" aria-hidden="true">
      <div className="shop-skeleton-image" />
      <div className="shop-skeleton-line short" />
      <div className="shop-skeleton-line" />
      <div className="shop-skeleton-line tiny" />
    </div>
  );
}

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || 'all');
  const [size, setSize] = useState(searchParams.get('size') || 'all');
  const [color, setColor] = useState(searchParams.get('color') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');
  const [totalProducts, setTotalProducts] = useState(0);

  const selectedPriceConfig = useMemo(
    () => PRICE_OPTIONS.find((option) => option.value === priceRange) || PRICE_OPTIONS[0],
    [priceRange],
  );

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (category !== 'all') nextParams.set('category', category);
    if (priceRange !== 'all') nextParams.set('price', priceRange);
    if (size !== 'all') nextParams.set('size', size);
    if (color !== 'all') nextParams.set('color', color);
    if (sortBy !== 'popular') nextParams.set('sort', sortBy);
    if (page > 1) nextParams.set('page', String(page));

    setSearchParams(nextParams, { replace: true });
  }, [category, color, page, priceRange, setSearchParams, size, sortBy]);

  useEffect(() => {
    const source = { page, limit: PAGE_SIZE, sort: sortBy };

    if (category !== 'all') source.category = category;
    if (size !== 'all') source.size = size;
    if (color !== 'all') source.color = color;
    if (selectedPriceConfig.min !== undefined) source.minPrice = selectedPriceConfig.min;
    if (selectedPriceConfig.max !== undefined) source.maxPrice = selectedPriceConfig.max;

    setLoading(true);
    setError('');

    api
      .get('/api/products', { params: source })
      .then((response) => {
        const items = Array.isArray(response.data) ? response.data : [];
        const totalCount = Number(response.headers?.['x-total-count'] || items.length);
        setProducts(items);
        setTotalProducts(totalCount);
      })
      .catch(() => {
        setError('Unable to load products.');
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category, color, page, selectedPriceConfig, size, sortBy]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const handleAddToCart = (product) => {
    addToCart(product, {
      size: product.sizes?.[0] || '',
      color: product.colors?.[0] || '',
      quantity: 1,
    });
  };

  const clearFilters = () => {
    setCategory('all');
    setPriceRange('all');
    setSize('all');
    setColor('all');
    setSortBy('popular');
    setPage(1);
    setMobileFiltersOpen(false);
  };

  const filterSummary = `${totalProducts} product${totalProducts === 1 ? '' : 's'}`;

  return (
    <main className="shop-page">
      <div className="shop-container">
        <nav className="shop-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Shop</span>
        </nav>

        <header className="shop-header-row">
          <div>
            <p className="shop-kicker">Collection</p>
            <h1>Shop All Products</h1>
            <p className="shop-subtitle">Explore our latest collection of fashion and essentials.</p>
          </div>

          <div className="shop-results-count">
            {loading ? 'Loading...' : `Showing ${products.length} of ${filterSummary}`}
          </div>
        </header>

        <div className="shop-toolbar">
          <button
            type="button"
            className="shop-mobile-filter-toggle"
            onClick={() => setMobileFiltersOpen(true)}
          >
            Filter & Sort
          </button>

          <div className="shop-sort-wrap">
            <label htmlFor="shop-sort">Sort by</label>
            <select id="shop-sort" value={sortBy} onChange={(event) => { setSortBy(event.target.value); setPage(1); }}>
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="shop-layout">
          <aside className="shop-filters desktop-filters">
            <div className="shop-filter-group">
              <h3>Category</h3>
              <div className="shop-filter-list">
                {CATEGORY_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={`filter-chip ${category === option ? 'active' : ''}`}
                    onClick={() => {
                      setCategory(option);
                      setPage(1);
                    }}
                  >
                    {option === 'all' ? 'All' : option}
                  </button>
                ))}
              </div>
            </div>

            <div className="shop-filter-group">
              <h3>Price</h3>
              <div className="shop-filter-list">
                {PRICE_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={`filter-chip ${priceRange === option.value ? 'active' : ''}`}
                    onClick={() => {
                      setPriceRange(option.value);
                      setPage(1);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="shop-filter-group">
              <h3>Size</h3>
              <div className="shop-filter-list inline-list">
                {SIZE_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={`filter-chip ${size === option ? 'active' : ''}`}
                    onClick={() => {
                      setSize(option);
                      setPage(1);
                    }}
                  >
                    {option === 'all' ? 'All' : option}
                  </button>
                ))}
              </div>
            </div>

            <div className="shop-filter-group">
              <h3>Color</h3>
              <div className="shop-filter-list inline-list">
                {COLOR_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={`filter-chip ${color === option ? 'active' : ''}`}
                    onClick={() => {
                      setColor(option);
                      setPage(1);
                    }}
                  >
                    {option === 'all' ? 'All' : option}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="shop-clear-button" onClick={clearFilters}>Clear Filters</button>
          </aside>

          <section className="shop-products-area">
            {loading ? (
              <div className="shop-product-grid">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="shop-state-box">
                <h3>Unable to load products.</h3>
                <button type="button" className="shop-state-button" onClick={() => window.location.reload()}>
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="shop-state-box">
                <h3>No products found</h3>
                <button type="button" className="shop-state-button" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="shop-product-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>

                <div className="shop-pagination" aria-label="Pagination">
                  <button
                    type="button"
                    className="shop-page-button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <button
                      type="button"
                      key={pageNumber}
                      className={`shop-page-number ${pageNumber === page ? 'active' : ''}`}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="shop-page-button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="shop-mobile-overlay" onClick={() => setMobileFiltersOpen(false)}>
          <div className="shop-mobile-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="shop-mobile-drawer-header">
              <h3>Filter & Sort</h3>
              <button type="button" className="shop-close-drawer" onClick={() => setMobileFiltersOpen(false)}>✕</button>
            </div>

            <div className="shop-mobile-scroll">
              <div className="shop-filter-group">
                <h3>Category</h3>
                <div className="shop-filter-list">
                  {CATEGORY_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`filter-chip ${category === option ? 'active' : ''}`}
                      onClick={() => setCategory(option)}
                    >
                      {option === 'all' ? 'All' : option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="shop-filter-group">
                <h3>Price</h3>
                <div className="shop-filter-list">
                  {PRICE_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={`filter-chip ${priceRange === option.value ? 'active' : ''}`}
                      onClick={() => setPriceRange(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="shop-filter-group">
                <h3>Size</h3>
                <div className="shop-filter-list inline-list">
                  {SIZE_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`filter-chip ${size === option ? 'active' : ''}`}
                      onClick={() => setSize(option)}
                    >
                      {option === 'all' ? 'All' : option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="shop-filter-group">
                <h3>Color</h3>
                <div className="shop-filter-list inline-list">
                  {COLOR_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`filter-chip ${color === option ? 'active' : ''}`}
                      onClick={() => setColor(option)}
                    >
                      {option === 'all' ? 'All' : option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="shop-filter-group">
                <h3>Sort by</h3>
                <select className="shop-mobile-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            <div className="shop-mobile-actions">
              <button type="button" className="shop-clear-button" onClick={clearFilters}>Clear</button>
              <button
                type="button"
                className="shop-apply-button"
                onClick={() => {
                  setPage(1);
                  setMobileFiltersOpen(false);
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <Newsletter />
      <Footer />
    </main>
  );
}

export default Shop;
