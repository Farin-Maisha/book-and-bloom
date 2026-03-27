import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  genre: string;
  available: boolean;
}

// ── Mock data ────────────────────────────────────────────────────────────────
const ALL_BOOKS: Book[] = [
  // Page 1
  { id: 1,  title: "Harry Potter & the Sorcerer's Stone",   author: "J.K. Rowling",          cover: "https://covers.openlibrary.org/b/id/10110415-M.jpg", genre: "Fantasy",            available: true  },
  { id: 2,  title: "Harry Potter & the Chamber of Secrets", author: "J.K. Rowling",          cover: "https://covers.openlibrary.org/b/id/8234464-M.jpg",  genre: "Fantasy",            available: true  },
  { id: 3,  title: "Harry Potter & the Prisoner of Azkaban",author: "J.K. Rowling",          cover: "https://covers.openlibrary.org/b/id/8910737-M.jpg",  genre: "Fantasy",            available: false },
  { id: 4,  title: "Harry Potter & the Goblet of Fire",     author: "J.K. Rowling",          cover: "https://covers.openlibrary.org/b/id/7984916-M.jpg",  genre: "Fantasy",            available: true  },
  { id: 5,  title: "Atomic Habits",                         author: "James Clear",            cover: "https://covers.openlibrary.org/b/id/10521300-M.jpg", genre: "Self-Help",          available: true  },
  { id: 6,  title: "The Midnight Library",                  author: "Matt Haig",              cover: "https://covers.openlibrary.org/b/id/10527843-M.jpg", genre: "Fiction",            available: true  },
  { id: 7,  title: "Kaikeyi",                               author: "Vaishnavi Patel",        cover: "https://covers.openlibrary.org/b/id/12648516-M.jpg", genre: "Fantasy",            available: false },
  { id: 8,  title: "Brothers",                              author: "Yu Hua",                 cover: "https://covers.openlibrary.org/b/id/8231432-M.jpg",  genre: "Fiction",            available: true  },
  // Page 2
  { id: 9,  title: "Little Women",                          author: "Louisa May Alcott",      cover: "https://covers.openlibrary.org/b/id/8739161-M.jpg",  genre: "Classic",            available: true  },
  { id: 10, title: "The Alchemist",                         author: "Paulo Coelho",           cover: "https://covers.openlibrary.org/b/id/8299276-M.jpg",  genre: "Fiction",            available: true  },
  { id: 11, title: "Dune",                                  author: "Frank Herbert",          cover: "https://covers.openlibrary.org/b/id/10921904-M.jpg", genre: "Science Fiction",    available: false },
  { id: 12, title: "Pride and Prejudice",                   author: "Jane Austen",            cover: "https://covers.openlibrary.org/b/id/9309929-M.jpg",  genre: "Romance",            available: true  },
  { id: 13, title: "1984",                                  author: "George Orwell",          cover: "https://covers.openlibrary.org/b/id/11083374-M.jpg", genre: "Science Fiction",    available: true  },
  { id: 14, title: "To Kill a Mockingbird",                 author: "Harper Lee",             cover: "https://covers.openlibrary.org/b/id/8228691-M.jpg",  genre: "Classic",            available: true  },
  { id: 15, title: "The Great Gatsby",                      author: "F. Scott Fitzgerald",   cover: "https://covers.openlibrary.org/b/id/9067183-M.jpg",  genre: "Classic",            available: false },
  { id: 16, title: "Gone Girl",                             author: "Gillian Flynn",          cover: "https://covers.openlibrary.org/b/id/8392949-M.jpg",  genre: "Mystery & Thriller", available: true  },
  // Page 3
  { id: 17, title: "The Da Vinci Code",                     author: "Dan Brown",              cover: "https://covers.openlibrary.org/b/id/8739180-M.jpg",  genre: "Mystery & Thriller", available: true  },
  { id: 18, title: "Educated",                              author: "Tara Westover",          cover: "https://covers.openlibrary.org/b/id/8743275-M.jpg",  genre: "Non-Fiction",        available: true  },
  { id: 19, title: "The Hunger Games",                      author: "Suzanne Collins",        cover: "https://covers.openlibrary.org/b/id/8228778-M.jpg",  genre: "Science Fiction",    available: false },
  { id: 20, title: "Brave New World",                       author: "Aldous Huxley",          cover: "https://covers.openlibrary.org/b/id/8406786-M.jpg",  genre: "Science Fiction",    available: true  },
  { id: 21, title: "Sense and Sensibility",                 author: "Jane Austen",            cover: "https://covers.openlibrary.org/b/id/8739177-M.jpg",  genre: "Romance",            available: true  },
  { id: 22, title: "The Hobbit",                            author: "J.R.R. Tolkien",        cover: "https://covers.openlibrary.org/b/id/8406789-M.jpg",  genre: "Fantasy",            available: true  },
  { id: 23, title: "Becoming",                              author: "Michelle Obama",         cover: "https://covers.openlibrary.org/b/id/8740698-M.jpg",  genre: "Non-Fiction",        available: false },
  { id: 24, title: "The Girl with the Dragon Tattoo",       author: "Stieg Larsson",          cover: "https://covers.openlibrary.org/b/id/8392960-M.jpg",  genre: "Mystery & Thriller", available: true  },
  // Page 4
  { id: 25, title: "Sapiens",                               author: "Yuval Noah Harari",      cover: "https://covers.openlibrary.org/b/id/8739192-M.jpg",  genre: "Non-Fiction",        available: true  },
  { id: 26, title: "The Name of the Wind",                  author: "Patrick Rothfuss",       cover: "https://covers.openlibrary.org/b/id/8406798-M.jpg",  genre: "Fantasy",            available: true  },
  { id: 27, title: "Wuthering Heights",                     author: "Emily Brontë",           cover: "https://covers.openlibrary.org/b/id/9309932-M.jpg",  genre: "Romance",            available: false },
  { id: 28, title: "The Martian",                           author: "Andy Weir",              cover: "https://covers.openlibrary.org/b/id/8740680-M.jpg",  genre: "Science Fiction",    available: true  },
  { id: 29, title: "In the Woods",                          author: "Tana French",            cover: "https://covers.openlibrary.org/b/id/8228680-M.jpg",  genre: "Mystery & Thriller", available: true  },
  { id: 30, title: "The Power of Now",                      author: "Eckhart Tolle",          cover: "https://covers.openlibrary.org/b/id/8739198-M.jpg",  genre: "Self-Help",          available: true  },
  { id: 31, title: "A Court of Thorns and Roses",           author: "Sarah J. Maas",          cover: "https://covers.openlibrary.org/b/id/12310893-M.jpg", genre: "Fantasy",            available: false },
  { id: 32, title: "Frankenstein",                          author: "Mary Shelley",           cover: "https://covers.openlibrary.org/b/id/8739201-M.jpg",  genre: "Classic",            available: true  },
  // Page 5
  { id: 33, title: "The Book Thief",                        author: "Markus Zusak",           cover: "https://covers.openlibrary.org/b/id/8406801-M.jpg",  genre: "Fiction",            available: true  },
  { id: 34, title: "Circe",                                 author: "Madeline Miller",        cover: "https://covers.openlibrary.org/b/id/8740690-M.jpg",  genre: "Fantasy",            available: true  },
  { id: 35, title: "The Silent Patient",                    author: "Alex Michaelides",       cover: "https://covers.openlibrary.org/b/id/8740694-M.jpg",  genre: "Mystery & Thriller", available: false },
  { id: 36, title: "Normal People",                         author: "Sally Rooney",           cover: "https://covers.openlibrary.org/b/id/10527850-M.jpg", genre: "Romance",            available: true  },
  { id: 37, title: "The Hitchhiker's Guide to the Galaxy",  author: "Douglas Adams",          cover: "https://covers.openlibrary.org/b/id/8406810-M.jpg",  genre: "Science Fiction",    available: true  },
  { id: 38, title: "The Road",                              author: "Cormac McCarthy",        cover: "https://covers.openlibrary.org/b/id/8228690-M.jpg",  genre: "Fiction",            available: true  },
  { id: 39, title: "Big Magic",                             author: "Elizabeth Gilbert",      cover: "https://covers.openlibrary.org/b/id/8740704-M.jpg",  genre: "Self-Help",          available: false },
  { id: 40, title: "Rebecca",                               author: "Daphne du Maurier",      cover: "https://covers.openlibrary.org/b/id/9309940-M.jpg",  genre: "Mystery & Thriller", available: true  },
];

