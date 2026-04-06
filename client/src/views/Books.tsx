import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiClient from "../api";

const api = new ApiClient();

// ── Types ─────────────────────────────────────────────────────────────────────
interface Book {
  id: number;
  title: string;
  author: string;
  cover_image: string;
  category_id: number;
  description: string;
  available_copies: number;
  category?: { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
}

const PAGE_SIZE = 8;

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
      background: "#6B3A2A", color: "#FFF8F0", padding: "12px 28px",
      borderRadius: 999, fontFamily: "'Playfair Display', serif", fontSize: 14,
      boxShadow: "0 8px 40px rgba(107,58,42,0.3)", zIndex: 9999,
      animation: "fadeUp .3s ease", whiteSpace: "nowrap",
    }}>
      {msg}
      <button onClick={onClose} style={{ marginLeft: 14, background: "none", border: "none", color: "#FFF8F0", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ width: 110, height: 160, borderRadius: 10, background: "linear-gradient(90deg,#F0E4D7 25%,#FAF2EC 50%,#F0E4D7 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div style={{ width: 88, height: 9, borderRadius: 4, background: "#F0E4D7", animation: "shimmer 1.5s infinite" }} />
      <div style={{ width: 64, height: 8, borderRadius: 4, background: "#F5EBE4", animation: "shimmer 1.5s infinite" }} />
      <div style={{ width: 72, height: 28, borderRadius: 999, background: "#F0E4D7", animation: "shimmer 1.5s infinite" }} />
    </div>
  );
}

