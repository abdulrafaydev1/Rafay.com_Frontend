import { lazy, Suspense, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/navbar/Navbar'
import AuthModal from './components/AuthModal'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ShopCategory from './pages/ShopCategory'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import AddToCartToast from './components/AddToCartToast'

const AdminApp = lazy(() => import('./admin/AdminApp'))

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const location = useLocation()

  if (/^\/admin(?:\/|$)/.test(location.pathname)) {
    return <Suspense fallback={<div role="status" style={{ padding: 40 }}>Loading admin portal…</div>}>
      <Routes><Route path="/admin/*" element={<AdminApp />} /></Routes>
    </Suspense>
  }

  return (
    <>
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/men" element={<ShopCategory category="men" />} />
        <Route path="/shop/women" element={<ShopCategory category="women" />} />
        <Route path="/shop/kids" element={<ShopCategory category="kids" />} />
        <Route path="/shop/accessories" element={<ShopCategory category="accessories" />} />
        <Route path="/shop/shoes" element={<ShopCategory category="shoes" />} />
        <Route path="/shop/:category" element={<ShopCategory />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart onOpenAuth={() => setIsAuthOpen(true)} />} />
      </Routes>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <AddToCartToast />
      <ScrollToTop />
    </>
  )
}

export default App
