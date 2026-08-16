import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./topselling.css";

const resolveImageUrl = (image) => {
    if (!image) return "https://placehold.co/800x1000/efefef/111?text=No+Image";
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    if (image.startsWith("/")) return `http://localhost:5000${image}`;
    return `http://localhost:5000/images/${image}`;
};

function StarRating({ rating }) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
        <div className="rating">
            {Array.from({ length: 5 }).map((_, i) => {
                let type = "empty";

                if (i < fullStars) {
                    type = "full";
                } else if (i === fullStars && hasHalfStar) {
                    type = "half";
                }

                return (
                    <svg
                        key={i}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        className={`star-icon ${type}`}
                    >
                        <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.2l7.1-.6z" />
                    </svg>
                );
            })}

            <span className="rating-value">
                {rating}/5
            </span>
        </div>
    );
}

export default function TopSelling({ id = "sale" }) {
    const [products, setProducts] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        axios
            .get("/api/products/top-selling")
            .then((response) => {
                setProducts(response.data || []);
            })
            .catch((err) => {
                console.error("Failed to fetch top selling products", err);
                setError("Failed to fetch top selling products");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const productList = products.slice(0, 4);
    const visibleProducts = showAll ? products : productList;

    const handleToggle = () => {
        setShowAll((prev) => !prev);
    };

    if (loading) {
        return <p>Loading products...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <section id={id} className="top-selling">
            <h2 className="section-title">TOP SELLING</h2>

            <div className="product-grid">
                {visibleProducts.map((product) => (
                    <Link
                        to={`/product/${product.id}`}
                        className="product-card"
                        key={product.id}
                        aria-label={`View details for ${product.name}`}
                    >
                        <div className="product-image-wrapper">
                            <img
                                src={resolveImageUrl(product.image)}
                                alt={product.name}
                                className="product-image"
                                onError={(event) => {
                                    event.currentTarget.src = "https://placehold.co/800x1000/efefef/111?text=No+Image";
                                }}
                            />
                        </div>

                        <h3 className="product-name">{product.name}</h3>

                        <StarRating rating={product.rating} />

                        <div className="price-row">
                            <span className="price">${product.price}</span>

                            {product.oldPrice && (
                                <span className="old-price">${product.oldPrice}</span>
                            )}

                            {product.discount && (
                                <span className="discount-badge">{product.discount}</span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {products.length > 4 && (
                <button className="view-all-btn" onClick={handleToggle}>
                    {showAll ? "View Less" : "View All"}
                </button>
            )}
        </section>
    );
}