// ── BookCard ──────────────────────────────────────────────────────────────────
function BookCard({ book, onBorrow }: { book: Book; onBorrow: (b: Book) => void }) {
  const [hovered, setHovered] = useState(false);
  const navigate    = useNavigate();
  const isAvailable = book.available_copies > 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "transform .3s ease", transform: hovered ? "translateY(-8px)" : "translateY(0)" }}
    >
      {/* Cover */}
      <div
        onClick={() => navigate(`/books/${book.id}`)}
        style={{
          width: 110, height: 160, borderRadius: 10, overflow: "hidden", cursor: "pointer",
          boxShadow: hovered ? "0 20px 48px rgba(107,58,42,0.32)" : "0 4px 16px rgba(107,58,42,0.13)",
          transition: "box-shadow .3s ease", position: "relative",
        }}
      >
        <img src={book.cover_image} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .3s ease", transform: hovered ? "scale(1.06)" : "scale(1)" }}
          onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/110x160/E8C9B5/6B3A2A?text=${encodeURIComponent(book.title.slice(0, 8))}`; }}
        />
        {/* Unavailable overlay */}
        {!isAvailable && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.48)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, fontFamily: "'Lato',sans-serif" }}>BORROWED</span>
          </div>
        )}
        {/* View hint */}
        {hovered && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(196,131,106,0.18)", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 10 }}>
            <span style={{ color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 1, fontFamily: "'Lato',sans-serif", background: "rgba(107,58,42,0.55)", padding: "3px 10px", borderRadius: 4 }}>VIEW DETAILS</span>
          </div>
        )}
      </div>

      {/* Title */}
      <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, color: "#6B3A2A", textAlign: "center", maxWidth: 110, lineHeight: 1.4, margin: 0, opacity: hovered ? 1 : 0.7, transition: "opacity .2s", fontWeight: hovered ? 700 : 400 }}>
        {book.title.length > 26 ? book.title.slice(0, 24) + "…" : book.title}
      </p>

      {/* Category pill */}
      {book.category?.name && (
        <span style={{ fontSize: 9, color: "#C4836A", background: "rgba(196,131,106,0.1)", border: "1px solid rgba(196,131,106,0.25)", borderRadius: 999, padding: "2px 9px", fontFamily: "'Lato',sans-serif", letterSpacing: 0.4 }}>
          {book.category.name}
        </span>
      )}

      {/* Copies */}
      {isAvailable && (
        <p style={{ fontSize: 9, color: "#A0766A", margin: 0, fontFamily: "'Lato',sans-serif" }}>
          {book.available_copies} cop{book.available_copies === 1 ? "y" : "ies"} left
        </p>
      )}

      {/* Borrow btn */}
      <button
        onClick={() => isAvailable && onBorrow(book)}
        disabled={!isAvailable}
        style={{
          background: isAvailable ? "linear-gradient(135deg,#C4836A,#A5624C)" : "#D9BFB5",
          color: "#FFF8F0", border: "none", borderRadius: 999,
          padding: "6px 18px", fontFamily: "'Lato',sans-serif",
          fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
          cursor: isAvailable ? "pointer" : "not-allowed",
          transition: "opacity .2s, transform .15s",
          transform: hovered && isAvailable ? "scale(1.07)" : "scale(1)",
          opacity: isAvailable ? 1 : 0.6,
          boxShadow: isAvailable ? "0 4px 14px rgba(165,98,76,0.3)" : "none",
        }}
      >
        {isAvailable ? "Borrow" : "Unavailable"}
      </button>
    </div>
  );
}

// ── Pill button helper ────────────────────────────────────────────────────────
function Pill({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "9px 18px", borderRadius: 999, cursor: "pointer",
      border: `1.5px solid ${active ? "#C4836A" : "#E5C9BB"}`,
      background: active ? "linear-gradient(135deg,#C4836A,#A5624C)" : "rgba(255,250,247,0.8)",
      color: active ? "#FFF8F0" : "#6B3A2A",
      fontFamily: "'Lato',sans-serif", fontSize: 12, fontWeight: active ? 700 : 400,
      transition: "all .2s",
      boxShadow: active ? "0 4px 14px rgba(165,98,76,0.25)" : "none",
    }}>
      {children}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Books() {
  const [books, setBooks]           = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [query, setQuery]           = useState("");
  const [page, setPage]             = useState(1);
  const [toast, setToast]           = useState<string | null>(null);
  const [filterCat, setFilterCat]   = useState<number | "">("");
  const [filterAvail, setFilterAvail] = useState(false);
  const [sortBy, setSortBy]         = useState<"default" | "az" | "za">("default");

  // Fetch books — optionally filtered by category_id on the server
  const fetchBooks = (categoryId?: number) => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (categoryId) params.category_id = categoryId;
    api.getBooks(params)
      .then((data) => { if (data) setBooks(data.books || []); })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Pre-select category if coming from Categories page via ?category=name
    const urlParams = new URLSearchParams(window.location.search);
    const catName   = urlParams.get("category");

    api.getCategories().then((data) => {
      // getCategories returns { categories: [...] }
      const cats = data?.categories || [];
      setCategories(cats);
      if (catName) {
        const match = cats.find((c: Category) => c.name.toLowerCase() === catName.toLowerCase());
        if (match) { setFilterCat(match.id); fetchBooks(match.id); return; }
      }
      fetchBooks();
    });
  }, []);

  // Re-fetch when category filter changes
  useEffect(() => {
    fetchBooks(filterCat !== "" ? filterCat as number : undefined);
    setPage(1);
  }, [filterCat]);

  // ── Client-side filter + sort ──────────────────────────────────────────────
  let filtered = books.filter((b) => {
    const search = query.toLowerCase();
    const inSearch =
      b.title.toLowerCase().includes(search) ||
      b.author.toLowerCase().includes(search) ||
      (b.category?.name ?? "").toLowerCase().includes(search);
    const inAvail = filterAvail ? b.available_copies > 0 : true;
    return inSearch && inAvail;
  });
  if (sortBy === "az") filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  if (sortBy === "za") filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title));

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible    = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleBorrow = async (book: Book) => {
    const result = await api.borrowBook(book.id);
    if (result) {
      setToast(`"${book.title}" added to your library! 📚`);
      setTimeout(() => setToast(null), 3500);
      fetchBooks(filterCat !== "" ? filterCat as number : undefined);
    }
  };

  const clearFilters = () => { setFilterCat(""); setFilterAvail(false); setSortBy("default"); setQuery(""); setPage(1); };
  const hasFilters   = filterCat !== "" || filterAvail || sortBy !== "default" || query;

  // ── Pagination page numbers with ellipsis ─────────────────────────────────
  const pageNumbers = (): (number | "…")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lato:wght@300;400;700&display=swap');
        @keyframes fadeUp    { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes fadeIn    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes floatOrb  { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-18px) scale(1.04)} }
        .book-card-appear    { animation: fadeIn .45s ease both; }
        .search-input:focus  { outline:none; border-color:#C4836A !important; box-shadow:0 0 0 4px rgba(196,131,106,0.12); }
        .filter-select:focus { outline:none; border-color:#C4836A !important; }
        .page-num:hover      { background:rgba(196,131,106,0.12) !important; color:#C4836A !important; }
      `}</style>

      {/* Background orbs for soft glam effect */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", left: "5%",  width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(196,131,106,0.09) 0%,transparent 70%)", animation: "floatOrb 9s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "50%", right: "4%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(230,190,160,0.08) 0%,transparent 70%)", animation: "floatOrb 12s ease-in-out infinite 2s" }} />
        <div style={{ position: "absolute", bottom: "12%", left: "30%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(196,131,106,0.07) 0%,transparent 70%)", animation: "floatOrb 10s ease-in-out infinite 4s" }} />
      </div>

      <div style={{
        position: "relative", zIndex: 1,
        minHeight: "100vh",
        background: "linear-gradient(160deg,#FDF5EE 0%,#F9EEE4 40%,#F4E6D8 100%)",
        fontFamily: "'Lato',sans-serif",
        padding: "52px 24px 100px",
      }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, letterSpacing: 4, color: "#C4836A", textTransform: "uppercase", marginBottom: 10, opacity: 0.8 }}>
            Our Collection
          </p>
          {/* Cursive italic headline */}
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 44, fontWeight: 600, fontStyle: "italic", color: "#3D1F15", margin: 0, lineHeight: 1.2 }}>
            Discover Your Next Read
          </h1>
          <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", color: "#A07060", fontSize: 16, marginTop: 10, fontWeight: 400 }}>
            Browse, borrow, and bloom — one page at a time.
          </p>
          {/* Decorative line */}
          <div style={{ margin: "18px auto 0", width: 60, height: 2, background: "linear-gradient(90deg,transparent,#C4836A,transparent)", borderRadius: 2 }} />
        </div>

        {/* ── Search ── */}
        <div style={{ maxWidth: 520, margin: "0 auto 24px", position: "relative" }}>
          <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#C4836A", opacity: 0.7 }}>🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search by title, author, or category…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "13px 44px",
              border: "1.5px solid #E5C9BB", borderRadius: 999,
              background: "rgba(255,250,247,0.85)",
              backdropFilter: "blur(8px)",
              fontFamily: "'Lato',sans-serif", fontSize: 13, color: "#3D1F15",
              transition: "border-color .2s, box-shadow .2s",
              boxShadow: "0 2px 12px rgba(196,131,106,0.08)",
            }}
          />
          {query && (
            <button onClick={() => { setQuery(""); setPage(1); }} style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#C4836A", fontSize: 18, lineHeight: 1 }}>×</button>
          )}
        </div>

        {/* ── Category pills ── */}
        <div style={{ maxWidth: 860, margin: "0 auto 16px", display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          <Pill active={filterCat === ""} onClick={() => { setFilterCat(""); setPage(1); }}>All</Pill>
          {categories.map((c) => (
            <Pill key={c.id} active={filterCat === c.id} onClick={() => { setFilterCat(c.id); setPage(1); }}>
              {c.name}
            </Pill>
          ))}
        </div>

        {/* ── Sort + Availability row ── */}
        <div style={{ maxWidth: 860, margin: "0 auto 36px", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "center" }}>

          {/* Sort select */}
          <div style={{ position: "relative" }}>
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value as any); setPage(1); }}
              style={{
                padding: "9px 34px 9px 16px", borderRadius: 999,
                border: "1.5px solid #E5C9BB", background: "rgba(255,250,247,0.85)",
                fontFamily: "'Lato',sans-serif", fontSize: 12, color: "#6B3A2A",
                cursor: "pointer", appearance: "none",
                boxShadow: "0 2px 10px rgba(196,131,106,0.07)",
              }}
            >
              <option value="default">Sort: Default</option>
              <option value="az">Title A → Z</option>
              <option value="za">Title Z → A</option>
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#C4836A", fontSize: 11 }}>▾</span>
          </div>

          {/* Available only toggle */}
          <Pill active={filterAvail} onClick={() => { setFilterAvail((v) => !v); setPage(1); }}>
            {filterAvail ? "✓ Available Only" : "Available Only"}
          </Pill>

          {/* Clear all */}
          {hasFilters && (
            <button onClick={clearFilters} style={{
              padding: "9px 16px", borderRadius: 999, border: "1.5px solid #E5C9BB",
              background: "transparent", color: "#A07060",
              fontFamily: "'Lato',sans-serif", fontSize: 11, cursor: "pointer",
            }}>
              Clear all ×
            </button>
          )}
        </div>

        {/* Results count */}
        <p style={{ textAlign: "center", color: "#A07060", fontSize: 12, marginBottom: 28, marginTop: -20, fontStyle: "italic" }}>
          {loading ? "Finding books…" : `${filtered.length} book${filtered.length !== 1 ? "s" : ""} found${query ? ` for "${query}"` : ""}`}
        </p>

        {/* ── Loading skeletons ── */}
        {loading && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "center", maxWidth: 1000, margin: "0 auto" }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && visible.length === 0 && (
          <div style={{ textAlign: "center", padding: "70px 0" }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>📖</p>
            <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 22, color: "#3D1F15", marginBottom: 6 }}>No books found</p>
            <p style={{ fontSize: 13, color: "#A07060", marginBottom: 24 }}>Try adjusting your filters or search term</p>
            <button onClick={clearFilters} style={{ padding: "11px 28px", borderRadius: 999, background: "linear-gradient(135deg,#C4836A,#A5624C)", color: "#FFF8F0", border: "none", cursor: "pointer", fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 13, boxShadow: "0 4px 16px rgba(165,98,76,0.3)" }}>
              Clear filters
            </button>
          </div>
        )}

        {/* ── Book grid ── */}
        {!loading && visible.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center", maxWidth: 1020, margin: "0 auto" }}>
            {visible.map((book, i) => (
              <div key={book.id} className="book-card-appear" style={{ animationDelay: `${i * 0.055}s` }}>
                <BookCard book={book} onBorrow={handleBorrow} />
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination — Prev · 1 2 3 … · Next · Last ── */}
        {totalPages > 1 && !loading && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 56, flexWrap: "wrap" }}>

            {/* Prev */}
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              style={{
                padding: "8px 16px", borderRadius: 999, border: "1.5px solid #E5C9BB",
                background: "rgba(255,250,247,0.8)", color: page === 1 ? "#D9BFB5" : "#6B3A2A",
                fontFamily: "'Lato',sans-serif", fontSize: 12, cursor: page === 1 ? "not-allowed" : "pointer",
                transition: "all .2s",
              }}
            >
              ← Prev
            </button>

            {/* Page numbers with ellipsis */}
            {pageNumbers().map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} style={{ color: "#C4836A", fontSize: 14, padding: "0 4px" }}>…</span>
              ) : (
                <button
                  key={p}
                  className="page-num"
                  onClick={() => goToPage(p as number)}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: `1.5px solid ${p === page ? "#C4836A" : "#E5C9BB"}`,
                    background: p === page ? "linear-gradient(135deg,#C4836A,#A5624C)" : "rgba(255,250,247,0.8)",
                    color: p === page ? "#FFF8F0" : "#6B3A2A",
                    fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 12,
                    cursor: "pointer", transition: "all .2s",
                    boxShadow: p === page ? "0 4px 12px rgba(165,98,76,0.3)" : "none",
                  }}
                >
                  {p}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              style={{
                padding: "8px 16px", borderRadius: 999, border: "1.5px solid #E5C9BB",
                background: "rgba(255,250,247,0.8)", color: page === totalPages ? "#D9BFB5" : "#6B3A2A",
                fontFamily: "'Lato',sans-serif", fontSize: 12, cursor: page === totalPages ? "not-allowed" : "pointer",
                transition: "all .2s",
              }}
            >
              Next →
            </button>

            {/* Last */}
            {page < totalPages - 1 && (
              <button
                onClick={() => goToPage(totalPages)}
                style={{
                  padding: "8px 16px", borderRadius: 999, border: "1.5px solid #E5C9BB",
                  background: "rgba(255,250,247,0.8)", color: "#6B3A2A",
                  fontFamily: "'Lato',sans-serif", fontSize: 12, cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                Last »
              </button>
            )}
          </div>
        )}

        {/* Page indicator */}
        {totalPages > 1 && !loading && (
          <p style={{ textAlign: "center", marginTop: 14, color: "#B08070", fontSize: 11, fontStyle: "italic" }}>
            Page {page} of {totalPages}
          </p>
        )}
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}
