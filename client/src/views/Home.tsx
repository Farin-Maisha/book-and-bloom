import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
      <div
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1512820790803-83ca734da794')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "320px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          color: "white",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
          Welcome to Book&Bloom
        </h1>
        <h2>Where Stories Blossom</h2>
      </div>

      {/* Buttons Section */}
      <div
        className="d-flex flex-column align-items-center gap-3 py-5"
        style={{ backgroundColor: "#fdf6ec" }}
      >
        <button
          className="btn btn-lg px-5 py-3 text-white"
          style={{ backgroundColor: "#6b3a2a", borderRadius: "2rem" }}
          onClick={() => navigate("/books")}
        >
          Browse to Books
        </button>
        <button
          className="btn btn-lg px-5 py-3"
          style={{
            backgroundColor: "#f5c5c5",
            borderRadius: "2rem",
            border: "1px solid #e0a0a0",
          }}
          onClick={() => navigate("/signup")}
        >
          Join Now!
        </button>
      </div>
    </div>
  );
}