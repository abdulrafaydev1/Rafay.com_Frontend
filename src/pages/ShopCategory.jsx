import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Newsletter from '../components/Newsletter/Newsletter';
import Footer from '../components/Footer/Footer';
import './Shop.css';

const PAGE_SIZE = 12;
const VALID_CATEGORIES = ['men', 'women', 'kids', 'accessories', 'shoes'];
const PRICE_OPTIONS = [
  { value: 'all', label: 'All prices' },
  { value: 'under-50', label: 'Under $50', min: 0, max: 49.99 },
  { value: '50-100', label: '$50 - $100', min: 50, max: 100 },
  { value: '100-200', label: '$100 - $200', min: 100, max: 200 },
  { value: '200-plus', label: '$200+', min: 200, max: Number.MAX_SAFE_INTEGER },
];
const SIZE_OPTIONS = ['all', 'XS', 'S', 'M', 'L', 'XL', '4Y', '6Y', '8Y', '10Y', '12Y', '6', '7', '8', '9', '10', '11'];
const COLOR_OPTIONS = ['all', 'Black', 'White', 'Blue', 'Red', 'Green', 'Navy', 'Grey', 'Olive', 'Stone', 'Khaki', 'Tan', 'Cream', 'Forest', 'Sand', 'Brown', 'Gold', 'Silver', 'Ivory', 'Rose', 'Taupe', 'Pink', 'Yellow'];

const resolveImageUrl = (image) => {
  if (!image) return 'https://placehold.co/800x1000/efefef/111?text=No+Image';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/')) return `http://localhost:5000${image}`;
  return `http://localhost:5000/images/${image}`;
};

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

function ShopCategory() {
  const { category: routeCategory } = useParams();
  const { addToCart } = useCart();
  const safeCategory = VALID_CATEGORIES.includes(routeCategory) ? routeCategory : null;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [size, setSize] = useState('all');
  const [color, setColor] = useState('all');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const selectedPriceConfig = useMemo(
    () => PRICE_OPTIONS.find((option) => option.value === priceRange) || PRICE_OPTIONS[0],
    [priceRange],
  );

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  const title = safeCategory ? safeCategory.charAt(0).toUpperCase() + safeCategory.slice(1) : 'Category';

  useEffect(() => {
    setPage(1);
    setCategory('all');
    setPriceRange('all');
    setSize('all');
    setColor('all');
    setSortBy('popular');
  }, [safeCategory]);

  useEffect(() => {
    if (!safeCategory) return;

    const params = {
      category: safeCategory,
      page,
      limit: PAGE_SIZE,
      sort: sortBy,
    };

    if (size !== 'all') params.size = size;
    if (color !== 'all') params.color = color;
    if (category !== 'all') params.subcategory = category;
    if (selectedPriceConfig.min !== undefined) params.minPrice = selectedPriceConfig.min;
    if (selectedPriceConfig.max !== undefined) params.maxPrice = selectedPriceConfig.max;

    setLoading(true);
    setError('');

    axios
      .get('/api/products', { params: { ...params, category: safeCategory } })
      .then((response) => {
        const items = Array.isArray(response.data) ? response.data : [];
        const totalCount = Number(response.headers?.['x-total-count'] || items.length);
        setProducts(items);
        setTotalProducts(totalCount);
      })
      .catch(() => {
        setProducts([]);
        setError('Unable to load products.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category, color, page, safeCategory, selectedPriceConfig, size, sortBy]);

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

  if (!safeCategory) {
    return (
      <main className="shop-page">
        <div className="shop-container">
          <div className="shop-state-box">
            <h3>Category Not Found</h3>
            <Link to="/shop" className="shop-state-button">Continue Shopping</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="shop-page">
      <div className="shop-container">
        <nav className="shop-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <span>{title}</span>
        </nav>

        <header className="shop-header-row">
          <div>
            <p className="shop-kicker">Collection</p>
            <h1>{title}</h1>
            <p className="shop-subtitle">Explore our latest {title.toLowerCase()} essentials.</p>
          </div>
          <div className="shop-results-count">
            {loading ? 'Loading...' : `Showing ${products.length} of ${totalProducts} products`}
          </div>
        </header>

        <div className="shop-toolbar">
          <button type="button" className="shop-mobile-filter-toggle" onClick={() => setMobileFiltersOpen(true)}>
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
                {['all', 'T-Shirts', 'Shirts', 'Jeans', 'Shoes', 'Accessories'].map((option) => (
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
                {Array.from({ length: 8 }).map((_, index) => <ProductSkeleton key={index} />)}
              </div>
            ) : error ? (
              <div className="shop-state-box">
                <h3>Unable to load products.</h3>
                <button type="button" className="shop-state-button" onClick={() => window.location.reload()}>Try Again</button>
              </div>
            ) : products.length === 0 ? (
              <div className="shop-state-box">
                <h3>No products available in this category yet.</h3>
                <Link to="/shop" className="shop-state-button">Continue Shopping</Link>
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
                  {['all', 'T-Shirts', 'Shirts', 'Jeans', 'Shoes', 'Accessories'].map((option) => (
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

export default ShopCategory;
