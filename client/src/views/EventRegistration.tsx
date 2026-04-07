// EventRegistration.tsx
// Route: /events/:id/register
// Backend endpoint: POST /api/events/:id/register
// Body: { name, mobile, email, note }
// Response: { registration: { id, event_id, user_id, name, mobile, status, created_at } }

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiClient from "../api";

const api = new ApiClient();

// ── Types ─────────────────────────────────────────────────────────────────────
interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  tag: string;
  seats: number;
  seatsLeft: number;
}

interface RegistrationForm {
  name: string;
  mobile: string;
  email: string;
  note: string;
}

// ── Field component ───────────────────────────────────────────────────────────
function Field({
  label, name, type = "text", placeholder, value, onChange, required = false,
}: {
  label: string; name: string; type?: string; placeholder?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: "block", marginBottom: 6,
        fontFamily: "'Lato', sans-serif", fontSize: 11,
        fontWeight: 700, letterSpacing: 0.8,
        color: "#6B3A2A", textTransform: "uppercase",
      }}>
        {label}{required && <span style={{ color: "#C4836A", marginLeft: 3 }}>*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={3}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "12px 16px",
            border: "1.5px solid #E5C9BB",
            borderRadius: 10,
            fontFamily: "'Lato', sans-serif", fontSize: 13,
            color: "#3D1F15", background: "#FFFAF7",
            resize: "vertical", outline: "none",
            transition: "border-color .2s",
          }}
          onFocus={(e) => { e.target.style.borderColor = "#C4836A"; }}
          onBlur={(e) => { e.target.style.borderColor = "#E5C9BB"; }}
        />
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "12px 16px",
            border: "1.5px solid #E5C9BB",
            borderRadius: 10,
            fontFamily: "'Lato', sans-serif", fontSize: 13,
            color: "#3D1F15", background: "#FFFAF7",
            outline: "none", transition: "border-color .2s",
          }}
          onFocus={(e) => { e.target.style.borderColor = "#C4836A"; }}
          onBlur={(e) => { e.target.style.borderColor = "#E5C9BB"; }}
        />
      )}
    </div>
  );
}

