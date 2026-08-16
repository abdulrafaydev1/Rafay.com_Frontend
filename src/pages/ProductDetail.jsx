import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, resolveImageUrl } from '../lib/api'
import { useCart } from '../context/CartContext'
import ProductImageZoom from '../components/ProductImageZoom'
import '../components/ProductDetail.css'

function ProductDetail() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('details')
  const [visibleReviews, setVisibleReviews] = useState(4)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const { addToCart } = useCart()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

    api
      .get('/api/products')
      .then((response) => {
        setAllProducts(response.data || [])
      })
      .catch((err) => {
        console.error('Failed to load product list', err)
      })

    api
      .get(`/api/products/${productId}`)
      .then((response) => {
        const item = response.data
        setProduct(item)
        setSelectedColor(item?.colors?.[0] ?? '#000000')
        setSelectedSize(item?.sizes?.[0] ?? '')
        setSelectedImage(0)
      })
      .catch((err) => {
        console.error('Failed to load product detail', err)
        setError('Product not found')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [productId])

  if (loading) {
    return <main className="product-detail-page"><div className="container"><p>Loading product...</p></div></main>
  }

  if (error || !product) {
    return (
      <main className="product-detail-empty">
        <div className="empty-state">
          <p className="empty-eyebrow">Product not found</p>
          <h1>We couldn’t find that item.</h1>
          <Link to="/" className="empty-button">
            Back to Shop
          </Link>
        </div>
      </main>
    )
  }

  const galleryImages = product.images && product.images.length
    ? product.images.map((image) => resolveImageUrl(image))
    : [resolveImageUrl(product.image)]

  const reviews = product.reviewsList || product.reviews || []
  const colors = product.colors && product.colors.length ? product.colors : ['#000000', '#d9d0c7', '#a7b89a']
  const sizes = product.sizes && product.sizes.length ? product.sizes : ['Small', 'Medium', 'Large', 'X-Large']
  const relatedProducts = allProducts.filter((item) => item.id !== product.id).slice(0, 4)

  const handleQuantityChange = (direction) => {
    setQuantity((current) => {
      if (direction === 'increase') return current + 1
      return current > 1 ? current - 1 : 1
    })
  }

  const handleAddToCart = () => {
    if (sizes.length && !selectedSize) {
      setValidationMessage('Please choose a size before adding to cart.')
      return
    }

    setValidationMessage('')

    const added = addToCart(product, {
      size: selectedSize,
      color: selectedColor,
      quantity,
    })

    if (!added) {
      setValidationMessage('Unable to add this item to the cart.')
    }
  }

  return (
    <main className="product-detail-page">
      <div className="container product-detail-shell">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <span>{product.category || 'Products'}</span>
          <span>/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        <section className="product-layout">
          <div className="product-gallery" aria-label="Product gallery">
            <div className="gallery-thumbs">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={`thumb-button ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    onError={(event) => {
                      event.currentTarget.src = 'https://placehold.co/800x1000/efefef/111?text=No+Image'
                    }}
                  />
                </button>
              ))}
            </div>

            <div className="gallery-main">
              <ProductImageZoom
                src={galleryImages[selectedImage]}
                alt={product.name}
                onError={(event) => {
                  event.currentTarget.src = 'https://placehold.co/800x1000/efefef/111?text=No+Image'
                }}
              />
            </div>
          </div>

          <div className="product-info">
            <p className="product-kicker">{product.category || 'Products'}</p>
            <h1>{product.name}</h1>

            <div className="rating-row">
              <div className="stars" aria-label={`Rated ${product.rating || 4.5} out of 5`}>
                {'★★★★★'}
              </div>
              <span>{Number(product.rating || 4.5).toFixed(1)}/5</span>
              <span className="review-link">({product.reviews || reviews.length || 0} Reviews)</span>
            </div>

            <div className="price-row">
              <span className="current-price">${product.price}</span>
              {product.oldPrice && <span className="old-price">${product.oldPrice}</span>}
              {product.discount && <span className="discount-tag">{product.discount}</span>}
            </div>

            <p className="product-description">{product.description}</p>

            <div className="option-block">
              <div className="option-label-row">
                <span>Colors</span>
                <span className="selected-meta">Selected</span>
              </div>
              <div className="color-options">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color}`}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="option-block">
              <div className="option-label-row">
                <span>Choose Size</span>
                <button type="button" className="text-button">Size Guide</button>
              </div>
              <div className="size-options">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="purchase-row">
              <div className="quantity-selector" aria-label="Quantity selector">
                <button type="button" onClick={() => handleQuantityChange('decrease')} aria-label="Decrease quantity">
                  −
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={() => handleQuantityChange('increase')} aria-label="Increase quantity">
                  +
                </button>
              </div>

              <button type="button" className="add-to-cart" onClick={handleAddToCart}>
                Add to Cart
              </button>
            </div>

            {validationMessage && (
              <p className="cart-validation-message" role="alert">
                {validationMessage}
              </p>
            )}
          </div>
        </section>

        <section className="details-tabs-section">
          <div className="tabs-header" role="tablist" aria-label="Product information tabs">
            <button
              type="button"
              className={activeTab === 'details' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('details')}
            >
              Product Details
            </button>
            <button
              type="button"
              className={activeTab === 'reviews' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('reviews')}
            >
              Rating & Reviews
            </button>
            <button
              type="button"
              className={activeTab === 'faqs' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('faqs')}
            >
              FAQs
            </button>
          </div>

          <div className="tab-panel">
            {activeTab === 'details' && (
              <div className="details-copy">
                <p>{product.details || product.description}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-panel">
                <div className="reviews-toolbar">
                  <div>
                    <p className="reviews-count">All Reviews ({reviews.length})</p>
                  </div>
                  <div className="toolbar-actions">
                    <select aria-label="Sort reviews">
                      <option>Latest</option>
                      <option>Highest Rated</option>
                      <option>Lowest Rated</option>
                    </select>
                    <button type="button" className="secondary-button">Filter</button>
                    <button type="button" className="secondary-button">Write a Review</button>
                  </div>
                </div>

                <div className="review-grid">
                  {reviews.slice(0, visibleReviews).map((review, index) => (
                    <article key={`${review.name}-${index}`} className="review-card">
                      <div className="review-header">
                        <div>
                          <h3>{review.name}</h3>
                        </div>
                        <button type="button" className="review-menu" aria-label="Review options">
                          •••
                        </button>
                      </div>

                      <div className="review-meta">
                        <div className="stars small">{'★★★★★'}</div>
                        <span>{review.rating}/5</span>
                        {review.verified && <span className="verified-badge">Verified</span>}
                        <span className="review-date">{review.date}</span>
                      </div>

                      <p>{review.comment}</p>
                    </article>
                  ))}
                </div>

                {visibleReviews < reviews.length && (
                  <div className="load-more-wrap">
                    <button type="button" className="load-more" onClick={() => setVisibleReviews((value) => value + 2)}>
                      Load More Reviews
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'faqs' && (
              <div className="faq-list">
                <div className="faq-item">
                  <h3>What is the fit like?</h3>
                  <p>This piece is designed with a comfortable modern fit. We recommend selecting your usual size for a tailored feel.</p>
                </div>
                <div className="faq-item">
                  <h3>Is this item machine washable?</h3>
                  <p>Yes, we recommend cold wash on a gentle cycle and air drying to preserve the fabric and print quality.</p>
                </div>
                <div className="faq-item">
                  <h3>Do you offer exchanges?</h3>
                  <p>Yes. We provide exchanges within 30 days for unworn items in original condition.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="related-products">
          <div className="related-header">
            <h2>You Might Also Like</h2>
          </div>

          <div className="related-grid">
            {relatedProducts.map((item) => (
              <Link to={`/product/${item.id}`} key={item.id} className="related-card" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="related-image-wrap">
                  <img
                    src={resolveImageUrl(item.image)}
                    alt={item.name}
                    onError={(event) => {
                      event.currentTarget.src = 'https://placehold.co/800x1000/efefef/111?text=No+Image'
                    }}
                  />
                </div>
                <div className="related-copy">
                  <h3>{item.name}</h3>
                  <div className="mini-rating">
                    <span>★★★★★</span>
                    <small>{item.rating}</small>
                  </div>
                  <div className="related-price-row">
                    <span className="current-price">${item.price}</span>
                    {item.oldPrice && <span className="old-price">${item.oldPrice}</span>}
                    {item.discount && <span className="discount-tag">{item.discount}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default ProductDetail
