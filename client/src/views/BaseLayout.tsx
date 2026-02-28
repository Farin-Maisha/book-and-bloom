import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

interface BaseLayoutProps {
  children: ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="layout">
      <header className="d-flex align-items-center px-4 py-3 bg-light shadow-sm">
        <Link className="text-decoration-none text-dark" to="/">
          <h3>📚 Book&Bloom</h3>
        </Link>
        <div className="flex-grow-1"></div>
        <nav>
          <ul className="nav gap-2">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/books">Books</Link>
            </li>
            {token ? (
              <li className="nav-item">
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            ) : (
              <li className="nav-item">
                <button className="btn btn-outline-primary" onClick={() => navigate("/login")}>
                  Login / Signup
                </button>
              </li>
            )}
          </ul>
        </nav>
      </header>
      <main id="content">{children}</main>
      <footer className="text-center py-3 text-muted">
        www.book&bloom.com
      </footer>
    </div>
  );
};

export default BaseLayout;