// ── Success state ─────────────────────────────────────────────────────────────
function SuccessPanel({
  event, registrationId, onBack,
}: {
  event: Event; registrationId: number; onBack: () => void;
}) {
  return (
    <div style={{
      background: "#FFFAF7", borderRadius: 20,
      border: "1px solid #F0DDD4",
      boxShadow: "0 8px 40px rgba(107,58,42,0.10)",
      padding: "48px 40px",
      textAlign: "center",
      maxWidth: 520, margin: "0 auto",
      animation: "fadeInUp .45s ease both",
    }}>
      {/* Confirmation indicator */}
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "#E8F5E8", border: "2px solid #C8E6C8",
        margin: "0 auto 24px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 28 }}>✓</span>
      </div>

      <p style={{
        fontFamily: "'Lato', sans-serif", fontSize: 11,
        letterSpacing: 3, color: "#C4836A",
        textTransform: "uppercase", marginBottom: 10,
      }}>
        Registration Confirmed
      </p>

      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 26, fontWeight: 700,
        color: "#3D1F15", margin: "0 0 8px",
      }}>
        {event.title}
      </h2>

      <p style={{
        fontFamily: "'Lato', sans-serif", fontSize: 13,
        color: "#8B5E52", marginBottom: 28,
      }}>
        You have been successfully registered.
      </p>

      {/* Details */}
      <div style={{
        background: "#FDF5EE",
        border: "1px solid #F0DDD4",
        borderRadius: 12, padding: "20px 24px",
        marginBottom: 28, textAlign: "left",
      }}>
        <p style={{
          fontFamily: "'Lato', sans-serif", fontSize: 11,
          fontWeight: 700, color: "#C4836A",
          textTransform: "uppercase", letterSpacing: 0.5,
          marginBottom: 14,
        }}>
          Event Details
        </p>
        {[
          { label: "Registration ID", value: `#${registrationId}` },
          { label: "Date",            value: new Date(event.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
          { label: "Time",            value: event.time },
          { label: "Location",        value: event.location },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #F0DDD4" }}>
            <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: "#8B5E52" }}>{label}</span>
            <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: "#3D1F15", fontWeight: 700, textAlign: "right", maxWidth: "60%" }}>{value}</span>
          </div>
        ))}
        <p style={{
          fontFamily: "'Lato', sans-serif", fontSize: 11,
          color: "#A07060", margin: 0, fontStyle: "italic",
        }}>
          A confirmation has been saved to your library account.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={onBack}
          style={{
            flex: 1, padding: "12px 0",
            background: "linear-gradient(135deg, #C4836A, #A5624C)",
            color: "#FFF8F0", border: "none", borderRadius: 999,
            fontFamily: "'Lato', sans-serif", fontWeight: 700,
            fontSize: 13, cursor: "pointer",
          }}
        >
          Back to Events
        </button>
        <button
          onClick={() => window.location.href = "/my-library"}
          style={{
            flex: 1, padding: "12px 0",
            background: "transparent",
            color: "#C4836A",
            border: "1.5px solid #C4836A",
            borderRadius: 999,
            fontFamily: "'Lato', sans-serif", fontWeight: 700,
            fontSize: 13, cursor: "pointer",
          }}
        >
          View My Library
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function EventRegistration() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const [event, setEvent]       = useState<Event | null>(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [registrationId, setRegistrationId] = useState<number | null>(null);

  const [form, setForm] = useState<RegistrationForm>({
    name: "", mobile: "", email: "", note: "",
  });

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch event details
    // Backend: GET /api/events/:id
    api.getEvent(Number(id))
      .then((data) => {
        if (data?.event) setEvent(data.event);
        else setError("Event not found.");
      })
      .catch(() => setError("Could not load event details."))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Full name is required."); return; }
    if (!form.mobile.trim() || !/^\d{10,15}$/.test(form.mobile.replace(/\s/g, ""))) {
      setError("Please enter a valid mobile number (10–15 digits)."); return;
    }
    setError(null);
    setSubmitting(true);

    // Backend: POST /api/events/:id/register
    // Body: { name, mobile, email, note }
    // Response: { registration: { id, event_id, user_id, name, mobile, status: "confirmed", created_at } }
    const result = await api.registerForEvent(Number(id), {
      name:   form.name.trim(),
      mobile: form.mobile.trim(),
      email:  form.email.trim(),
      note:   form.note.trim(),
    });

    if (result?.registration) {
      setRegistrationId(result.registration.id);
    } else {
      setError("Registration failed. You may already be registered, or the event is full.");
    }
    setSubmitting(false);
  };

  // ── States ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#FDF5EE 0%,#F7EDE3 60%,#F0E4D7 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: "#C4836A" }}>Loading event…</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .reg-appear { animation: fadeInUp .45s ease both; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#FDF5EE 0%,#F9EEE4 40%,#F4E6D8 100%)",
        fontFamily: "'Lato', sans-serif",
        padding: "52px 24px 100px",
      }}>

        {/* Back */}
        <button
          onClick={() => navigate("/events")}
          style={{
            background: "none", border: "none",
            cursor: "pointer", color: "#8B5E52",
            fontFamily: "'Lato', sans-serif", fontSize: 13,
            marginBottom: 32, display: "flex",
            alignItems: "center", gap: 6,
            maxWidth: 600, margin: "0 auto 32px",
          }}
        >
          ← Back to Events
        </button>

        {/* Success state */}
        {registrationId && event ? (
          <div className="reg-appear">
            <SuccessPanel
              event={event}
              registrationId={registrationId}
              onBack={() => navigate("/events")}
            />
          </div>
        ) : (
          <div
            className="reg-appear"
            style={{
              maxWidth: 600, margin: "0 auto",
              background: "#FFFAF7",
              borderRadius: 20,
              border: "1px solid #F0DDD4",
              boxShadow: "0 8px 40px rgba(107,58,42,0.10)",
              overflow: "hidden",
            }}
          >
            {/* Event summary header */}
            {event && (
              <div style={{
                background: "#F5E6DC",
                padding: "24px 32px",
                borderBottom: "1px solid #F0DDD4",
              }}>
                <p style={{
                  fontFamily: "'Lato', sans-serif", fontSize: 10,
                  letterSpacing: 3, color: "#C4836A",
                  textTransform: "uppercase", marginBottom: 6,
                }}>
                  {event.tag}
                </p>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 22, fontWeight: 700,
                  color: "#3D1F15", margin: "0 0 10px",
                }}>
                  {event.title}
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                  {[
                    { label: new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
                    { label: event.time },
                    { label: event.location },
                  ].map(({ label }, i) => (
                    <span key={i} style={{
                      fontFamily: "'Lato', sans-serif",
                      fontSize: 12, color: "#8B5E52",
                    }}>
                      {label}
                    </span>
                  ))}
                </div>
                <p style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 12, color: "#A07060",
                  marginTop: 8,
                }}>
                  {event.seatsLeft} of {event.seats} seats remaining
                </p>
              </div>
            )}

            {/* Form */}
            <div style={{ padding: "32px" }}>
              <p style={{
                fontFamily: "'Lato', sans-serif", fontSize: 11,
                letterSpacing: 3, color: "#C4836A",
                textTransform: "uppercase", marginBottom: 6,
              }}>
                Registration Form
              </p>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20, fontWeight: 700,
                color: "#3D1F15", margin: "0 0 24px",
              }}>
                Your Details
              </h3>

              <Field
                label="Full Name"   name="name"
                placeholder="e.g. Rahim Uddin"
                value={form.name} onChange={handleChange} required
              />
              <Field
                label="Mobile Number" name="mobile" type="tel"
                placeholder="e.g. 01712345678"
                value={form.mobile} onChange={handleChange} required
              />
              <Field
                label="Email Address" name="email" type="email"
                placeholder="e.g. rahim@email.com (optional)"
                value={form.email} onChange={handleChange}
              />
              <Field
                label="Special Note" name="note" type="textarea"
                placeholder="Any accessibility requirements or notes (optional)"
                value={form.note} onChange={handleChange}
              />

              {/* Error */}
              {error && (
                <div style={{
                  background: "#FAD0CC",
                  border: "1px solid #F0A090",
                  borderRadius: 8, padding: "10px 16px",
                  marginBottom: 16,
                }}>
                  <p style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: 13, color: "#9B2418", margin: 0,
                  }}>
                    {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    flex: 2, padding: "13px 0",
                    background: submitting ? "#D9BFB5" : "linear-gradient(135deg,#C4836A,#A5624C)",
                    color: "#FFF8F0", border: "none", borderRadius: 999,
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700, fontSize: 13, letterSpacing: 0.4,
                    cursor: submitting ? "not-allowed" : "pointer",
                    transition: "opacity .2s",
                  }}
                >
                  {submitting ? "Submitting…" : "Confirm Registration"}
                </button>
                <button
                  onClick={() => navigate("/events")}
                  style={{
                    flex: 1, padding: "13px 0",
                    background: "transparent",
                    color: "#C4836A",
                    border: "1.5px solid #C4836A",
                    borderRadius: 999,
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700, fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>

              <p style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 11, color: "#A07060",
                marginTop: 16, textAlign: "center",
                fontStyle: "italic",
              }}>
                Your registration will be saved to your library account.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}