import "./hero.css";
import heroimg from '../../assets/images/hero-img.jpg'
 
export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-heading">
          FIND CLOTHES <br />
          THAT MATCHES <br />
          YOUR STYLE
        </h1>

        <p className="hero-subtext">
          Browse through our diverse range of meticulously crafted garments,
          designed to bring out your individuality and cater to your sense of
          style.
        </p>

        <button className="hero-cta">Shop Now</button>

        <div className="hero-stats">
          <div className="stat">
            <h3>200+</h3>
            <p>International Brands</p>
          </div>
          <div className="divider"></div>
          <div className="stat">
            <h3>2,000+</h3>
            <p>High-Quality Products</p>
          </div>
          <div className="divider"></div>
          <div className="stat">
            <h3>30,000+</h3>
            <p>Happy Customers</p>
          </div>
        </div>
      </div>

      <div className="hero-image-wrapper">
        <img
          src={heroimg}
          alt="Models wearing stylish outfits"
          className="hero-image"
        />
        <svg className="star star-top" viewBox="0 0 24 24" fill="#000">
          <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
        </svg>
        <svg className="star star-bottom" viewBox="0 0 24 24" fill="#000">
          <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
        </svg>
      </div>
    </section>
  );
}