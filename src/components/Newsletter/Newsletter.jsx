import { useState } from "react";
import "./newsletter.css";

export default function Newsletter() {
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email.trim()) return;

        alert("Thanks for subscribing!");

        setEmail("");
    };

    return (
        <section className="newsletter">

            <div className="newsletter-container">

                <div className="newsletter-content">
                    <h2>
                        STAY UP TO DATE ABOUT
                        <br />
                        OUR LATEST OFFERS
                    </h2>
                </div>

                <form
                    className="newsletter-form"
                    onSubmit={handleSubmit}
                >

                    <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button type="submit">
                        Subscribe to Newsletter
                    </button>

                </form>

            </div>

        </section>
    );
}