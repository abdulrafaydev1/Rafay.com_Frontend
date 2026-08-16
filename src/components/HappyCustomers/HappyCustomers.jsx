import { useState } from "react";
import "./happy-customers.css";

const reviews = [
    {
        id: 1,
        name: "Sarah M.",
        text: `"I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations."`,
    },
    {
        id: 2,
        name: "Alex K.",
        text: `"Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions."`,
    },
    {
        id: 3,
        name: "James L.",
        text: `"As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends."`,
    },
    {
        id: 4,
        name: "Michael R.",
        text: `"Shop.co has completely changed the way I shop for clothes. The quality is excellent and everything arrived exactly as expected."`,
    },
    {
        id: 5,
        name: "Olivia P.",
        text: `"I absolutely love shopping at Shop.co. Their designs are modern, comfortable and the quality is amazing."`,
    },
    {
        id: 6,
        name: "Emma W.",
        text: `"The shopping experience is simple and the clothes look even better in person. Definitely one of my favorite stores."`,
    },
];

export default function HappyCustomers() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) =>
            prev === reviews.length - 1 ? 0 : prev + 1
        );
    };

    const previousSlide = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? reviews.length - 1 : prev - 1
        );
    };

    // Mouse drag
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.clientX);
    };

    const handleMouseUp = (e) => {
        if (!isDragging) return;

        const difference = e.clientX - startX;

        if (Math.abs(difference) > 60) {
            if (difference < 0) {
                nextSlide();
            } else {
                previousSlide();
            }
        }

        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    // Touch support
    const handleTouchStart = (e) => {
        setStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e) => {
        const endX = e.changedTouches[0].clientX;
        const difference = endX - startX;

        if (Math.abs(difference) > 50) {
            if (difference < 0) {
                nextSlide();
            } else {
                previousSlide();
            }
        }
    };

    return (
        <section className="happy-customers">

            <div className="happy-customers-header">

                <h2>
                    OUR HAPPY CUSTOMERS
                </h2>

                <div className="slider-buttons">

                    <button
                        className="slider-btn"
                        onClick={previousSlide}
                        aria-label="Previous reviews"
                    >
                        ←
                    </button>

                    <button
                        className="slider-btn"
                        onClick={nextSlide}
                        aria-label="Next reviews"
                    >
                        →
                    </button>

                </div>

            </div>


            <div
                className="reviews-slider"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >

                <div
                    className="reviews-track"
                    style={{
                        transform: `translateX(-${currentIndex * 25}%)`,
                    }}
                >

                    {[...reviews, ...reviews].map((review, index) => (
                        <div
                            className="review-card"
                            key={`${review.id}-${index}`}
                        >

                            <div className="review-stars">
                                ★★★★★
                            </div>

                            <div className="review-name">
                                {review.name}

                                <span className="verified">
                                    ✓
                                </span>
                            </div>

                            <p className="review-text">
                                {review.text}
                            </p>

                        </div>
                    ))}

                </div>

            </div>

        </section>
    );
}