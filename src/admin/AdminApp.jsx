import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { adminRequest } from './api';
import AdminLogin from './Login';
import AdminLayout from './Layout';
import Overview from './Overview';
import Products from './Products';
import { ModulePage, Categories, Analytics, Staff, Settings } from './pages';
import { ErrorState, LoadingSkeleton } from './components';
import './admin.css';

export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const verify = useCallback(async (signal) => {
    try {
      const value = await adminRequest('/session', { signal });
      if (signal?.aborted) return;
      setSession(value);
      setError(null);
    } catch (err) {
      if (signal?.aborted || err.name === 'AbortError') return;
      setSession(null);
      setError(err.message);
    }
    finally { if (!signal?.aborted) setChecking(false); }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    adminRequest('/session', { signal: controller.signal })
      .then((value) => { if (!controller.signal.aborted) { setSession(value); setError(null); } })
      .catch((err) => { if (!controller.signal.aborted && err.name !== 'AbortError') setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setChecking(false); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const expire = () => { setSession(null); setError(null); setExpired(true); };
    window.addEventListener('admin-session-expired', expire);
    return () => window.removeEventListener('admin-session-expired', expire);
  }, []);
  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(() => { setSession(null); setExpired(true); }, Math.max(0, session.expiresAt - Date.now()));
    const focus = () => verify();
    const navigation = () => verify();
    window.addEventListener('focus', focus);
    window.addEventListener('pageshow', navigation);
    return () => { clearTimeout(timer); window.removeEventListener('focus', focus); window.removeEventListener('pageshow', navigation); };
  }, [session, verify]);
  const logout = async () => {
    try { await adminRequest('/logout', { method: 'POST', body: {}, csrfToken: session.csrfToken }); }
    catch (err) { if (err.status !== 401) throw err; }
    setSession(null); setError(null); setExpired(false); navigate('/admin/login', { replace: true });
  };
  return <div className="ad-root">
    {checking ? <LoadingSkeleton full /> : error ? <main className="ad-service-error"><ErrorState message={error} onRetry={() => { setChecking(true); verify(); }} /></main> : !session ? <>
      {location.pathname !== '/admin/login' && <Navigate to="/admin/login" replace />}
      <AdminLogin expired={expired && location.pathname === '/admin/login'} onLogin={(value) => { setSession(value); setError(null); setExpired(false); navigate('/admin/dashboard', { replace: true }); }} />
    </> : <Routes>
      <Route path="login" element={<Navigate to="/admin/dashboard" replace />} />
      <Route element={<AdminLayout session={session} onLogout={logout} />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Overview />} />
        <Route path="products" element={<Products />} />
        <Route path="products/categories" element={<Categories />} />
        <Route path="products/inventory" element={<Products mode="inventory" />} />
        <Route path="inventory" element={<Products mode="inventory" />} />
        <Route path="categories" element={<Categories />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="discounts" element={<Products mode="discounts" />} />
        <Route path="reviews" element={<Products mode="reviews" />} />
        <Route path="staff" element={<Staff />} />
        <Route path="settings" element={<Settings />} />
        {['orders', 'customers', 'payments', 'returns', 'shipping', 'taxes', 'marketing', 'apps', 'notifications'].map((page) => <Route key={page} path={page} element={<ModulePage page={page} />} />)}
        <Route path="*" element={<ModulePage page="not-found" />} />
      </Route>
    </Routes>}
  </div>;
}
