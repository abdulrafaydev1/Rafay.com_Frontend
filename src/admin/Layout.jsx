import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { adminRequest } from './api';
import { Badge, Button, ErrorState, LoadingSkeleton, Menu, Modal, SearchInput } from './components';
import Icon from './icons';

const groups = [
  ['Main', [['dashboard', 'Dashboard', 'grid'], ['analytics', 'Analytics & BI', 'chart']]],
  ['Management', [['orders', 'Orders', 'bag'], ['products', 'Products', 'box'], ['customers', 'Customers', 'users']]],
  ['Finance & Operations', [['payments', 'Payments & Payouts', 'wallet'], ['returns', 'Returns & Refunds', 'returns'], ['shipping', 'Shipping & Logistics', 'truck'], ['taxes', 'Taxes & Duties', 'receipt']]],
  ['Growth', [['discounts', 'Discounts & Coupons', 'tag'], ['marketing', 'Marketing', 'megaphone'], ['reviews', 'Reviews', 'star']]],
  ['System', [['staff', 'Staff & Roles', 'badge'], ['apps', 'Apps', 'puzzle'], ['settings', 'Settings', 'settings']]],
];
function SidebarContent({ collapsed, onCollapse, onNavigate, data, live }) {
  const location = useLocation();
  return <><div className="ad-sidebar-brand"><Link to="/admin" className="ad-brand" aria-label="RafayCommerce dashboard" onClick={onNavigate}><span className="ad-brand-mark"><Icon name="box" size={23} /></span><span className="ad-sidebar-label">RafayCommerce</span></Link>{!collapsed && <Badge>Admin</Badge>}</div>
    {!collapsed && <Menu label="Select store" className="ad-store-menu" trigger={<><span className="ad-dot" /> Rafay.com Store <Icon name="down" size={14} /></>}><span className="ad-menu-label">CURRENT STORE</span><Link to="/" target="_blank" rel="noreferrer"><Icon name="globe" /> Visit Rafay.com <Icon name="arrow" size={14} /></Link></Menu>}
    <nav className="ad-navigation" aria-label="Admin navigation">{groups.map(([label, items]) => <div className="ad-nav-group" key={label}><span className="ad-nav-label">{label}</span>{items.map(([path, name, icon]) => <div key={path}><NavLink end={path === 'dashboard'} to={`/admin${path ? '/' + path : ''}`} className={({ isActive }) => `ad-nav-link ${isActive ? 'ad-active' : ''}`} title={collapsed ? name : undefined} onClick={onNavigate}><Icon name={icon} size={17} /><span className="ad-sidebar-label">{name}</span>{!collapsed && path === 'dashboard' && live && <Badge tone="success">Live</Badge>}{!collapsed && path === 'products' && data && <Badge>{data.catalog.count}</Badge>}</NavLink>{path === 'products' && !collapsed && /\/admin\/(products|inventory|categories)/.test(location.pathname) && <div className="ad-subnav">{[['products', 'All products'], ['products/categories', 'Categories'], ['products/inventory', 'Inventory']].map(([href, title]) => <NavLink end key={href} to={`/admin/${href}`} onClick={onNavigate}>{title}</NavLink>)}</div>}</div>)}</div>)}</nav>
    <div className="ad-sidebar-footer">{!collapsed && <Badge dot tone={data ? 'success' : 'neutral'}>{data ? 'Catalog connected' : 'Connecting'}</Badge>}<Button icon={collapsed ? 'chevron' : 'collapse'} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={onCollapse} /></div></>;
}