const PAGE_SIZE = 8;

// ── Toast ────────────────────────────────────────────────────────────────────
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

// ── BookCard ─────────────────────────────────────────────────────────────────
function BookCard({ book, onBorrow }: { book: Book; onBorrow: (b: Book) => void }) {
  const [hovered, setHovered] = useState(false);

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
      {/* Cover */}
      <div style={{
        width: 110, height: 160, borderRadius: 8, overflow: "hidden",
        boxShadow: hovered
          ? "0 16px 40px rgba(107,58,42,0.28)"
          : "0 4px 14px rgba(107,58,42,0.14)",
        transition: "box-shadow .25s ease",
        position: "relative",
      }}>
        <img
          src={book.cover}
          alt={book.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://via.placeholder.com/110x160/E8C9B5/6B3A2A?text=${encodeURIComponent(book.title.slice(0, 8))}`;
          }}
        />
        {!book.available && (
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

      {/* Title tooltip on hover */}
      <p style={{
        fontFamily: "'Lato', sans-serif", fontSize: 11, color: "#8B5E52",
        textAlign: "center", maxWidth: 110, lineHeight: 1.4,
        opacity: hovered ? 1 : 0.6, transition: "opacity .2s",
        margin: 0,
      }}>
        {book.title.length > 28 ? book.title.slice(0, 26) + "…" : book.title}
      </p>

      {/* Borrow button */}
      <button
        onClick={() => book.available && onBorrow(book)}
        disabled={!book.available}
        style={{
          background: book.available ? "#C4836A" : "#D9BFB5",
          color: "#FFF8F0",
          border: "none",
          borderRadius: 999,
          padding: "6px 20px",
          fontFamily: "'Lato', sans-serif",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.5,
          cursor: book.available ? "pointer" : "not-allowed",
          transition: "background .2s, transform .15s",
          transform: hovered && book.available ? "scale(1.05)" : "scale(1)",
        }}
      >
        {book.available ? "Borrow" : "Unavailable"}
      </button>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Books() {
  const [query, setQuery]       = useState("");
  const [page, setPage]         = useState(1);
  const [toast, setToast]       = useState<string | null>(null);

  const filtered = ALL_BOOKS.filter(
    (b) =>
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author.toLowerCase().includes(query.toLowerCase()) ||
      b.genre.toLowerCase().includes(query.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible    = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleBorrow = (book: Book) => {
    setToast(`"${book.title}" has been added to your library! 📚`);
    setTimeout(() => setToast(null), 3500);
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
        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, letterSpacing: 3, color: "#C4836A", textTransform: "uppercase", marginBottom: 8 }}>
            Our Collection
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: "#3D1F15", margin: 0 }}>
            Discover Your Next Read
          </h1>
          <p style={{ color: "#8B5E52", fontSize: 15, marginTop: 10, fontWeight: 300 }}>
            Browse, borrow, and bloom — one page at a time.
          </p>
        </div>

        {/* ── Search ── */}
        <div style={{ maxWidth: 500, margin: "0 auto 44px", position: "relative" }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#C4836A" }}>🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search by title, author, or genre…"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "13px 18px 13px 44px",
              border: "1.5px solid #E5C9BB",
              borderRadius: 999,
              background: "#FFFAF7",
              fontFamily: "'Lato', sans-serif",
              fontSize: 14,
              color: "#3D1F15",
              transition: "border-color .2s, box-shadow .2s",
            }}
          />
          {query && (
            <button
              onClick={() => handleSearch("")}
              style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#C4836A", fontSize: 18 }}
            >
              ×
            </button>
          )}
        </div>

        {/* ── Results count ── */}
        {query && (
          <p style={{ textAlign: "center", color: "#8B5E52", fontSize: 13, marginBottom: 28, marginTop: -20 }}>
            {filtered.length} book{filtered.length !== 1 ? "s" : ""} found for <strong>"{query}"</strong>
          </p>
        )}

        {/* ── Grid ── */}
        {visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#C4836A" }}>
            <p style={{ fontSize: 40 }}>📖</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>No books found</p>
            <p style={{ fontSize: 13, color: "#8B5E52" }}>Try a different search term</p>
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 28,
            justifyContent: "center",
            maxWidth: 1000,
            margin: "0 auto",
          }}>
            {visible.map((book, i) => (
              <div
                key={book.id}
                className="book-card-appear"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <BookCard book={book} onBorrow={handleBorrow} />
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
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
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700, fontSize: 13,
                  cursor: "pointer",
                  transition: "background .2s, color .2s",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}
