import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiClient from "../api";

const api = new ApiClient();

// ── Types ─────────────────────────────────────────────────────────────────────
interface Book {
  id: number;
  title: string;
  author: string;
  cover_image: string;
  description: string;
  available_copies: number;
  category?: { id: number; name: string };
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
      background: "#6B3A2A", color: "#FFF8F0", padding: "12px 24px",
      borderRadius: 999, fontFamily: "'Playfair Display', serif", fontSize: 14,
      boxShadow: "0 8px 30px rgba(107,58,42,0.25)", zIndex: 9999,
      animation: "fadeUp .3s ease",
    }}>
      {msg}
      <button onClick={onClose} style={{ marginLeft: 12, background: "none", border: "none", color: "#FFF8F0", cursor: "pointer", fontSize: 16 }}>×</button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BookDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [book, setBook]       = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast]     = useState<string | null>(null);
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    api.getBook(Number(id))
      .then((data) => {
        if (data?.success) setBook(data.book);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBorrow = async () => {
    if (!book) return;
    setBorrowing(true);
    const result = await api.borrowBook(book.id);
    if (result) {
      setToast(`"${book.title}" added to your library! 📚`);
      setTimeout(() => setToast(null), 3500);
      // Refresh book to update available_copies
      api.getBook(book.id).then((data) => { if (data?.success) setBook(data.book); });
    }
    setBorrowing(false);
  };

  const isAvailable = (book?.available_copies ?? 0) > 0;

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #FDF5EE 0%, #F7EDE3 60%, #F0E4D7 100%)", padding: "60px 24px" }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 48, flexWrap: "wrap" }}>
        <div style={{ width: 200, height: 300, borderRadius: 12, background: "linear-gradient(90deg,#F0E4D7 25%,#F7EDE3 50%,#F0E4D7 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {[200, 120, 80, 300].map((w, i) => (
            <div key={i} style={{ width: w, height: 18, borderRadius: 4, background: "linear-gradient(90deg,#F0E4D7 25%,#F7EDE3 50%,#F0E4D7 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
          ))}
        </div>
      </div>
    </div>
  );

  // ── Not found ──────────────────────────────────────────────────────────────
  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #FDF5EE 0%, #F7EDE3 60%, #F0E4D7 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 48 }}>📚</p>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#3D1F15" }}>Book not found</h2>
      <button onClick={() => navigate("/books")} style={{ padding: "10px 24px", borderRadius: 999, background: "#C4836A", color: "#FFF8F0", border: "none", cursor: "pointer", fontFamily: "'Lato', sans-serif", fontWeight: 700 }}>
        Back to Books
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .detail-appear { animation: fadeInUp .5s ease both; }
        .borrow-btn:hover:not(:disabled) { background: #A5624C !important; }
        .back-btn:hover { color: #C4836A !important; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #FDF5EE 0%, #F7EDE3 60%, #F0E4D7 100%)",
        fontFamily: "'Lato', sans-serif",
        padding: "48px 24px 80px",
      }}>

        {/* Back button */}
        <button
          className="back-btn"
          onClick={() => navigate("/books")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#8B5E52", fontFamily: "'Lato', sans-serif",
            fontSize: 14, marginBottom: 32, display: "flex", alignItems: "center", gap: 6,
            transition: "color .2s",
          }}
        >
          ← Back to Books
        </button>

        {/* Detail card */}
        <div
          className="detail-appear"
          style={{
            maxWidth: 820, margin: "0 auto",
            background: "#FFFAF7",
            borderRadius: 20, border: "1px solid #F0DDD4",
            boxShadow: "0 8px 40px rgba(107,58,42,0.1)",
            padding: "40px",
            display: "flex", gap: 48, flexWrap: "wrap",
          }}
        >
          {/* Cover */}
          <div style={{ flexShrink: 0 }}>
            <img
              src={book!.cover_image}
              alt={book!.title}
              style={{
                width: 180, height: 270, objectFit: "cover",
                borderRadius: 12,
                boxShadow: "0 12px 40px rgba(107,58,42,0.25)",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://via.placeholder.com/180x270/E8C9B5/6B3A2A?text=${encodeURIComponent(book!.title.slice(0, 8))}`;
              }}
            />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Category badge */}
            {book!.category?.name && (
              <span style={{
                alignSelf: "flex-start",
                fontSize: 11, color: "#C4836A", background: "#FFF0E8",
                border: "1px solid #F0DDD4", borderRadius: 999,
                padding: "4px 12px", fontFamily: "'Lato', sans-serif", letterSpacing: 0.5,
              }}>
                {book!.category.name}
              </span>
            )}

            {/* Title */}
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: "#3D1F15", margin: 0, lineHeight: 1.3 }}>
              {book!.title}
            </h1>

            {/* Author */}
            <p style={{ color: "#8B5E52", fontSize: 15, margin: 0 }}>
              by <strong>{book!.author}</strong>
            </p>

            {/* Divider */}
            <div style={{ height: 1, background: "#F0DDD4" }} />

            {/* Description */}
            <p style={{ color: "#6B3A2A", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
              {book!.description || "No description available for this book."}
            </p>

            {/* Divider */}
            <div style={{ height: 1, background: "#F0DDD4" }} />

            {/* Availability info */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                background: isAvailable ? "#E8F5E8" : "#F5E8E8",
                color: isAvailable ? "#2D7A2D" : "#A32D2D",
                border: `1px solid ${isAvailable ? "#C8E6C8" : "#F0C8C8"}`,
              }}>
                {isAvailable ? `✓ Available` : "✗ Unavailable"}
              </span>
              {isAvailable && (
                <span style={{ color: "#8B5E52", fontSize: 13 }}>
                  {book!.available_copies} cop{book!.available_copies === 1 ? "y" : "ies"} left
                </span>
              )}
            </div>

            {/* Borrow button */}
            <button
              className="borrow-btn"
              onClick={handleBorrow}
              disabled={!isAvailable || borrowing}
              style={{
                alignSelf: "flex-start",
                padding: "12px 32px", borderRadius: 999, border: "none",
                background: isAvailable ? "#C4836A" : "#D9BFB5",
                color: "#FFF8F0",
                fontFamily: "'Lato', sans-serif", fontSize: 14, fontWeight: 700,
                cursor: isAvailable && !borrowing ? "pointer" : "not-allowed",
                transition: "background .2s",
                letterSpacing: 0.5,
              }}
            >
              {borrowing ? "Borrowing…" : isAvailable ? "Borrow this Book" : "Currently Unavailable"}
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}
