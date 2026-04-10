import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import ApiClient               from "../api";
import toast                   from "react-hot-toast";

const api = new ApiClient();

// ── Types ──────────────────────────────────────────────────────────────────────
interface AdminStats {
  total_books:    number;
  total_users:    number;
  active_borrows: number;
  total_fines:    number;
  pending_fines:  number;
}

interface BookRow {
  id:               number;
  title:            string;
  author:           string;
  available_copies: number;
  genre?:           string;
}

interface BorrowRow {
  id:             number;
  user:           { name: string };
  book:           { title: string };
  issue_date:     string;
  due_date:       string;
  status:         "borrowed" | "returned" | "overdue";
  fine_amount:    number;
  fine_paid:      boolean;
  payment_method: string | null;
  paid_at:        string | null;
}

interface AuditLog {
  id:                number;
  action:            string;
  entity_type:       string;
  entity_id:         number;
  entity_name:       string;
  changes:           string;
  performed_by:      number;
  performed_by_name: string;
  created_at:        string;
}

// ── Genres ─────────────────────────────────────────────────────────────────────
const GENRES = [
  "Fantasy", "Romance", "Mystery", "Thriller", "Science Fiction",
  "Historical Fiction", "Horror", "Biography", "Self-Help",
  "Philosophy", "Classic Literature", "Poetry", "Children's",
];

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div style={{
      background: "#FFFAF7", borderRadius: 14,
      padding: "24px 28px",
      boxShadow: "0 4px 18px rgba(107,58,42,0.09)",
      textAlign: "center", flex: 1, minWidth: 160,
    }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "#C4836A", margin: 0 }}>
        {value}
      </p>
      <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: "#8B5E52", margin: "4px 0 0" }}>
        {label}
      </p>
    </div>
  );
}

// ── Field component ────────────────────────────────────────────────────────────
function Field({ label, name, type = "text", placeholder = "", value, onChange }: {
  label: string; name: string; type?: string; placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: "#6B3A2A", fontWeight: 700, display: "block", marginBottom: 4 }}>
        {label}
      </label>
      <input
        type={type} name={name} placeholder={placeholder} value={value} onChange={onChange}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "10px 14px", border: "1.5px solid #E5C9BB",
          borderRadius: 8, fontFamily: "'Lato', sans-serif",
          fontSize: 13, color: "#3D1F15", background: "#FFFAF7",
        }}
      />
    </div>
  );
}

