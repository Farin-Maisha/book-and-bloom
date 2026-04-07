// ReservationModal.tsx
// Shown immediately after a user successfully reserves a book.
// Displays: confirmation message, pickup deadline, QR code, and pickup location.

interface ReservationModalProps {
  bookTitle: string;
  reservationId: number;
  pickupDeadline: string; // "YYYY-MM-DD"
  onClose: () => void;
}

// ── Simple QR-like display using CSS grid ─────────────────────────────────────
// Generates a deterministic pixel pattern from the reservation ID string.
// Replace with a real QR library (e.g. qrcode.react) if backend integration needed.
function QRCode({ value }: { value: string }) {
  const size   = 12; // grid cells
  const cells  = size * size;

  // Seed a simple pattern from the string so the same ID always gives the same QR
  const pattern = Array.from({ length: cells }, (_, i) => {
    const code = value.split("").reduce((acc, c, j) => acc + c.charCodeAt(0) * (j + 1) * (i + 1), 0);
    return code % 3 !== 0;
  });

  // Always fill the three finder squares (top-left, top-right, bottom-left)
  const finderPositions = new Set([
    0,1,2,3,4,5,6,        // top-left top row
    12,18,24,30,36,       // top-left left col
    13,14,15,16,17,       // top-left inner
    5,17,29,              // top-left right col
    6,7,8,9,10,11,        // top-right top row
    18,24,30,36,42,48,    // ... simplified
    132,133,134,135,      // bottom-left
  ]);

  return (
    <div style={{
      display: "inline-grid",
      gridTemplateColumns: `repeat(${size}, 8px)`,
      gridTemplateRows: `repeat(${size}, 8px)`,
      gap: 1,
      background: "#fff",
      padding: 10, borderRadius: 8,
      boxShadow: "0 2px 12px rgba(107,58,42,0.1)",
    }}>
      {pattern.map((filled, i) => (
        <div key={i} style={{
          width: 8, height: 8,
          background: filled || finderPositions.has(i) ? "#3D1F15" : "#fff",
          borderRadius: 1,
        }} />
      ))}
    </div>
  );
}

function formatDeadline(raw: string) {
  return new Date(raw).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function daysUntil(raw: string) {
  return Math.ceil((new Date(raw).getTime() - Date.now()) / 86400000);
}

export default function ReservationModal({
  bookTitle, reservationId, pickupDeadline, onClose,
}: ReservationModalProps) {
  const days = daysUntil(pickupDeadline);
  const qrValue = `BOOKBLOOM-RES-${reservationId}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Lato:wght@300;400;700&display=swap');
        @keyframes modalIn { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(61,31,21,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }}
      >
        {/* Card */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#FDF5EE", borderRadius: 22,
            padding: "36px 32px", maxWidth: 480, width: "100%",
            boxShadow: "0 24px 70px rgba(107,58,42,0.25)",
            animation: "modalIn .3s ease",
            textAlign: "center",
          }}
        >
          {/* Success icon */}
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>

          <h2 style={{
            fontFamily: "'Playfair Display',serif", fontStyle: "italic",
            fontSize: 24, fontWeight: 700, color: "#3D1F15", margin: "0 0 8px",
          }}>
            Book Reserved!
          </h2>

          <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 15, color: "#8B5E52", margin: "0 0 24px" }}>
            "{bookTitle}"
          </p>

          {/* Deadline warning */}
          <div style={{
            background: days <= 1 ? "#FAD0CC" : "#FFF0E8",
            border: `1.5px solid ${days <= 1 ? "#F0A090" : "#F0DDD4"}`,
            borderRadius: 12, padding: "14px 20px", marginBottom: 24,
          }}>
            <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 13, fontWeight: 700, color: days <= 1 ? "#9B2418" : "#6B3A2A", margin: 0 }}>
              📅 Collect by: {formatDeadline(pickupDeadline)}
            </p>
            <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, color: "#8B5E52", margin: "4px 0 0" }}>
              {days <= 0
                ? "⚠️ Deadline passed — reservation may be cancelled"
                : `You have ${days} day${days !== 1 ? "s" : ""} to collect your book`}
            </p>
          </div>

          {/* QR Code */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, color: "#A07060", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>
              Show this at the library counter
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <QRCode value={qrValue} />
            </div>
            <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 10, color: "#B08070", marginTop: 8, letterSpacing: 1 }}>
              {qrValue}
            </p>
          </div>

          {/* Pickup info */}
          <div style={{
            background: "#FFFAF7", border: "1px solid #F0DDD4",
            borderRadius: 10, padding: "12px 18px", marginBottom: 24, textAlign: "left",
          }}>
            {[
              { icon: "📍", label: "Pickup Location", value: "Justice Shahabuddin Ahmed Park Library" },
              { icon: "🕐", label: "Counter Hours",   value: "9:00 AM – 7:00 PM, Mon–Sat" },
              { icon: "📋", label: "Bring",           value: "This QR code + your Library ID" },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
                <div>
                  <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 10, fontWeight: 700, color: "#C4836A", margin: 0, letterSpacing: 0.3, textTransform: "uppercase" }}>{label}</p>
                  <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, color: "#6B3A2A", margin: "2px 0 0" }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              width: "100%", padding: "12px 0",
              background: "linear-gradient(135deg,#C4836A,#A5624C)",
              color: "#FFF8F0", border: "none", borderRadius: 999,
              fontFamily: "'Playfair Display',serif", fontStyle: "italic",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(165,98,76,0.3)",
            }}
          >
            Got it, I'll collect soon!
          </button>
        </div>
      </div>
    </>
  );
}