import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ApiClient from "../api";
import toast from "react-hot-toast";

const apiClient = new ApiClient();

export default function Login() {
  const navigate = useNavigate();
  const [input, setInput] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.email || !input.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    const data = await apiClient.login(input.email, input.password);
    setLoading(false);

    if (data?.token) {
      localStorage.setItem("token", data.token);
      toast.success("Login successful!");
      navigate("/");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center py-5"
      style={{ backgroundColor: "#fdf6ec", minHeight: "80vh" }}
    >
      <div
        className="p-4 text-center"
        style={{
          border: "2px solid #222",
          borderRadius: "1.5rem",
          width: "350px",
          backgroundColor: "#fff",
        }}
      >
        {/* Avatar */}
        <div
          className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: "70px", height: "70px",
            backgroundColor: "#f5c5c5",
            fontSize: "2rem", marginTop: "-50px",
            border: "2px solid #222",
          }}
        >
          👤
        </div>

        <p className="text-muted mb-4" style={{ color: "#b05a7a" }}>
          Welcome back to your cozy reading corner
        </p>

        <input
          type="email"
          name="email"
          placeholder="📧  Email"
          className="form-control mb-3 text-center"
          value={input.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="🔒  Password"
          className="form-control mb-4 text-center"
          value={input.password}
          onChange={handleChange}
        />

        <button
          className="btn w-100 py-2"
          style={{ backgroundColor: "#f5c5c5", border: "1px solid #e0a0a0" }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Logging in..." : "LOGIN"}
        </button>

        <p className="mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#b05a7a" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}