import "./footer.css";

export default function Footer() {
    return (
        <footer className="site-footer">

            <div className="footer-container">

                <div className="footer-brand">

                    <h2>SHOP.CO</h2>

                    <p>
                        We have clothes that suits your style
                        and which you're proud to wear.
                        From women to men.
                    </p>

                    <div className="social-icons">
                        <span>●</span>
                        <span>●</span>
                        <span>●</span>
                        <span>●</span>
                    </div>

                </div>


                <div className="footer-column">

                    <h3>COMPANY</h3>

                    <a href="#">About</a>
                    <a href="#">Features</a>
                    <a href="#">Works</a>
                    <a href="#">Career</a>

                </div>


                <div className="footer-column">

                    <h3>HELP</h3>

                    <a href="#">Customer Support</a>
                    <a href="#">Delivery Details</a>
                    <a href="#">Terms & Conditions</a>
                    <a href="#">Privacy Policy</a>

                </div>


                <div className="footer-column">

                    <h3>FAQ</h3>

                    <a href="#">Account</a>
                    <a href="#">Manage Deliveries</a>
                    <a href="#">Orders</a>
                    <a href="#">Payments</a>

                </div>


                <div className="footer-column">

                    <h3>RESOURCES</h3>

                    <a href="#">Free eBooks</a>
                    <a href="#">Development Tutorial</a>
                    <a href="#">How-to - Blog</a>
                    <a href="#">YouTube Playlist</a>

                </div>

            </div>


            <div className="footer-bottom">

                <p>
                    Shop.co © 2000-2023, All Rights Reserved
                </p>

                <div className="payment-methods">
                    <span>VISA</span>
                    <span>MC</span>
                    <span>Pay</span>
                    <span>Pay</span>
                </div>

            </div>

        </footer>
    );
}