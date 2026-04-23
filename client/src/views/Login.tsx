import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ApiClient from "../api";
import toast from "react-hot-toast";

const apiClient = new ApiClient();

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IconBook = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b05a7a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const [input, setInput] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (window as any).handleGoogleCredentialResponse = async (response: any) => {
      setLoading(true);
      const data = await apiClient.googleAuth(response.credential);
      setLoading(false);

      if (data?.token) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user)); // ← ADD THIS
  toast.success("Welcome!");
  navigate("/");
      } else if (data?.needs_payment) {
        navigate(`/pay-fee?userId=${data.user_id}`);
      } else if (data?.message) {
        toast.error(data.message);
      } else {
        toast.error("Google sign-in failed");
      }
    };

    const initGoogle = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: (window as any).handleGoogleCredentialResponse,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-login-btn"),
          { theme: "outline", size: "large", width: "300", text: "signin_with" }
        );
      }
    };

    if ((window as any).google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if ((window as any).google) {
          initGoogle();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!input.email || !input.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    const data = await apiClient.login(input.email, input.password);
    setLoading(false);

    if (data?.token) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user)); // ← ADD THIS
  toast.success("Welcome back!");
  navigate("/");
    } else if (data?.needs_payment) {
      navigate(`/pay-fee?userId=${data.user_id}`);
    } else if (data?.message) {
      toast.error(data.message);
    }
  };

  const cardStyle: React.CSSProperties = {
    border: "2px solid #222",
    borderRadius: "1.5rem",
    width: "350px",
    backgroundColor: "#fff",
  };

  const btnPrimary: React.CSSProperties = {
    backgroundColor: "#f5c5c5",
    border: "1px solid #e0a0a0",
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center py-5"
      style={{ backgroundColor: "#fdf6ec", minHeight: "80vh" }}
    >
      <div className="p-4 text-center" style={cardStyle}>
        <div
          className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: "70px", height: "70px", backgroundColor: "#f5c5c5",
            border: "2px solid #222",
          }}
        >
          <IconBook />
        </div>

        <p className="text-muted mb-4" style={{ color: "#b05a7a" }}>
          Welcome back to your cozy corner
        </p>

        <div id="google-login-btn" className="d-flex justify-content-center mb-3"></div>

        <div className="d-flex align-items-center mb-3">
          <hr className="flex-grow-1" />
          <span className="px-2 text-muted" style={{ fontSize: "0.8rem" }}>or</span>
          <hr className="flex-grow-1" />
        </div>

        <div className="mb-3" style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><IconMail /></span>
          <input
            type="email"
            name="email"
            placeholder="  Email"
            className="form-control text-center"
            value={input.email}
            onChange={handleChange}
            style={{ paddingLeft: 38 }}
          />
        </div>
        <div className="mb-3" style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><IconLock /></span>
          <input
            type="password"
            name="password"
            placeholder="  Password"
            className="form-control text-center"
            value={input.password}
            onChange={handleChange}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={{ paddingLeft: 38 }}
          />
        </div>

        <button
          className="btn w-100 py-2"
          style={btnPrimary}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Logging in..." : "LOGIN"}
        </button>

        <p className="mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#b05a7a" }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}