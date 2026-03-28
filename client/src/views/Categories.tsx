import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiClient from "../api";

const api = new ApiClient();

// ── Types — matched to Laravel Category model ─────────────────────────────────
interface Category {
  id: number;
  name: string;           // only field in the model
  books_count?: number;   // only if backend sends it (optional)
}

const COLORS = [
  "#E8C5B8", "#C8D8B8", "#B8C5D8", "#E8B8C5",
  "#C8B8E8", "#B8D8D8", "#D8C8A8", "#E8C8D8",
  "#B8D8C0", "#D8C0A8", "#C8C8D8", "#F0D8A8",
];

// ── CategoryCard ──────────────────────────────────────────────────────────────
function CategoryCard({
  cat,
  index,
  selected,
  onSelect,
}: {
  cat: Category;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const active = selected || hovered;
  const color  = COLORS[index % COLORS.length];

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
      style={{
        width: "100%", padding: "18px 24px", borderRadius: 14,
        border: selected ? "2px solid #C4836A" : "2px solid transparent",
        background: active ? `linear-gradient(135deg, ${color} 0%, ${color}88 100%)` : "#FFFAF7",
        boxShadow: active ? "0 8px 28px rgba(107,58,42,0.18)" : "0 2px 8px rgba(107,58,42,0.07)",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
        transition: "all .25s ease",
        transform: active ? "translateY(-3px)" : "translateY(0)",
        textAlign: "left",
      }}
    >
      <div style={{
        width: 16, height: 16,
        background: active ? "#FFF8F0" : "#F3EAE3",
        borderRadius: 4, flexShrink: 0, transition: "background .25s",
      }} />

      <div>
        {/* name — the only guaranteed field from Category model */}
        <p style={{
          fontFamily: "'Playfair Display', serif", fontSize: 15,
          fontWeight: selected ? 700 : 600,
          color: active ? "#3D1F15" : "#6B3A2A",
          margin: 0, transition: "color .2s",
        }}>
          {cat.name}
        </p>
        {/* books_count only shows if backend sends it */}
        {cat.books_count !== undefined && (
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: "#8B5E52", margin: "2px 0 0" }}>
            {cat.books_count} books
          </p>
        )}
      </div>

      <span style={{
        marginLeft: "auto", color: "#C4836A", fontSize: 18,
        opacity: active ? 1 : 0.3,
        transition: "opacity .2s, transform .2s",
        transform: active ? "translateX(4px)" : "translateX(0)",
      }}>→</span>
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getCategories()
      .then((data) => {
  if (data) setCategories(data.categories || []);
})
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (id: number, name: string) => {
    setSelected(id);
    setTimeout(() => {
      navigate(`/books?category=${encodeURIComponent(name)}`);
    }, 300);
  };

  const selectedCat = categories.find((c) => c.id === selected);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .cat-appear { animation: fadeInUp .45s ease both; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #FDF5EE 0%, #F7EDE3 60%, #F0E4D7 100%)",
        fontFamily: "'Lato', sans-serif",
        padding: "48px 24px 80px",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 12, letterSpacing: 3, color: "#C4836A", textTransform: "uppercase", marginBottom: 8 }}>
            Browse by Genre
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: "#3D1F15", margin: 0 }}>
            Explore Categories
          </h1>
          <p style={{ color: "#8B5E52", fontSize: 15, marginTop: 10, fontWeight: 300 }}>
            Find your perfect genre and dive into a world of stories.
          </p>
        </div>

        {/* Selection Banner */}
        {selectedCat && (
          <div style={{
            maxWidth: 760, margin: "0 auto 36px",
            background: "linear-gradient(135deg, #C4836A, #A5624C)",
            borderRadius: 14, padding: "14px 24px",
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 6px 24px rgba(196,131,106,0.3)",
          }}>
            <div style={{ width: 16, height: 16, background: "#FFF8F0", borderRadius: 4 }} />
            <p style={{ fontFamily: "'Lato', sans-serif", color: "#FFF8F0", fontSize: 14, margin: 0 }}>
              Loading <strong>{selectedCat.name}</strong> books…
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p style={{ textAlign: "center", color: "#C4836A", fontFamily: "'Playfair Display', serif", fontSize: 18, marginTop: 60 }}>
            Loading categories…
          </p>
        )}

        {/* Grid */}
        {!loading && (
          <div style={{
            maxWidth: 860, margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
          }}>
            {categories.map((cat, i) => (
              <div key={cat.id} className="cat-appear" style={{ animationDelay: `${i * 0.06}s` }}>
                <CategoryCard
                  cat={cat}
                  index={i}
                  selected={selected === cat.id}
                  onSelect={() => handleSelect(cat.id, cat.name)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: 52, color: "#B08070", fontSize: 13, fontWeight: 300 }}>
          Can't find what you're looking for? Try the{" "}
          <a href="/books" style={{ color: "#C4836A", textDecoration: "underline dotted" }}>
            full catalogue
          </a>.
        </p>
      </div>
    </>
  );
}
