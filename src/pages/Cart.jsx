import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Newsletter from '../components/Newsletter/Newsletter';
import Footer from '../components/Footer/Footer';
import { useCart } from '../context/CartContext';
import './Cart.css';

const resolveImageUrl = (image) => {
  if (!image) return 'https://placehold.co/800x1000/efefef/111?text=No+Image';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/')) return `http://localhost:5000${image}`;
  return `http://localhost:5000/images/${image}`;
};

function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <div className="cart-item">
      <div className="cart-item-image-wrap">
        <img
          src={resolveImageUrl(item.image)}
          alt={item.name}
          className="cart-item-image"
          onError={(event) => {
            event.currentTarget.src = 'https://placehold.co/800x1000/efefef/111?text=No+Image';
          }}
        />
      </div>

      <div className="cart-item-details">
        <h3 className="cart-item-name">{item.name}</h3>
        {item.category && <p className="cart-item-category">{item.category}</p>}
        {item.size && <p className="cart-item-meta">Size: {item.size}</p>}
        {item.color && <p className="cart-item-meta">Color: {item.color}</p>}

        <div className="cart-item-bottom-row">
          <span className="cart-item-price">${item.price}</span>

          <div className="quantity-control" aria-label="Cart quantity selector">
            <button type="button" onClick={() => onDecrement(item.itemKey)} aria-label="Decrease quantity">
              −
            </button>
            <span>{item.quantity}</span>
            <button type="button" onClick={() => onIncrement(item.itemKey)} aria-label="Increase quantity">
              +
            </button>
          </div>

          <button type="button" className="remove-item-button" onClick={() => onRemove(item.itemKey)} aria-label={`Remove ${item.name}`}>
            🗑
          </button>
        </div>
      </div>

      <div className="cart-item-total">${(Number(item.price) * Number(item.quantity)).toFixed(2)}</div>
    </div>
  );
}

function OrderSummary({ subtotal, discount, deliveryFee, total, couponCode, setCouponCode, appliedCoupon, couponError, onApplyCoupon, onCheckout }) {
  return (
    <aside className="order-summary-card">
      <h2>Order Summary</h2>

      <div className="summary-row">
        <span>Subtotal</span>
        <strong>${subtotal.toFixed(2)}</strong>
      </div>

      <div className="summary-row">
        <span>Discount</span>
        <strong>- ${discount.toFixed(2)}</strong>
      </div>

      <div className="summary-row">
        <span>Delivery Fee</span>
        <strong>${deliveryFee.toFixed(2)}</strong>
      </div>

      <div className="summary-row total-row">
        <span>Total</span>
        <strong>${total.toFixed(2)}</strong>
      </div>

      <div className="coupon-box">
        <input
          type="text"
          value={couponCode}
          onChange={(event) => setCouponCode(event.target.value)}
          placeholder="Add promo code"
          aria-label="Coupon code"
        />
        <button type="button" onClick={onApplyCoupon}>Apply</button>
      </div>

      {appliedCoupon && <p className="coupon-success">Coupon applied: {appliedCoupon}</p>}
      {couponError && <p className="coupon-error">{couponError}</p>}

      <button type="button" className="checkout-button" onClick={onCheckout}>
        Go to Checkout →
      </button>
    </aside>
  );
}

export default function Cart({ onOpenAuth }) {
  const navigate = useNavigate();
  const { cartItems, subtotal, removeFromCart, updateQuantity } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const safeCartItems = useMemo(() => cartItems.map((item) => ({
    ...item,
    id: Number(item.id),
    quantity: Math.max(1, Number(item.quantity || 1)),
  })), [cartItems]);

  const discountRate = appliedCoupon === 'SAVE10' ? 0.1 : appliedCoupon === 'SHOP20' ? 0.2 : 0;
  const discount = subtotal * discountRate;
  const deliveryFee = safeCartItems.length > 0 ? 15 : 0;
  const total = subtotal - discount + deliveryFee;

  const handleQuantityChange = (itemKey, type) => {
    const item = safeCartItems.find((entry) => entry.itemKey === itemKey);
    if (!item) return;

    const nextQuantity = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
    updateQuantity(itemKey, nextQuantity);
  };

  const removeItem = (itemKey) => {
    removeFromCart(itemKey);
  };

  const handleApplyCoupon = () => {
    const normalizedCode = couponCode.trim().toUpperCase();

    if (!normalizedCode) {
      setCouponError('Please enter a coupon code.');
      setAppliedCoupon('');
      return;
    }

    const validCoupons = {
      SAVE10: 'SAVE10',
      SHOP20: 'SHOP20',
    };

    if (!validCoupons[normalizedCode]) {
      setCouponError('Invalid coupon code. Please try a valid one.');
      setAppliedCoupon('');
      return;
    }

    setAppliedCoupon(validCoupons[normalizedCode]);
    setCouponError('');
  };

  const handleCheckout = () => {
    const currentUser = JSON.parse(localStorage.getItem('shopco_current_user') || 'null');

    if (!currentUser) {
      onOpenAuth?.();
      return;
    }

    navigate('/checkout');
  };

  return (
    <main className="cart-page">
      <div className="cart-container">
        <nav className="cart-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Cart</span>
        </nav>

        <h1 className="cart-page-title">YOUR CART</h1>

        {safeCartItems.length === 0 ? (
          <div className="empty-cart-state">
            <h2>Your cart is empty</h2>
            <p>You haven't added any products yet.</p>
            <Link to="/shop" className="empty-cart-button">Continue Shopping</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items-panel" aria-label="Cart items">
              {safeCartItems.map((item) => (
                <CartItem
                  key={item.itemKey}
                  item={item}
                  onIncrement={() => handleQuantityChange(item.itemKey, 'increase')}
                  onDecrement={() => handleQuantityChange(item.itemKey, 'decrease')}
                  onRemove={() => removeItem(item.itemKey)}
                />
              ))}
            </section>

            <OrderSummary
              subtotal={subtotal}
              discount={discount}
              deliveryFee={deliveryFee}
              total={total}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              appliedCoupon={appliedCoupon}
              couponError={couponError}
              onApplyCoupon={handleApplyCoupon}
              onCheckout={handleCheckout}
            />
          </div>
        )}
      </div>

      <Newsletter />
      <Footer />
    </main>
  );
}
