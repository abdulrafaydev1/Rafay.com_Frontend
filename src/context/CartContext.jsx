import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'rafay-cart';

const getStoredCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read cart from storage', error);
    return [];
  }
};

const getProductImage = (product) => {
  if (!product) return 'https://placehold.co/800x1000/efefef/111?text=No+Image';

  if (product.image) {
    if (product.image.startsWith('http://') || product.image.startsWith('https://')) return product.image;
    if (product.image.startsWith('/')) return `http://localhost:5000${product.image}`;
    return `http://localhost:5000/images/${product.image}`;
  }

  if (Array.isArray(product.images) && product.images.length) {
    const firstImage = product.images[0];
    if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) return firstImage;
    if (firstImage.startsWith('/')) return `http://localhost:5000${firstImage}`;
    return `http://localhost:5000/images/${firstImage}`;
  }

  return 'https://placehold.co/800x1000/efefef/111?text=No+Image';
};

const buildCartItemKey = (product, options = {}) => {
  const itemId = product?.id ?? 'unknown';
  const size = options.size || 'no-size';
  const color = options.color || 'no-color';
  return `${itemId}-${size}-${color}`;
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => getStoredCart());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (!toast) return undefined;

    const timeoutId = setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => clearTimeout(timeoutId);
  }, [toast]);

  const dismissToast = () => setToast(null);

  const addToCart = (product, options = {}) => {
    if (!product || !product.id) {
      return false;
    }

    const quantity = Math.max(1, Number(options.quantity ?? 1));
    const itemKey = buildCartItemKey(product, options);

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.itemKey === itemKey);

      if (existingItem) {
        return currentItems.map((item) =>
          item.itemKey === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          itemKey,
          id: product.id,
          name: product.name || 'Product',
          price: Number(product.price ?? 0),
          image: getProductImage(product),
          category: product.category || '',
          size: options.size || '',
          color: options.color || '',
          quantity,
        },
      ];
    });

    setToast({
      visible: true,
      product: {
        id: product.id,
        name: product.name || 'Product',
        image: getProductImage(product),
        price: Number(product.price ?? 0),
      },
      quantity,
      itemKey,
    });

    return true;
  };

  const removeFromCart = (itemKey) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.itemKey !== itemKey));
  };

  const updateQuantity = (itemKey, nextQuantity) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.itemKey === itemKey
            ? { ...item, quantity: Math.max(1, Number(nextQuantity) || 1) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems],
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [cartItems],
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toast,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