// ── Add Book Modal ─────────────────────────────────────────────────────────────
function AddBookModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (book: any) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: "", author: "", genre: "", available_copies: 1, cover_image: "", description: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, description: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.author) { toast.error("Title and Author are required."); return; }
    setSaving(true);
    await onSave({
      title:            form.title,
      author:           form.author,
      genre:            form.genre || null,
      available_copies: Number(form.available_copies),
      cover_image:      form.cover_image || null,
      description:      form.description || null,
      
    });
    setSaving(false);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(61,31,21,0.35)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#FDF5EE", borderRadius: 18,
        padding: "32px 28px", width: "100%", maxWidth: 460,
        boxShadow: "0 20px 60px rgba(107,58,42,0.25)",
      }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#3D1F15", marginBottom: 24 }}>
          Add New Book
        </h2>

        <Field label="Title *"         name="title"            placeholder="e.g. The Great Gatsby"    value={form.title}            onChange={handleChange} />
        <Field label="Author *"        name="author"           placeholder="e.g. F. Scott Fitzgerald" value={form.author}           onChange={handleChange} />
        <Field label="Cover Image URL" name="cover_image"      placeholder="https://..."              value={form.cover_image}      onChange={handleChange} />

        {/* Genre dropdown */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: "#6B3A2A", fontWeight: 700, display: "block", marginBottom: 4 }}>
            Genre
          </label>
          <select
            value={form.genre}
            onChange={(e) => setForm((prev) => ({ ...prev, genre: e.target.value }))}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "10px 14px", border: "1.5px solid #E5C9BB",
              borderRadius: 8, fontFamily: "'Lato', sans-serif",
              fontSize: 13, color: form.genre ? "#3D1F15" : "#A08070",
              background: "#FFFAF7", appearance: "none" as any,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B3A2A' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
              cursor: "pointer",
            }}
          >
            <option value="">Select a genre…</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <Field label="Available Copies" name="available_copies" type="number" placeholder="1" value={form.available_copies} onChange={handleChange} />

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: "#6B3A2A", fontWeight: 700, display: "block", marginBottom: 4 }}>Description</label>
          <textarea name="description" placeholder="Short description of the book…" value={form.description} onChange={handleTextareaChange} rows={3}
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", border: "1.5px solid #E5C9BB", borderRadius: 8, fontFamily: "'Lato', sans-serif", fontSize: 13, color: "#3D1F15", background: "#FFFAF7", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, padding: "11px 0", background: saving ? "#D9BFB5" : "#C4836A", color: "#FFF8F0", border: "none", borderRadius: 999, fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving…" : "Save Book"}
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", background: "transparent", color: "#C4836A", border: "1.5px solid #C4836A", borderRadius: 999, fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Book Modal ────────────────────────────────────────────────────────────
function EditBookModal({ book, onClose, onSave }: {
  book: BookRow;
  onClose: () => void;
  onSave: (id: number, data: any) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: book.title, author: book.author, available_copies: book.available_copies,
    genre: book.genre ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.author) { toast.error("Title and Author are required."); return; }
    setSaving(true);
    await onSave(book.id, {
      title:            form.title,
      author:           form.author,
      available_copies: Number(form.available_copies),
      genre:            form.genre || null,
    });
    setSaving(false);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(61,31,21,0.35)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#FDF5EE", borderRadius: 18,
        padding: "32px 28px", width: "100%", maxWidth: 460,
        boxShadow: "0 20px 60px rgba(107,58,42,0.25)",
      }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#3D1F15", marginBottom: 24 }}>Edit Book</h2>
        <Field label="Title *"          name="title"            placeholder="e.g. The Great Gatsby"    value={form.title}            onChange={handleChange} />
        <Field label="Author *"         name="author"           placeholder="e.g. F. Scott Fitzgerald" value={form.author}           onChange={handleChange} />
        <Field label="Available Copies" name="available_copies" type="number" placeholder="1"          value={form.available_copies} onChange={handleChange} />

        {/* Genre dropdown */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: "#6B3A2A", fontWeight: 700, display: "block", marginBottom: 4 }}>
            Genre
          </label>
          <select
            value={form.genre}
            onChange={(e) => setForm((prev) => ({ ...prev, genre: e.target.value }))}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "10px 14px", border: "1.5px solid #E5C9BB",
              borderRadius: 8, fontFamily: "'Lato', sans-serif",
              fontSize: 13, color: form.genre ? "#3D1F15" : "#A08070",
              background: "#FFFAF7", appearance: "none" as any,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B3A2A' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
              cursor: "pointer",
            }}
          >
            <option value="">Select a genre…</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button onClick={handleSubmit} disabled={saving} style={{ flex: 1, padding: "11px 0", background: saving ? "#D9BFB5" : "#C4836A", color: "#FFF8F0", border: "none", borderRadius: 999, fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", background: "transparent", color: "#C4836A", border: "1.5px solid #C4836A", borderRadius: 999, fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
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

  const [stats,          setStats]          = useState<AdminStats | null>(null);
  const [books,          setBooks]          = useState<BookRow[]>([]);
  const [borrows,        setBorrows]        = useState<BorrowRow[]>([]);
  const [logs,           setLogs]           = useState<AuditLog[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [activeTab,      setActiveTab]      = useState<"books" | "borrows" | "logs">("books");
  const [showAddBook,    setShowAddBook]    = useState(false);
  const [deletingId,     setDeletingId]     = useState<number | null>(null);
  const [confirmingFine, setConfirmingFine] = useState<number | null>(null);
  const [editingBook,    setEditingBook]    = useState<BookRow | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    api.getUser().then((data) => {
      const user = data?.user ?? data;
      if (!user?.is_admin) {
        toast.error("Admin access only.");
        navigate("/");
        return;
      }

      Promise.all([
        api.getAdminStats(),
        api.getBooks(),
        api.getAllBorrows(),
        api.getAuditLogs(),
      ]).then(([statsData, booksData, borrowsData, logsData]) => {
        if (statsData)   setStats(statsData);
        if (booksData)   setBooks(booksData.books || []);
        if (borrowsData) setBorrows(borrowsData.borrows || []);
        if (logsData)    setLogs(logsData.logs || []);
      }).finally(() => setLoading(false));
    });
  }, [navigate]);

  const handleConfirmFine = async (borrowId: number) => {
    setConfirmingFine(borrowId);
    const result = await api.confirmFine(borrowId);
    if (result?.success) {
      setBorrows((prev) => prev.map((b) => b.id === borrowId ? { ...b, fine_paid: true } : b));
      toast.success("Fine confirmed successfully!");
    }
    setConfirmingFine(null);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    const result = await api.deleteBook(id);
    if (result) {
      setBooks((prev) => prev.filter((b) => b.id !== id));
      toast.success(`"${title}" deleted.`);
      const logsData = await api.getAuditLogs();
      if (logsData) setLogs(logsData.logs || []);
    }
    setDeletingId(null);
  };

  const handleAddBook = async (book: any) => {
    const result = await api.addBook(book);
    if (result?.book) {
      setBooks((prev) => [...prev, result.book]);
      setShowAddBook(false);
      toast.success("Book added successfully! 📚");
      const logsData = await api.getAuditLogs();
      if (logsData) setLogs(logsData.logs || []);
    }
  };

  const handleEditBook = async (id: number, data: any) => {
    const result = await api.updateBook(id, data);
    if (result?.book) {
      setBooks((prev) => prev.map((b) => b.id === id ? { ...b, ...data } : b));
      setEditingBook(null);
      toast.success("Book updated successfully!");
      const logsData = await api.getAuditLogs();
      if (logsData) setLogs(logsData.logs || []);
    }
  };

  const TabBtn = ({ id, label }: { id: "books" | "borrows" | "logs"; label: string }) => (
    <button onClick={() => setActiveTab(id)} style={{
      padding: "9px 24px",
      background: activeTab === id ? "#C4836A" : "transparent",
      color: activeTab === id ? "#FFF8F0" : "#C4836A",
      border: "1.5px solid #C4836A", borderRadius: 999,
      fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13,
      cursor: "pointer", transition: "background .2s, color .2s",
    }}>
      {label}
    </button>
  );

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
        fontFamily: "'Lato', sans-serif", padding: "48px 24px 80px",
      }}>
        {/* Page heading */}
        <div className="admin-in" style={{ maxWidth: 960, margin: "0 auto 36px" }}>
          <p style={{ fontSize: 12, letterSpacing: 3, color: "#C4836A", textTransform: "uppercase", marginBottom: 6 }}>Admin Panel</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: "#3D1F15", margin: 0 }}>Library Dashboard</h1>
        </div>

        {loading && (
          <p style={{ textAlign: "center", color: "#C4836A", fontFamily: "'Playfair Display', serif", fontSize: 18, marginTop: 60 }}>
            Loading dashboard…
          </p>
        )}

        {!loading && (
          <>
            {/* Stat cards */}
            <div className="admin-in" style={{ maxWidth: 960, margin: "0 auto 40px", display: "flex", gap: 20, flexWrap: "wrap", animationDelay: "0.1s" }}>
              <StatCard label="Total Books"           value={stats?.total_books    ?? books.length}                  icon="📚" />
              <StatCard label="Total Users"           value={stats?.total_users    ?? "—"}                            icon="👥" />
              <StatCard label="Active Borrows"        value={stats?.active_borrows ?? "—"}                            icon="📖" />
              <StatCard label="Fines Collected"       value={stats?.total_fines    ? `৳${stats.total_fines}` : "৳0"} icon="💰" />
              <StatCard label="Pending Confirmations" value={stats?.pending_fines  ?? 0}                              icon="⏳" />
            </div>

            {/* Tabs */}
            <div className="admin-in" style={{ maxWidth: 960, margin: "0 auto 24px", display: "flex", gap: 10, animationDelay: "0.15s" }}>
              <TabBtn id="books"   label="📚 Manage Books" />
              <TabBtn id="borrows" label="📋 All Borrows"  />
              <TabBtn id="logs"    label="🔍 Audit Log"    />

              {activeTab === "books" && (
                <button onClick={() => setShowAddBook(true)} style={{
                  marginLeft: "auto", padding: "9px 20px",
                  background: "#3D1F15", color: "#FFF8F0",
                  border: "none", borderRadius: 999,
                  fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}>
                  + Add Book
                </button>
              )}
            </div>

            {/* Books table */}
            {activeTab === "books" && (
              <div className="admin-in" style={{ maxWidth: 960, margin: "0 auto", background: "#FFFAF7", borderRadius: 16, boxShadow: "0 4px 24px rgba(107,58,42,0.10)", overflow: "hidden", animationDelay: "0.2s" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px 100px 70px 80px", padding: "12px 20px", background: "#F5E6DC" }}>
                  {["Title", "Author", "Genre", "Copies", "Edit", "Delete"].map((h) => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#6B3A2A", letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</span>
                  ))}
                </div>

                {books.map((book, i) => (
                  <div key={book.id} className="tbl-row" style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px 100px 70px 80px", alignItems: "center", padding: "13px 20px", background: i % 2 === 0 ? "#FFFAF7" : "#FDF5EE", borderBottom: "1px solid #F2E2D8", transition: "background .15s" }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#3D1F15", fontWeight: 600 }}>
                      {book.title.length > 40 ? book.title.slice(0, 38) + "…" : book.title}
                    </span>
                    <span style={{ fontSize: 13, color: "#8B5E52" }}>{book.author}</span>
                    <span style={{ fontSize: 12, color: "#A08070" }}>{book.genre ?? "—"}</span>
                    <span style={{ fontSize: 13, color: "#6B3A2A", fontWeight: 600 }}>
                      {book.available_copies} cop{book.available_copies === 1 ? "y" : "ies"}
                    </span>
                    <button onClick={() => setEditingBook(book)} style={{ background: "none", border: "1px solid #C4836A", borderRadius: 6, padding: "5px 10px", color: "#C4836A", fontSize: 12, cursor: "pointer", fontFamily: "'Lato', sans-serif" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(book.id, book.title)} disabled={deletingId === book.id} style={{ background: "none", border: "1px solid #E5AAA0", borderRadius: 6, padding: "5px 10px", color: "#C04030", fontSize: 12, cursor: "pointer", fontFamily: "'Lato', sans-serif" }}>
                      {deletingId === book.id ? "…" : "Delete"}
                    </button>
                  </div>
                ))}

                {books.length === 0 && (
                  <p style={{ textAlign: "center", padding: "40px 0", color: "#C4836A", fontFamily: "'Playfair Display', serif" }}>No books in the system yet.</p>
                )}
              </div>
            )}

            {/* Borrows table */}
            {activeTab === "borrows" && (
              <div className="admin-in" style={{ maxWidth: 960, margin: "0 auto", background: "#FFFAF7", borderRadius: 16, boxShadow: "0 4px 24px rgba(107,58,42,0.10)", overflow: "hidden", animationDelay: "0.2s" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 110px 110px 100px 140px", padding: "12px 20px", background: "#F5E6DC" }}>
                  {["Book", "User", "Issue Date", "Due Date", "Status", "Fine"].map((h) => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#6B3A2A", letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</span>
                  ))}
                </div>

                {borrows.map((borrow, i) => (
                  <div key={borrow.id} className="tbl-row" style={{ display: "grid", gridTemplateColumns: "1fr 140px 110px 110px 100px 140px", alignItems: "center", padding: "13px 20px", background: i % 2 === 0 ? "#FFFAF7" : "#FDF5EE", borderBottom: "1px solid #F2E2D8", transition: "background .15s" }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#3D1F15", fontWeight: 600 }}>
                      {borrow.book.title.length > 35 ? borrow.book.title.slice(0, 33) + "…" : borrow.book.title}
                    </span>
                    <span style={{ fontSize: 13, color: "#8B5E52" }}>{borrow.user.name}</span>
                    <span style={{ fontSize: 12, color: "#8B5E52" }}>{new Date(borrow.issue_date).toLocaleDateString("en-GB")}</span>
                    <span style={{ fontSize: 12, color: "#8B5E52" }}>{new Date(borrow.due_date).toLocaleDateString("en-GB")}</span>

                    <span style={{
                      padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                      background: borrow.status === "returned" ? "#D4F0D8" : borrow.status === "overdue" ? "#FAD0CC" : "#FAE0D8",
                      color:      borrow.status === "returned" ? "#2E7D32" : borrow.status === "overdue" ? "#9B2418" : "#B24E35",
                    }}>
                      {borrow.status.charAt(0).toUpperCase() + borrow.status.slice(1)}
                    </span>

                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 12, color: borrow.fine_amount > 0 ? "#C04030" : "#8B5E52", fontWeight: borrow.fine_amount > 0 ? 700 : 400 }}>
                        {borrow.fine_amount > 0 ? `৳${borrow.fine_amount}` : "—"}
                      </span>
                      {borrow.fine_amount > 0 && !borrow.fine_paid && borrow.paid_at && (
                        <button onClick={() => handleConfirmFine(borrow.id)} disabled={confirmingFine === borrow.id} style={{ padding: "4px 10px", borderRadius: 999, background: "#2E7D32", color: "#fff", border: "none", fontSize: 10, fontFamily: "'Lato',sans-serif", fontWeight: 700, cursor: "pointer" }}>
                          {confirmingFine === borrow.id ? "…" : "✓ Confirm"}
                        </button>
                      )}
                      {borrow.fine_paid && (
                        <span style={{ fontSize: 10, color: "#2E7D32", fontFamily: "'Lato',sans-serif", fontWeight: 700 }}>
                          ✓ Paid via {borrow.payment_method}
                        </span>
                      )}
                      {borrow.fine_amount > 0 && !borrow.fine_paid && !borrow.paid_at && (
                        <span style={{ fontSize: 10, color: "#C04030", fontFamily: "'Lato',sans-serif" }}>⚠ Unpaid</span>
                      )}
                    </div>
                  </div>
                ))}

                {borrows.length === 0 && (
                  <p style={{ textAlign: "center", padding: "40px 0", color: "#C4836A", fontFamily: "'Playfair Display', serif" }}>No borrow records found.</p>
                )}
              </div>
            )}

            {/* Audit Log table */}
            {activeTab === "logs" && (
              <div className="admin-in" style={{ maxWidth: 960, margin: "0 auto", background: "#FFFAF7", borderRadius: 16, boxShadow: "0 4px 24px rgba(107,58,42,0.10)", overflow: "hidden", animationDelay: "0.2s" }}>
                <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 1fr 160px", padding: "12px 20px", background: "#F5E6DC" }}>
                  {["Action", "Book", "Changes", "Performed By"].map((h) => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#6B3A2A", letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</span>
                  ))}
                </div>

                {logs.map((log, i) => {
                  let changes: any = {};
                  try { changes = JSON.parse(log.changes || "{}"); } catch {}
                  const actionColor = log.action === "book_deleted" ? "#C04030" : log.action === "book_added" ? "#2E7D32" : "#C4836A";
                  const actionLabel = log.action === "book_deleted" ? "🗑 Deleted" : log.action === "book_added" ? "➕ Added" : "✏️ Edited";

                  return (
                    <div key={log.id} className="tbl-row" style={{ display: "grid", gridTemplateColumns: "130px 1fr 1fr 160px", alignItems: "center", padding: "13px 20px", background: i % 2 === 0 ? "#FFFAF7" : "#FDF5EE", borderBottom: "1px solid #F2E2D8", transition: "background .15s" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: actionColor }}>{actionLabel}</span>
                      <div>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "#3D1F15", fontWeight: 600 }}>{log.entity_name}</span>
                        <p style={{ fontSize: 10, color: "#A07060", margin: "2px 0 0", fontFamily: "'Lato', sans-serif" }}>
                          {new Date(log.created_at).toLocaleString("en-GB")}
                        </p>
                      </div>
                      <div style={{ fontSize: 11, color: "#8B5E52", fontFamily: "'Lato', sans-serif" }}>
                        {Object.keys(changes).length === 0 ? "—" :
                          Object.entries(changes).map(([key, val]: any) => (
                            <p key={key} style={{ margin: "2px 0" }}>
                              {typeof val === "object" && val.from !== undefined
                                ? `${key}: ${val.from} → ${val.to}`
                                : `${key}: ${String(val)}`
                              }
                            </p>
                          ))
                        }
                      </div>
                      <span style={{ fontSize: 12, color: "#8B5E52" }}>{log.performed_by_name}</span>
                    </div>
                  );
                })}

                {logs.length === 0 && (
                  <p style={{ textAlign: "center", padding: "40px 0", color: "#C4836A", fontFamily: "'Playfair Display', serif" }}>
                    No activity recorded yet.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Book modal */}
      {showAddBook && (
        <AddBookModal onClose={() => setShowAddBook(false)} onSave={handleAddBook} />
      )}

      {/* Edit Book modal */}
      {editingBook && (
        <EditBookModal book={editingBook} onClose={() => setEditingBook(null)} onSave={handleEditBook} />
      )}
    </>
  );
}