import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import ApiClient               from "../api";

const api      = new ApiClient();
const PER_PAGE = 5; // rows per page

// ── Types ──────────────────────────────────────────────────────────────────────
// These match what the Laravel Borrow model (with Book relation) should return.
interface BorrowedBook {
  id:          number;
  book:        { id: number; title: string; cover_image: string };
  issue_date:  string;  // "YYYY-MM-DD"
  due_date:    string;  // "YYYY-MM-DD"
  return_date: string | null; // null = still borrowed
  status:      "borrowed" | "returned" | "overdue";
}

// ── Helper: format "2026-01-05" → "5 Jan 2026" ────────────────────────────────
function formatDate(raw: string): string {
  const d = new Date(raw);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ── Helper: pick badge color based on status ──────────────────────────────────
// Matches the design: "Returned" = green, "Due/Overdue" = coral/pink
function StatusBadge({ status }: { status: BorrowedBook["status"] }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    returned: { bg: "#D4F0D8", color: "#2E7D32", label: "Returned" },
    borrowed: { bg: "#FAE0D8", color: "#B24E35", label: "Due"      },
    overdue:  { bg: "#FAD0CC", color: "#9B2418", label: "Overdue"  },
  };
  const s = styles[status] ?? styles.borrowed;

  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "4px 14px", borderRadius: 999,
      fontSize: 12, fontWeight: 700,
      fontFamily: "'Lato', sans-serif",
      letterSpacing: 0.3,
    }}>
      {s.label}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function MyLibrary() {
  const navigate = useNavigate();

  const [borrows,  setBorrows]  = useState<BorrowedBook[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [returning, setReturning] = useState<number | null>(null); // which row is loading

  // ── Guard: if not logged in, send to login ─────────────────────────────────
  // We check for the token that Login.tsx saves in localStorage.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch the user's borrow history
    api.getMyBorrows()
      .then((data) => {
        if (data) setBorrows(data.borrows || []);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // ── Pagination math ────────────────────────────────────────────────────────
  const totalPages = Math.ceil(borrows.length / PER_PAGE);
  const visible    = borrows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Return a book ──────────────────────────────────────────────────────────
  // Calls POST /api/return/{borrowId} then refreshes the list.
  const handleReturn = async (borrow: BorrowedBook) => {
    if (borrow.status === "returned") return; // already returned, nothing to do

    setReturning(borrow.id); // show loading state on just this row

    const result = await api.returnBook(borrow.id);

    if (result) {
      // Optimistic update: flip this row's status locally without a full reload
      setBorrows((prev) =>
        prev.map((b) =>
          b.id === borrow.id
            ? { ...b, status: "returned", return_date: new Date().toISOString().split("T")[0] }
            : b
        )
      );
    }

    setReturning(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .lib-appear { animation: fadeInUp .4s ease both; }

        /* Table row hover */
        .borrow-row:hover { background: #FFF0E8 !important; }

        /* Return button hover */
        .return-btn:hover:not(:disabled) { background: #A5624C !important; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #FDF5EE 0%, #F7EDE3 60%, #F0E4D7 100%)",
        fontFamily: "'Lato', sans-serif",
        padding: "48px 24px 80px",
      }}>

        {/* ── Page title ─────────────────────────────────────────────────────── */}
        <div className="lib-appear" style={{ maxWidth: 900, margin: "0 auto 32px" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 30, fontWeight: 700,
            color: "#3D1F15", margin: 0,
          }}>
            Your Issued Books
          </h1>
          <p style={{ color: "#8B5E52", fontSize: 14, marginTop: 6, fontWeight: 300 }}>
            Track everything you've borrowed from our collection.
          </p>
        </div>

        {/* ── Loading state ──────────────────────────────────────────────────── */}
        {loading && (
          <p style={{ textAlign: "center", color: "#C4836A", fontFamily: "'Playfair Display', serif", fontSize: 18, marginTop: 60 }}>
            Loading your library…
          </p>
        )}

        {/* ── Empty state ────────────────────────────────────────────────────── */}
        {!loading && borrows.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#C4836A" }}>
            <p style={{ fontSize: 44 }}>📚</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22 }}>
              You haven't borrowed any books yet
            </p>
            <p style={{ fontSize: 14, color: "#8B5E52" }}>
              Head to{" "}
              <a href="/books" style={{ color: "#C4836A", textDecoration: "underline dotted" }}>
                Books
              </a>{" "}
              and borrow your first one!
            </p>
          </div>
        )}

        {/* ── Table ─────────────────────────────────────────────────────────── */}
        {!loading && borrows.length > 0 && (
          <div
            className="lib-appear"
            style={{
              maxWidth: 900, margin: "0 auto",
              background: "#FFFAF7",
              borderRadius: 16,
              boxShadow: "0 4px 24px rgba(107,58,42,0.10)",
              overflow: "hidden",
              animationDelay: "0.1s",
            }}
          >
            {/* Table header row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 120px 120px 110px 130px",
              gap: 0,
              background: "#F5E6DC",
              padding: "12px 20px",
            }}>
              {["Issued Book", "Title", "Issue Date", "Due Date", "Status", "Action"].map((h) => (
                <span key={h} style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 12, fontWeight: 700,
                  color: "#6B3A2A", letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Data rows */}
            {visible.map((borrow, i) => (
              <div
                key={borrow.id}
                className="borrow-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 120px 120px 110px 130px",
                  gap: 0,
                  alignItems: "center",
                  padding: "14px 20px",
                  // Alternating row background — easier to read
                  background: i % 2 === 0 ? "#FFFAF7" : "#FDF5EE",
                  borderBottom: "1px solid #F2E2D8",
                  transition: "background .15s",
                  animation: `fadeInUp .35s ease both`,
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                {/* Cover thumbnail */}
                <div style={{ width: 44, height: 60 }}>
                  <img
                    src={borrow.book.cover_image}
                    alt={borrow.book.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://via.placeholder.com/44x60/E8C9B5/6B3A2A?text=📖`;
                    }}
                  />
                </div>

                {/* Book title */}
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 13, color: "#3D1F15", fontWeight: 600,
                  paddingRight: 12,
                }}>
                  {borrow.book.title.length > 35
                    ? borrow.book.title.slice(0, 33) + "…"
                    : borrow.book.title}
                </span>

                {/* Issue date */}
                <span style={{ fontSize: 13, color: "#8B5E52" }}>
                  {formatDate(borrow.issue_date)}
                </span>

                {/* Due date */}
                <span style={{ fontSize: 13, color: "#8B5E52" }}>
                  {formatDate(borrow.due_date)}
                </span>

                {/* Status badge */}
                <StatusBadge status={borrow.status} />

                {/* Return / Renew button */}
                <button
                  className="return-btn"
                  onClick={() => handleReturn(borrow)}
                  disabled={borrow.status === "returned" || returning === borrow.id}
                  style={{
                    background: borrow.status === "returned" ? "#D9BFB5" : "#C4836A",
                    color: "#FFF8F0",
                    border: "none", borderRadius: 999,
                    padding: "7px 16px",
                    fontFamily: "'Lato', sans-serif",
                    fontSize: 12, fontWeight: 700,
                    cursor: borrow.status === "returned" ? "not-allowed" : "pointer",
                    transition: "background .2s",
                    minWidth: 110,
                  }}
                >
                  {returning === borrow.id
                    ? "Returning…"
                    : borrow.status === "returned"
                    ? "Returned ✓"
                    : "Return / Renew"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: "1.5px solid #C4836A",
                  background: p === page ? "#C4836A" : "transparent",
                  color: p === page ? "#FFF8F0" : "#C4836A",
                  fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13,
                  cursor: "pointer", transition: "background .2s, color .2s",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
