
import { ReactNode }                      from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";


interface BaseLayoutProps {
  children: ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const navigate  = useNavigate();
  const location  = useLocation();   // lets us highlight the active nav link
  const token     = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ── Active link helper ─────────────────────────────────────────────────────
  // Returns true if the current URL matches this link's path.
  // Used to bold / underline the active nav item.
  const isActive = (path: string) => location.pathname === path;

  // ── NavLink style ──────────────────────────────────────────────────────────
  // Reusable style function for nav links so we're not repeating inline style objects.
  const navLinkStyle = (path: string): React.CSSProperties => ({
    fontFamily: "'Lato', sans-serif",
    fontSize: 13,
    fontWeight: isActive(path) ? 700 : 400,
    color: isActive(path) ? "#C4836A" : "#6B3A2A",
    textDecoration: "none",
    padding: "4px 2px",
    borderBottom: isActive(path) ? "2px solid #C4836A" : "2px solid transparent",
    transition: "color .2s, border-color .2s",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');

        /* Hover effect on nav links */
        .nav-link-item:hover {
          color: #C4836A !important;
          border-bottom-color: #E5C9BB !important;
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── Navbar ───────────────────────────────────────────────────────── */}
        <header style={{
          display: "flex", alignItems: "center",
          padding: "14px 32px",
          background: "#FFFAF7",
          borderBottom: "1px solid #F0DDD4",
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 2px 12px rgba(107,58,42,0.07)",
        }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20, fontWeight: 700,
              color: "#3D1F15",
            }}>
              📖 Book&Bloom
            </span>
          </Link>

          {/* Spacer pushes nav to the right */}
          <div style={{ flex: 1 }} />

          {/* Nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>

            <Link className="nav-link-item" to="/"           style={navLinkStyle("/")}>Home</Link>
            <Link className="nav-link-item" to="/books"      style={navLinkStyle("/books")}>Books</Link>
            <Link className="nav-link-item" to="/categories" style={navLinkStyle("/categories")}>Categories</Link>
            <Link className="nav-link-item" to="/events"     style={navLinkStyle("/events")}>Events</Link>

            {/* My Library — only show when logged in */}
            {token && (
              <Link className="nav-link-item" to="/my-library" style={navLinkStyle("/my-library")}>
                My Library
              </Link>
            )}

            <Link className="nav-link-item" to="/about" style={navLinkStyle("/about")}>About</Link>

            {/* Admin link — only show when logged in
                (Admin.tsx will redirect away if the user isn't actually admin) */}
            {token && (
              <Link className="nav-link-item" to="/admin" style={navLinkStyle("/admin")}>
                Admin
              </Link>
            )}

            {/* Login/Logout button */}
            {token ? (
              <button
                onClick={handleLogout}
                style={{
                  fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 700,
                  color: "#C4836A", background: "none",
                  border: "1.5px solid #C4836A", borderRadius: 999,
                  padding: "6px 18px", cursor: "pointer",
                  transition: "background .2s, color .2s",
                }}
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                style={{
                  fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 700,
                  color: "#FFF8F0", background: "#C4836A",
                  border: "none", borderRadius: 999,
                  padding: "6px 18px", cursor: "pointer",
                  transition: "background .2s",
                }}
              >
                Login / Sign Up
              </button>
            )}
          </nav>
        </header>

        {/* ── Page content (the actual page goes here) ──────────────────────── */}
        <main style={{ flex: 1 }}>
          {children}
        </main>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer style={{
          padding: "16px 32px",
          background: "#FFFAF7",
          borderTop: "1px solid #F0DDD4",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: "#B08070" }}>
            www.book&bloom.com
          </span>
          <div style={{ display: "flex", gap: 14 }}>
            {["✉", "📘", "📸", "💬"].map((icon) => (
              <span key={icon} style={{ fontSize: 16, cursor: "pointer", opacity: 0.6 }}>{icon}</span>
            ))}
          </div>
        </footer>

      </div>

      {/* ── AI Library Assistant — floats on every page ──────────────────── */}
      {/* Placed outside the flex column so position:fixed works correctly    */}
      
    </>
  );
};

export default BaseLayout;
