import "./brands.css";

export default function Brands({ id = "brands" }) {
  const brands = ["VERSACE", "ZARA", "GUCCI", "PRADA", "Calvin Klein"];

  return (
    <section id={id} className="brands-bar">
      {brands.map((brand, index) => (
        <span key={index} className="brand-name">
          {brand}
        </span>
      ))}
    </section>
  );
}