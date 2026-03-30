import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import ApiClient               from "../api";
import toast                   from "react-hot-toast";

const api = new ApiClient();

// ── Types ──────────────────────────────────────────────────────────────────────
interface AdminStats {
  total_books:     number;
  total_users:     number;
  active_borrows:  number;
}

interface BookRow {
  id:               number;
  title:            string;
  author:           string;
  available_copies: number;
  category?:        { name: string };
}

interface BorrowRow {
  id:         number;
  user:       { name: string };
  book:       { title: string };
  issue_date: string;
  due_date:   string;
  status:     "borrowed" | "returned" | "overdue";
}

// ── Stat card ──────────────────────────────────────────────────────────────────
// Reusable little card that shows a number with a label.
function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div style={{
      background: "#FFFAF7",
      borderRadius: 14,
      padding: "24px 28px",
      boxShadow: "0 4px 18px rgba(107,58,42,0.09)",
      textAlign: "center",
      flex: 1, minWidth: 160,
    }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 32, fontWeight: 700,
        color: "#C4836A", margin: 0,
      }}>
        {value}
      </p>
      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: "#8B5E52", margin: "4px 0 0" }}>
        {label}
      </p>
    </div>
  );
}

// ── "Add Book" modal form ──────────────────────────────────────────────────────
// A simple overlay form so the admin can add a new book without leaving the page.
function AddBookModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (book: Omit<BookRow, "id" | "category">) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: "", author: "", category_id: "", available_copies: 1, cover_image: "", description: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.author) {
      toast.error("Title and Author are required.");
      return;
    }
    setSaving(true);
    await onSave({
      title:            form.title,
      author:           form.author,
      available_copies: Number(form.available_copies),
    });
    setSaving(false);
  };

  // InputField — small helper to avoid repeating the same input style 6 times
  const Field = ({ label, name, type = "text", placeholder = "" }: {
    label: string; name: string; type?: string; placeholder?: string;
  }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: "#6B3A2A", fontWeight: 700, display: "block", marginBottom: 4 }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={(form as any)[name]}
        onChange={handleChange}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "10px 14px", border: "1.5px solid #E5C9BB",
          borderRadius: 8, fontFamily: "'Lato', sans-serif",
          fontSize: 13, color: "#3D1F15", background: "#FFFAF7",
        }}
      />
    </div>
  );

  return (
    // Semi-transparent backdrop
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(61,31,21,0.35)",
        zIndex: 1000, display: "flex",
        alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Modal card — stopPropagation so clicking inside doesn't close it */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FDF5EE", borderRadius: 18,
          padding: "32px 28px", width: "100%", maxWidth: 460,
          boxShadow: "0 20px 60px rgba(107,58,42,0.25)",
        }}
      >
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#3D1F15", marginBottom: 24 }}>
          Add New Book
        </h2>

        <Field label="Title *"           name="title"            placeholder="e.g. The Great Gatsby" />
        <Field label="Author *"          name="author"           placeholder="e.g. F. Scott Fitzgerald" />
        <Field label="Cover Image URL"   name="cover_image"      placeholder="https://..." />
        <Field label="Category ID"       name="category_id"      type="number" placeholder="1" />
        <Field label="Available Copies"  name="available_copies" type="number" placeholder="1" />

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: "#6B3A2A", fontWeight: 700, display: "block", marginBottom: 4 }}>
            Description
          </label>
          <textarea
            name="description"
            placeholder="Short description of the book…"
            value={form.description}
            onChange={handleChange}
            rows={3}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "10px 14px", border: "1.5px solid #E5C9BB",
              borderRadius: 8, fontFamily: "'Lato', sans-serif",
              fontSize: 13, color: "#3D1F15", background: "#FFFAF7",
              resize: "vertical",
            }}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              flex: 1, padding: "11px 0",
              background: saving ? "#D9BFB5" : "#C4836A",
              color: "#FFF8F0", border: "none", borderRadius: 999,
              fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving…" : "Save Book"}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "11px 0",
              background: "transparent", color: "#C4836A",
              border: "1.5px solid #C4836A", borderRadius: 999,
              fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Admin() {
  const navigate = useNavigate();

  const [stats,       setStats]       = useState<AdminStats | null>(null);
  const [books,       setBooks]       = useState<BookRow[]>([]);
  const [borrows,     setBorrows]     = useState<BorrowRow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState<"books" | "borrows">("books");
  const [showAddBook, setShowAddBook] = useState(false);
  const [deletingId,  setDeletingId]  = useState<number | null>(null);

  // ── Auth + admin guard ─────────────────────────────────────────────────────
  // First check token exists, then check user.is_admin from the API.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    api.getUser().then((data) => {
      // The User model should have: is_admin (boolean) or role === "admin"
      // Adjust the condition below to match YOUR backend's User model field.
      if (!data?.user?.is_admin) {
        toast.error("Admin access only.");
        navigate("/");
        return;
      }

      // Load everything in parallel once we know they're admin
      Promise.all([
        api.getAdminStats(),
        api.getBooks(),
        api.getAllBorrows(),
      ]).then(([statsData, booksData, borrowsData]) => {
        if (statsData) setStats(statsData);
        if (booksData) setBooks(booksData.books || []);
        if (borrowsData) setBorrows(borrowsData.borrows || []);
      }).finally(() => setLoading(false));
    });
  }, [navigate]);

  // ── Delete a book ──────────────────────────────────────────────────────────
  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setDeletingId(id);
    const result = await api.deleteBook(id);
    if (result) {
      // Remove from local state so the row disappears instantly
      setBooks((prev) => prev.filter((b) => b.id !== id));
      toast.success(`"${title}" deleted.`);
    }
    setDeletingId(null);
  };

  // ── Add a book ─────────────────────────────────────────────────────────────
  const handleAddBook = async (book: any) => {
    const result = await api.addBook(book);
    if (result?.book) {
      setBooks((prev) => [...prev, result.book]);
      setShowAddBook(false);
      toast.success("Book added successfully! 📚");
    }
  };

  // ── Tab button helper ──────────────────────────────────────────────────────
  const TabBtn = ({ id, label }: { id: "books" | "borrows"; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: "9px 24px",
        background: activeTab === id ? "#C4836A" : "transparent",
        color: activeTab === id ? "#FFF8F0" : "#C4836A",
        border: "1.5px solid #C4836A",
        borderRadius: 999,
        fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13,
        cursor: "pointer", transition: "background .2s, color .2s",
      }}
    >
      {label}
    </button>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .admin-in { animation: fadeInUp .4s ease both; }
        .tbl-row:hover { background: #FFF0E8 !important; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #FDF5EE 0%, #F7EDE3 60%, #F0E4D7 100%)",
        fontFamily: "'Lato', sans-serif",
        padding: "48px 24px 80px",
      }}>

        {/* ── Page heading ─────────────────────────────────────────────────── */}
        <div className="admin-in" style={{ maxWidth: 960, margin: "0 auto 36px" }}>
          <p style={{ fontSize: 12, letterSpacing: 3, color: "#C4836A", textTransform: "uppercase", marginBottom: 6 }}>
            Admin Panel
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: "#3D1F15", margin: 0 }}>
            Library Dashboard
          </h1>
        </div>

        {loading && (
          <p style={{ textAlign: "center", color: "#C4836A", fontFamily: "'Playfair Display', serif", fontSize: 18, marginTop: 60 }}>
            Loading dashboard…
          </p>
        )}

        {!loading && (
          <>
            {/* ── Stat cards ─────────────────────────────────────────────────── */}
            <div
              className="admin-in"
              style={{
                maxWidth: 960, margin: "0 auto 40px",
                display: "flex", gap: 20, flexWrap: "wrap",
                animationDelay: "0.1s",
              }}
            >
              <StatCard label="Total Books"    value={stats?.total_books    ?? books.length}  icon="📚" />
              <StatCard label="Total Users"    value={stats?.total_users    ?? "—"}            icon="👥" />
              <StatCard label="Active Borrows" value={stats?.active_borrows ?? "—"}            icon="📖" />
            </div>

            {/* ── Tabs ───────────────────────────────────────────────────────── */}
            <div
              className="admin-in"
              style={{
                maxWidth: 960, margin: "0 auto 24px",
                display: "flex", gap: 10,
                animationDelay: "0.15s",
              }}
            >
              <TabBtn id="books"   label="📚 Manage Books"  />
              <TabBtn id="borrows" label="📋 All Borrows"   />

              {/* Add Book button — only visible on the Books tab */}
              {activeTab === "books" && (
                <button
                  onClick={() => setShowAddBook(true)}
                  style={{
                    marginLeft: "auto",
                    padding: "9px 20px",
                    background: "#3D1F15", color: "#FFF8F0",
                    border: "none", borderRadius: 999,
                    fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  + Add Book
                </button>
              )}
            </div>

            {/* ── Books table ────────────────────────────────────────────────── */}
            {activeTab === "books" && (
              <div
                className="admin-in"
                style={{
                  maxWidth: 960, margin: "0 auto",
                  background: "#FFFAF7", borderRadius: 16,
                  boxShadow: "0 4px 24px rgba(107,58,42,0.10)",
                  overflow: "hidden", animationDelay: "0.2s",
                }}
              >
                {/* Header */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 140px 80px 120px 80px",
                  padding: "12px 20px", background: "#F5E6DC",
                }}>
                  {["Title", "Author", "Category", "Copies", "Delete"].map((h) => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#6B3A2A", letterSpacing: 0.5, textTransform: "uppercase" }}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Rows */}
                {books.map((book, i) => (
                  <div
                    key={book.id}
                    className="tbl-row"
                    style={{
                      display: "grid", gridTemplateColumns: "1fr 140px 80px 120px 80px",
                      alignItems: "center", padding: "13px 20px",
                      background: i % 2 === 0 ? "#FFFAF7" : "#FDF5EE",
                      borderBottom: "1px solid #F2E2D8",
                      transition: "background .15s",
                    }}
                  >
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#3D1F15", fontWeight: 600 }}>
                      {book.title.length > 40 ? book.title.slice(0, 38) + "…" : book.title}
                    </span>
                    <span style={{ fontSize: 13, color: "#8B5E52" }}>{book.author}</span>
                    <span style={{ fontSize: 12, color: "#A08070" }}>{book.category?.name ?? "—"}</span>
                    <span style={{ fontSize: 13, color: "#6B3A2A", fontWeight: 600 }}>
                      {book.available_copies} cop{book.available_copies === 1 ? "y" : "ies"}
                    </span>
                    <button
                      onClick={() => handleDelete(book.id, book.title)}
                      disabled={deletingId === book.id}
                      style={{
                        background: "none", border: "1px solid #E5AAA0",
                        borderRadius: 6, padding: "5px 10px",
                        color: "#C04030", fontSize: 12,
                        cursor: "pointer", fontFamily: "'Lato', sans-serif",
                      }}
                    >
                      {deletingId === book.id ? "…" : "Delete"}
                    </button>
                  </div>
                ))}

                {books.length === 0 && (
                  <p style={{ textAlign: "center", padding: "40px 0", color: "#C4836A", fontFamily: "'Playfair Display', serif" }}>
                    No books in the system yet.
                  </p>
                )}
              </div>
            )}

            {/* ── Borrows table ──────────────────────────────────────────────── */}
            {activeTab === "borrows" && (
              <div
                className="admin-in"
                style={{
                  maxWidth: 960, margin: "0 auto",
                  background: "#FFFAF7", borderRadius: 16,
                  boxShadow: "0 4px 24px rgba(107,58,42,0.10)",
                  overflow: "hidden", animationDelay: "0.2s",
                }}
              >
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 140px 110px 110px 100px",
                  padding: "12px 20px", background: "#F5E6DC",
                }}>
                  {["Book", "User", "Issue Date", "Due Date", "Status"].map((h) => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#6B3A2A", letterSpacing: 0.5, textTransform: "uppercase" }}>
                      {h}
                    </span>
                  ))}
                </div>

                {borrows.map((borrow, i) => (
                  <div
                    key={borrow.id}
                    className="tbl-row"
                    style={{
                      display: "grid", gridTemplateColumns: "1fr 140px 110px 110px 100px",
                      alignItems: "center", padding: "13px 20px",
                      background: i % 2 === 0 ? "#FFFAF7" : "#FDF5EE",
                      borderBottom: "1px solid #F2E2D8",
                      transition: "background .15s",
                    }}
                  >
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#3D1F15", fontWeight: 600 }}>
                      {borrow.book.title.length > 35 ? borrow.book.title.slice(0, 33) + "…" : borrow.book.title}
                    </span>
                    <span style={{ fontSize: 13, color: "#8B5E52" }}>{borrow.user.name}</span>
                    <span style={{ fontSize: 12, color: "#8B5E52" }}>
                      {new Date(borrow.issue_date).toLocaleDateString("en-GB")}
                    </span>
                    <span style={{ fontSize: 12, color: "#8B5E52" }}>
                      {new Date(borrow.due_date).toLocaleDateString("en-GB")}
                    </span>
                    {/* Inline status badge */}
                    <span style={{
                      padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                      background: borrow.status === "returned" ? "#D4F0D8" : borrow.status === "overdue" ? "#FAD0CC" : "#FAE0D8",
                      color:      borrow.status === "returned" ? "#2E7D32" : borrow.status === "overdue" ? "#9B2418" : "#B24E35",
                    }}>
                      {borrow.status.charAt(0).toUpperCase() + borrow.status.slice(1)}
                    </span>
                  </div>
                ))}

                {borrows.length === 0 && (
                  <p style={{ textAlign: "center", padding: "40px 0", color: "#C4836A", fontFamily: "'Playfair Display', serif" }}>
                    No borrow records found.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Add Book modal ─────────────────────────────────────────────────── */}
      {showAddBook && (
        <AddBookModal
          onClose={() => setShowAddBook(false)}
          onSave={handleAddBook}
        />
      )}
    </>
  );
}
