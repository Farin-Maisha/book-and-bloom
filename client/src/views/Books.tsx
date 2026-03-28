import { useState, useEffect } from "react";
import ApiClient from "../api";

const api = new ApiClient();

// ── Types — matched to Laravel Book model ─────────────────────────────────────
interface Book {
  id: number;
  title: string;
  author: string;
  cover_image: string;        // backend field name
  category_id: number;
  description: string;
  available_copies: number;   // backend field name
  category?: { id: number; name: string }; // if backend eager loads it
}

const PAGE_SIZE = 8;

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

// ── BookCard ──────────────────────────────────────────────────────────────────
function BookCard({ book, onBorrow }: { book: Book; onBorrow: (b: Book) => void }) {
  const [hovered, setHovered] = useState(false);

  // ✅ available_copies > 0 means the book can be borrowed
  const isAvailable = book.available_copies > 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        transition: "transform .25s ease",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
      }}
    >
      {/* Cover — using cover_image from backend */}
      <div style={{
        width: 110, height: 160, borderRadius: 8, overflow: "hidden",
        boxShadow: hovered ? "0 16px 40px rgba(107,58,42,0.28)" : "0 4px 14px rgba(107,58,42,0.14)",
        transition: "box-shadow .25s ease",
        position: "relative",
      }}>
        <img
          src={book.cover_image}
          alt={book.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://via.placeholder.com/110x160/E8C9B5/6B3A2A?text=${encodeURIComponent(book.title.slice(0, 8))}`;
          }}
        />
        {!isAvailable && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: "'Lato', sans-serif" }}>
              BORROWED
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <p style={{
        fontFamily: "'Lato', sans-serif", fontSize: 11, color: "#8B5E52",
        textAlign: "center", maxWidth: 110, lineHeight: 1.4,
        opacity: hovered ? 1 : 0.6, transition: "opacity .2s", margin: 0,
      }}>
        {book.title.length > 28 ? book.title.slice(0, 26) + "…" : book.title}
      </p>

      {/* Copies badge */}
      {isAvailable && (
        <p style={{ fontSize: 10, color: "#A0766A", margin: 0, fontFamily: "'Lato', sans-serif" }}>
          {book.available_copies} cop{book.available_copies === 1 ? "y" : "ies"} left
        </p>
      )}

      {/* Borrow button */}
      <button
        onClick={() => isAvailable && onBorrow(book)}
        disabled={!isAvailable}
        style={{
          background: isAvailable ? "#C4836A" : "#D9BFB5",
          color: "#FFF8F0", border: "none", borderRadius: 999,
          padding: "6px 20px", fontFamily: "'Lato', sans-serif",
          fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
          cursor: isAvailable ? "pointer" : "not-allowed",
          transition: "background .2s, transform .15s",
          transform: hovered && isAvailable ? "scale(1.05)" : "scale(1)",
        }}
      >
        {isAvailable ? "Borrow" : "Unavailable"}
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Books() {
  const [books, setBooks]     = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState("");
  const [page, setPage]       = useState(1);
  const [toast, setToast]     = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get('category');
    
    api.getBooks()
      .then((data) => {
        if (data) {
          let allBooks = data.books || [];
          if (categoryName) {
            allBooks = allBooks.filter((b: any) => 
              b.category?.name?.toLowerCase() === categoryName.toLowerCase()
            );
          }
          setBooks(allBooks);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Search across title, author, and category name (if loaded)
  const filtered = books.filter((b) => {
    const categoryName = b.category?.name ?? "";
    const search = query.toLowerCase();
    return (
      b.title.toLowerCase().includes(search) ||
      b.author.toLowerCase().includes(search) ||
      categoryName.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible    = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleBorrow = async (book: Book) => {
    const result = await api.borrowBook(book.id);
    if (result) {
      setToast(`"${book.title}" has been added to your library! 📚`);
      setTimeout(() => setToast(null), 3500);
      // Refresh to get updated available_copies
     api.getBooks().then((data) => { if (data) setBooks(data.books || []); });
    }
  };

  const handleSearch = (val: string) => {
    setQuery(val);
    setPage(1);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .book-card-appear { animation: fadeIn .4s ease both; }
        .search-input:focus { outline: none; border-color: #C4836A !important; box-shadow: 0 0 0 3px rgba(196,131,106,0.15); }
        .page-btn:hover:not(:disabled) { background: #C4836A !important; color: #FFF8F0 !important; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #FDF5EE 0%, #F7EDE3 60%, #F0E4D7 100%)",
        fontFamily: "'Lato', sans-serif",
        padding: "48px 24px 80px",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: 12, letterSpacing: 3, color: "#C4836A", textTransform: "uppercase", marginBottom: 8 }}>
            Our Collection
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: "#3D1F15", margin: 0 }}>
            Discover Your Next Read
          </h1>
          <p style={{ color: "#8B5E52", fontSize: 15, marginTop: 10, fontWeight: 300 }}>
            Browse, borrow, and bloom — one page at a time.
          </p>
        </div>

        {/* Search */}
        <div style={{ maxWidth: 500, margin: "0 auto 44px", position: "relative" }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#C4836A" }}>🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search by title, author, or category…"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "13px 18px 13px 44px",
              border: "1.5px solid #E5C9BB", borderRadius: 999,
              background: "#FFFAF7", fontFamily: "'Lato', sans-serif",
              fontSize: 14, color: "#3D1F15",
              transition: "border-color .2s, box-shadow .2s",
            }}
          />
          {query && (
            <button
              onClick={() => handleSearch("")}
              style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#C4836A", fontSize: 18 }}
            >×</button>
          )}
        </div>

        {/* Results count */}
        {query && (
          <p style={{ textAlign: "center", color: "#8B5E52", fontSize: 13, marginBottom: 28, marginTop: -20 }}>
            {filtered.length} book{filtered.length !== 1 ? "s" : ""} found for <strong>"{query}"</strong>
          </p>
        )}

        {/* Loading */}
        {loading && (
          <p style={{ textAlign: "center", color: "#C4836A", fontFamily: "'Playfair Display', serif", fontSize: 18, marginTop: 60 }}>
            Loading books…
          </p>
        )}

        {/* Grid */}
        {!loading && visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#C4836A" }}>
            <p style={{ fontSize: 40 }}>📖</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>No books found</p>
            <p style={{ fontSize: 13, color: "#8B5E52" }}>Try a different search term</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "center", maxWidth: 1000, margin: "0 auto" }}>
            {visible.map((book, i) => (
              <div key={book.id} className="book-card-appear" style={{ animationDelay: `${i * 0.06}s` }}>
                <BookCard book={book} onBorrow={handleBorrow} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 48 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className="page-btn"
                onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: "1.5px solid #C4836A",
                  background: p === page ? "#C4836A" : "transparent",
                  color: p === page ? "#FFF8F0" : "#C4836A",
                  fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13,
                  cursor: "pointer", transition: "background .2s, color .2s",
                }}
              >{p}</button>
            ))}
          </div>
        )}
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}
