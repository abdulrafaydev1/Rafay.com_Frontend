import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './AddToCartToast.css';

const resolveImageUrl = (image) => {
  if (!image) return 'https://placehold.co/800x1000/efefef/111?text=No+Image';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/')) return `http://localhost:5000${image}`;
  return `http://localhost:5000/images/${image}`;
};

export default function AddToCartToast() {
  const navigate = useNavigate();
  const { toast, dismissToast } = useCart();

  if (!toast || !toast.visible) {
    return null;
  }

  const handleViewCart = () => {
    dismissToast();
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    dismissToast();
  };

  return (
    <div className="cart-toast-wrapper" role="status" aria-live="polite">
      <div className="cart-toast">
        <button
          type="button"
          className="cart-toast-close"
          onClick={dismissToast}
          aria-label="Close notification"
        >
          ×
        </button>

        <div className="cart-toast-header">
          <span className="cart-toast-check">✓</span>
          <span>Added to Cart</span>
        </div>

        <div className="cart-toast-product">
          <img
            src={resolveImageUrl(toast.product?.image)}
            alt={toast.product?.name || 'Product'}
            className="cart-toast-image"
            onError={(event) => {
              event.currentTarget.src = 'https://placehold.co/800x1000/efefef/111?text=No+Image';
            }}
          />

          <div className="cart-toast-copy">
            <h3>{toast.product?.name || 'Product'}</h3>
            <p>Successfully added{toast.quantity > 1 ? ` × ${toast.quantity}` : ''}</p>
          </div>
        </div>

        <div className="cart-toast-actions">
          <button type="button" className="cart-toast-primary" onClick={handleViewCart}>
            View Cart
          </button>
          <button type="button" className="cart-toast-secondary" onClick={handleContinueShopping}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