export default function AdminLayout({ session, onLogout }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [modal, setModal] = useState('');
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [clock, setClock] = useState(() => new Date());
  const [logoutPending, setLogoutPending] = useState(false);
  const requestId = useRef(0);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const reload = useCallback(async (signal) => {
    const id = ++requestId.current;
    setBusy(true);
    try { const result = await adminRequest('/overview', { signal }); if (id === requestId.current) { setData(result); setError(''); } }
    catch (err) { if (err.name !== 'AbortError' && id === requestId.current) setError(err.message); }
    finally { if (!signal?.aborted && id === requestId.current) setBusy(false); }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    adminRequest('/overview', { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) setData(result); })
      .catch((err) => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => { if (document.visibilityState === 'visible') reload(); }, 30000);
    return () => clearInterval(timer);
  }, [live, reload]);
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    const shortcut = (event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'k') { event.preventDefault(); searchRef.current?.focus(); } };
    window.addEventListener('keydown', shortcut);
    return () => { clearInterval(timer); window.removeEventListener('keydown', shortcut); };
  }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 5000); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    const page = groups.flatMap(([, items]) => items).find(([path]) => path && location.pathname.endsWith('/' + path))?.[1] || 'Dashboard';
    const previous = document.title; document.title = `${page} · RafayCommerce Admin`;
    window.scrollTo(0, 0);
    return () => { document.title = previous; };
  }, [location.pathname]);
  const pageTitle = groups.flatMap(([, items]) => items).find(([path]) => path && location.pathname.endsWith('/' + path))?.[1] || 'Dashboard';
  const logout = async () => {
    setLogoutPending(true);
    try { await onLogout(); } catch (err) { setToast(err.message); setLogoutPending(false); }
  };
  return <div className={`ad-shell ${collapsed ? 'ad-collapsed' : ''}`}>
    <a href="#admin-content" className="ad-skip-link">Skip to content</a>
    <aside className="ad-sidebar"><SidebarContent collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} data={data} live={live} /></aside>
    <div className="ad-workspace"><header className="ad-header">
      <Button className="ad-mobile-menu" icon="menu" aria-label="Open navigation" onClick={() => setDrawer(true)} />
      <div className="ad-breadcrumb"><Link to="/admin">RafayCommerce</Link><Icon name="chevron" size={12} /><span>{pageTitle}</span></div>
      <span className="ad-clock"><span className="ad-dot" />UTC {clock.toISOString().slice(11, 19)}</span>
      <form className="ad-global-search" onSubmit={(event) => { event.preventDefault(); navigate(`/admin/products?q=${encodeURIComponent(search)}`); }}><SearchInput inputRef={searchRef} value={search} onChange={setSearch} label="Search catalog" placeholder="Search products…" /><kbd>⌘K</kbd></form>
      <div className="ad-header-actions"><Menu label="Current store" className="ad-header-store" trigger={<><span className="ad-dot" /> Rafay.com Store <Icon name="down" size={12} /></>}><Link to="/" target="_blank" rel="noreferrer"><Icon name="globe" /> Open storefront</Link></Menu><Button primary icon="plus" onClick={() => setModal('create')}>Create</Button>
      <Link className="ad-icon-link" to="/admin/notifications" aria-label="Notifications"><Icon name="bell" /></Link><Button className="ad-help-button" icon="help" aria-label="Help and support" onClick={() => setModal('help')} />
      <Menu label="Admin account menu" trigger={<><span className="ad-avatar">RA<span /></span><span className="ad-profile-text"><strong>Store Administrator</strong><small>Head of Operations</small></span><Icon name="down" size={12} /></>}><span className="ad-menu-label">{session.admin.email}</span><Link to="/admin/settings"><Icon name="settings" /> Account settings</Link><Link to="/" target="_blank" rel="noreferrer"><Icon name="globe" /> View store</Link><button onClick={logout} disabled={logoutPending}><Icon name="logout" />{logoutPending ? 'Signing out…' : 'Logout'}</button></Menu></div>
    </header>
    <main id="admin-content" tabIndex={-1} className="ad-content">{error && <ErrorState message={error} onRetry={() => reload()} />}{data ? <Outlet context={{ data, reload, busy, live, setLive, notify: setToast, session, onLogout: logout, logoutPending }} /> : !error && <LoadingSkeleton />}</main>
    <footer className="ad-page-footer"><span>RafayCommerce · Merchant workspace</span><span>{data ? `Catalog synced ${new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Connecting to store'}</span></footer></div>
    {drawer && <Modal title="Navigation" onClose={() => setDrawer(false)}><div className="ad-drawer-content"><SidebarContent collapsed={false} onCollapse={() => setDrawer(false)} onNavigate={() => setDrawer(false)} data={data} live={live} /></div></Modal>}
    {modal && <Modal title={modal === 'create' ? 'Create a product' : 'Your merchant workspace'} onClose={() => setModal('')}>
      <div className="ad-modal-body">{modal === 'create' ? <><Badge>Catalog viewing available</Badge><h3>Product publishing is not available yet.</h3><p>Your current store provides a product catalog. Adding or changing products will be available when product publishing is enabled.</p><Link className="ad-button ad-primary" to="/admin/products" onClick={() => setModal('')}>Browse products <Icon name="arrow" size={15} /></Link></> : <><p>Explore the catalog, filter products, inspect product details, and export your current view. Catalog analytics show the information available from your store.</p><p>Sales, fulfillment, and customer reports appear when those services are connected. A dash means information is unavailable.</p><p>Use <kbd>Ctrl / ⌘ K</kbd> to search products. Manage your session from the account menu.</p></>}</div>
    </Modal>}
    {toast && <div className="ad-toast" role="status"><Icon name="help" size={18} /><span>{toast}</span><Button icon="close" aria-label="Dismiss notification" onClick={() => setToast('')} /></div>}
  </div>;
}
