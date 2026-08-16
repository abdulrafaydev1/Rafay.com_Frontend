import { useEffect, useState } from "react";
import axios from "axios";
import "./browse-dress-style.css";

export default function BrowseByDressStyle({ id = "factory" }) {
    const [styles, setStyles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        axios.get("/api/products3")
            .then((response) => {
                setStyles(response.data);
            })
            .catch((error) => {
                console.log(error);
                setError("Failed to fetch dress styles");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <p className="dress-style-loading">
                Loading dress styles...
            </p>
        );
    }

    if (error) {
        return (
            <p className="dress-style-error">
                {error}
            </p>
        );
    }

    return (
        <section id={id} className="browse-dress-style">

            <div className="dress-style-container">

                <h2 className="dress-style-title">
                    BROWSE BY DRESS STYLE
                </h2>

                <div className="dress-style-grid">

                    {styles.map((style) => (
                        <div
                            className={`dress-style-card ${style.className}`}
                            key={style.id}
                        >

                            <img
                                src={`http://localhost:5000${style.image}`}
                                alt={style.name}
                                className="dress-style-image"
                            />

                            <h3 className="dress-style-name">
                                {style.name}
                            </h3>

                        </div>
                    ))}

                </div>

            </div>

        </section>
    );
}