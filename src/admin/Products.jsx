import ProductImage from './ProductImage';
import { useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { resolveImageUrl } from '../lib/api';
import { exportCsv } from './api';
import { Badge, Button, Card, DataTable, Modal, Pagination, SearchInput } from './components';
import Icon from './icons';

const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
export default function Products({ mode = 'products' }) {
  const { data, notify } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState(null);
  const search = params.get('q') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'name';
  const pageSize = [10, 25, 50].includes(Number(params.get('size'))) ? Number(params.get('size')) : 10;
  const setFilter = (key, value) => { const next = new URLSearchParams(params); if (value) next.set(key, String(value)); else next.delete(key); next.delete('page'); setParams(next, { replace: true }); };
  const titles = { products: ['Products', 'The same products your customers browse in the storefront.'], inventory: ['Inventory', 'Product variants and stock visibility across your catalog.'], discounts: ['Discounts & Coupons', 'Active product markdowns from the storefront catalog.'], reviews: ['Reviews', 'Product rating summaries available in your store catalog.'] };
  const [title, subtitle] = titles[mode];
  const rows = data.products.filter((product) => (!search || `${product.id} ${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase())) && (!category || product.category === category) && (mode !== 'discounts' || product.oldPrice > product.price))
    .sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'popular' ? b.salesCount - a.salesCount : sort === 'rating' ? b.rating - a.rating : a.name.localeCompare(b.name));
  const page = Math.min(Math.max(1, Math.floor(Number(params.get('page')) || 1)), Math.max(1, Math.ceil(rows.length / pageSize)));
  const productColumn = { key: 'name', label: 'Product', render: (product) => <span className="ad-product-cell"><ProductImage loading="lazy" src={resolveImageUrl(product.image)} alt="" /><span><strong>{product.name}</strong><small>Product ID: {product.id}</small></span></span> };
  const columns = [productColumn, { key: 'category', label: 'Category', render: (product) => <span className="ad-capitalize">{product.category}</span> },
    ...(mode === 'reviews' ? [
      { key: 'rating', label: 'Rating', numeric: true, render: (product) => <span className="ad-rating"><Icon name="star" size={14} /> {product.rating.toFixed(1)} / 5</span> },
      { key: 'reviews', label: 'Review count', numeric: true, render: (product) => product.reviews.toLocaleString() },
    ] : [
      { key: 'price', label: 'Price', numeric: true, render: (product) => <strong>{money(product.price)}</strong> },
      ...(mode === 'discounts' ? [
        { key: 'oldPrice', label: 'Previous price', numeric: true, render: (product) => money(product.oldPrice) },
        { key: 'discount', label: 'Savings', numeric: true, render: (product) => <Badge tone="success">{Math.round((1 - product.price / product.oldPrice) * 100)}% off</Badge> },
      ] : [
        { key: 'sizes', label: 'Sizes', render: (product) => <span className="ad-muted">{product.sizes.join(', ') || '—'}</span> },
        { key: 'stock', label: 'Inventory', render: () => <Badge>Not tracked</Badge> },
      ]),
    ]),
    { key: 'action', label: 'Details', render: (product) => <Button onClick={() => setSelected(product)} aria-label={`View ${product.name}`}>View <Icon name="arrow" size={13} /></Button> },
  ];
  const exportProducts = () => {
    exportCsv(`${mode}.csv`, ['Product ID', 'Name', 'Category', 'Price USD', 'Previous Price USD', 'Rating', 'Review Count', 'Sizes', 'Colors', 'Inventory'],
      rows.map((product) => [product.id, product.name, product.category, product.price, product.oldPrice, product.rating, product.reviews, product.sizes.join('; '), product.colors.join('; '), 'Not tracked']));
    notify(`Exported ${rows.length} products.`);
  };
  return <div className="ad-stack"><section className="ad-page-heading"><div><h1>{title}</h1><p>{subtitle}</p></div><Button icon="download" onClick={exportProducts} disabled={!rows.length}>Export CSV</Button></section>
    <div className="ad-summary-strip"><div><span>Catalog products</span><strong>{data.catalog.count}</strong></div><div><span>Categories</span><strong>{data.catalog.categories.length}</strong></div><div><span>Average price</span><strong>{money(data.catalog.averagePrice)}</strong></div><div><span>{mode === 'reviews' ? 'Catalog reviews' : 'Discounted products'}</span><strong>{mode === 'reviews' ? data.catalog.reviewCount.toLocaleString() : data.catalog.discountedCount}</strong></div></div>
    <div className="ad-notice"><Icon name="help" size={17} /><span>{mode === 'inventory' ? 'Stock quantities and SKUs are not tracked. Available sizes and colors are shown from the product catalog.' : mode === 'reviews' ? 'These are catalog rating summaries. Individual review text and moderation are not available.' : mode === 'discounts' ? 'Product markdowns are shown here. Coupon management is not connected.' : 'Catalog viewing is available. Product creation and editing are not enabled for this store.'}</span></div>
    <Card className="ad-product-table"><div className="ad-table-toolbar"><SearchInput label="Search products" placeholder="Search product name, ID, category…" value={search} onChange={(value) => setFilter('q', value)} /><label className="ad-filter"><Icon name="filter" size={15} /><select aria-label="Filter by category" value={category} onChange={(event) => setFilter('category', event.target.value)}><option value="">All categories</option>{data.catalog.categories.map((name) => <option key={name} value={name}>{name}</option>)}</select></label><select aria-label="Sort products" value={sort} onChange={(event) => setFilter('sort', event.target.value)}><option value="name">Name: A–Z</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="popular">Catalog sales count</option><option value="rating">Highest rated</option></select>{(search || category) && <Button onClick={() => setParams({})}>Clear filters</Button>}<Badge>{rows.length} products</Badge></div><DataTable caption={title} columns={columns} rows={rows.slice((page - 1) * pageSize, page * pageSize)} onRowClick={setSelected} emptyTitle="No products found" emptyDescription="Try another search or clear your filters." /><Pagination total={rows.length} page={page} pageSize={pageSize} onPageChange={(value) => { const next = new URLSearchParams(params); next.set('page', String(value)); setParams(next, { replace: true }); }} onPageSizeChange={(value) => setFilter('size', value)} /></Card>
    {selected && <Modal wide title="Product details" onClose={() => setSelected(null)}><div className="ad-product-detail"><ProductImage className="ad-detail-image" src={resolveImageUrl(selected.image)} alt={selected.name} /><div><Badge tone="success">Published catalog</Badge><h3>{selected.name}</h3><p className="ad-detail-price">{money(selected.price)} {selected.oldPrice && <del>{money(selected.oldPrice)}</del>}</p><p>{selected.description}</p><dl><div><dt>Product ID</dt><dd>{selected.id}</dd></div><div><dt>Category</dt><dd className="ad-capitalize">{selected.category}</dd></div><div><dt>Sizes</dt><dd>{selected.sizes.join(', ') || '—'}</dd></div><div><dt>Colors</dt><dd>{selected.colors.join(', ') || '—'}</dd></div><div><dt>Rating</dt><dd>{selected.rating} / 5 · {selected.reviews} catalog reviews</dd></div><div><dt>Inventory</dt><dd>Not tracked</dd></div></dl><Link to={`/product/${selected.id}`} target="_blank" rel="noreferrer" className="ad-button ad-primary">View in storefront <Icon name="arrow" size={14} /></Link></div></div></Modal>}
  </div>;
}
