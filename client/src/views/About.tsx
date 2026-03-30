export default function About() {
  // ── Contact details (edit these to match your real info) ───────────────────
  const contact = {
    email:    "book@bloom@gmail.com",
    location: "Justice Shahabuddin Ahmed Park, Dhaka",
    phone:    "+880941-63843213",
  };

  // ── Map config ─────────────────────────────────────────────────────────────
  // These are the coordinates for Justice Shahabuddin Ahmed Park, Dhaka.
  // To adjust: go to openstreetmap.org, find the spot, right-click → "Centre map here",
  // then copy the lat/lon from the URL and replace below.
  const mapLat  = 23.7466;
  const mapLon  = 90.3870;
  const mapZoom = 16;

  // Build the OpenStreetMap embed URL
  // bbox = bounding box around the pin (lon-offset, lat-offset, lon+offset, lat+offset)
  const delta  = 0.008;
  const mapSrc =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${mapLon - delta},${mapLat - delta},${mapLon + delta},${mapLat + delta}` +
    `&layer=mapnik` +
    `&marker=${mapLat},${mapLon}`;

  return (
    <>
      {/* ── Fonts (same as rest of the app) ────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .about-section { animation: fadeInUp .5s ease both; }

        /* OpenStreetMap attribution link fix */
        .map-wrapper iframe { border: none; width: 100%; height: 320px; border-radius: 14px; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #FDF5EE 0%, #F7EDE3 60%, #F0E4D7 100%)",
        fontFamily: "'Lato', sans-serif",
        padding: "48px 24px 80px",
      }}>

        {/* ── Page heading ───────────────────────────────────────────────────── */}
        <div className="about-section" style={{ maxWidth: 760, margin: "0 auto 40px" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32, fontWeight: 700,
            color: "#C4836A",           // coral — matches your design screenshot
            marginBottom: 16,
          }}>
            About Book&Bloom
          </h1>

          <p style={{ color: "#5C3828", fontSize: 15, lineHeight: 1.8, fontWeight: 300, marginBottom: 0 }}>
            Book & Bloom is a cozy digital library platform designed for readers who love warm lights,
            soft blankets, and peaceful reading moments. It combines easy book management with a calm
            and welcoming aesthetic, making reading feel comforting and joyful.
          </p>
        </div>

        {/* ── Two-column layout: Contact left, Map right ─────────────────────── */}
        <div
          className="about-section"
          style={{
            maxWidth: 760, margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 32,
            animationDelay: "0.15s",
          }}
        >

          {/* ── Get in Touch card ─────────────────────────────────────────────── */}
          <div style={{
            background: "#FFFAF7",
            borderRadius: 16,
            padding: "28px 28px 32px",
            boxShadow: "0 4px 20px rgba(107,58,42,0.09)",
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22, fontWeight: 700,
              color: "#C4836A", marginBottom: 24,
            }}>
              Get in Touch
            </h2>

            {/* Each row: icon + text */}
            <ContactRow icon="✉" label={contact.email}    />
            <ContactRow icon="📍" label={contact.location} />
            <ContactRow icon="📞" label={contact.phone}    />
          </div>

          {/* ── Map card ──────────────────────────────────────────────────────── */}
          <div style={{
            background: "#FFFAF7",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 4px 20px rgba(107,58,42,0.09)",
            overflow: "hidden",
          }}>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 14, color: "#C4836A",
              marginBottom: 12, fontWeight: 600,
            }}>
              📍 Find Us Here
            </p>

            {/* OpenStreetMap iframe — no API key, no npm package needed */}
            <div className="map-wrapper">
              <iframe
                title="Book & Bloom Location"
                src={mapSrc}
                loading="lazy"
                style={{ borderRadius: 10 }}
              />
            </div>

            {/* Link to open in full map */}
            <a
              href={`https://www.openstreetmap.org/?mlat=${mapLat}&mlon=${mapLon}#map=${mapZoom}/${mapLat}/${mapLon}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block", marginTop: 10,
                fontSize: 12, color: "#C4836A",
                textAlign: "center", textDecoration: "underline dotted",
              }}
            >
              Open in full map →
            </a>
          </div>
        </div>

        {/* ── Bottom tagline ─────────────────────────────────────────────────── */}
        <p
          className="about-section"
          style={{
            textAlign: "center", marginTop: 52,
            color: "#B08070", fontSize: 13, fontWeight: 300,
            animationDelay: "0.3s",
          }}
        >
          Browse, borrow, and bloom — one page at a time. 🌸
        </p>

      </div>
    </>
  );
}

// ── Small helper: one contact info row ────────────────────────────────────────
// Keeps the JSX above clean. Reusable for email/location/phone rows.
function ContactRow({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 14,
      marginBottom: 20,
    }}>
      {/* Icon bubble */}
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: "#F5E6DC",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, flexShrink: 0,
      }}>
        {icon}
      </div>

      {/* Text */}
      <p style={{
        fontFamily: "'Lato', sans-serif",
        fontSize: 14, color: "#5C3828",
        margin: 0, lineHeight: 1.6, paddingTop: 6,
      }}>
        {label}
      </p>
    </div>
  );
}
