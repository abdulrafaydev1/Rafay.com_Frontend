import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "./Navbar.css";

export default function Navbar({ onOpenAuth }) {
  const [showBanner, setShowBanner] = useState(true);
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSectionNavigation = (sectionId) => {
    if (location.pathname === "/") {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    navigate(`/#${sectionId}`);
  };

  const sectionLinkProps = (sectionId) => ({
    href: `/#${sectionId}`,
    onClick: (event) => {
      event.preventDefault();
      handleSectionNavigation(sectionId);
    },
  });

  return (
    <div className="header-wrapper">
      {showBanner && (
        <div className="announcement-bar">
          <p>
            Sign up and get 20% off to your first order.{" "}
            <button type="button" className="announcement-link" onClick={onOpenAuth}>
              Sign Up Now
            </button>
          </p>

          <button
            className="close-btn"
            onClick={() => setShowBanner(false)}
            aria-label="Close announcement"
          >
            ✕
          </button>
        </div>
      )}

      <div className="navbar">
        <Link to="/" className="logo">
          Rafay.com
        </Link>

        <ul className="nav-links">
          <li className="shop-menu">
            <Link to="/shop" className="shop-title">
              Shop <span className="caret">▼</span>
            </Link>

            <div className="shop-dropdown">
              <Link to="/shop/men">Men</Link>
              <Link to="/shop/women">Women</Link>
              <Link to="/shop/kids">Kids</Link>
              <Link to="/shop/accessories">Accessories</Link>
              <Link to="/shop/shoes">Shoes</Link>
            </div>
          </li>

          <li>
            <a {...sectionLinkProps("sale")} className="nav-section-link">On Sale</a>
          </li>

          <li>
            <a {...sectionLinkProps("new-arrivals")} className="nav-section-link">New Arrivals</a>
          </li>

          <li>
            <a {...sectionLinkProps("brands")} className="nav-section-link">Brands</a>
          </li>

          <li>
            <a
              href="https://www.youtube.com/@InsideTheFactory10"
              target="_blank"
              rel="noopener noreferrer"
            >
              The Making Factory
            </a>
          </li>
        </ul>

        <div className="search-bar">
          <svg
            className="search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>

          <input type="text" placeholder="Search for products..." />
        </div>

        <div className="icons">
          <button
            type="button"
            className="store-admin-login"
            title="Double-click to open Admin Login. Keyboard: Enter or Space."
            onDoubleClick={() => navigate('/admin/login')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (!event.repeat) navigate('/admin/login');
              }
            }}
            onClick={(event) => {
              // Keyboard and assistive technology activation have no pointer click count.
              if (event.detail === 0) navigate('/admin/login');
            }}
          >
            Admin Login
          </button>
          <Link to="/cart" className="cart-link" aria-label="View cart">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000"
              strokeWidth="1.8"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          <button type="button" className="user-button" onClick={onOpenAuth} aria-label="Open authentication modal">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="8" r="4"></circle>
              <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}