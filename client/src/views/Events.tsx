// Events.tsx
// Updated: Register button navigates to /events/:id/register
// Removed cliché emojis, formal design maintained

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  tagColor: string;
  seats: number;
  seatsLeft: number;
}

// ── Mock events — replace with api.getEvents() when backend is ready ──────────
const EVENTS: Event[] = [
  {
    id: 1,
    title: "Book Club: The Midnight Library",
    description: "A structured discussion of Matt Haig's novel on second chances and the philosophy of choice.",
    date: "2026-04-15", time: "6:00 PM", location: "Reading Room B",
    tag: "Book Club", tagColor: "#C8B8E8", seats: 20, seatsLeft: 7,
  },
  {
    id: 2,
    title: "Creative Writing Workshop",
    description: "A practical session for developing writers. Bring a notebook — you will leave with the opening of a new story.",
    date: "2026-04-20", time: "3:00 PM", location: "Workshop Hall",
    tag: "Workshop", tagColor: "#B8D8B8", seats: 15, seatsLeft: 3,
  },
  {
    id: 3,
    title: "Author Talk: Vaishnavi Patel",
    description: "The author of Kaikeyi discusses mythology, feminism, and the craft of retelling ancient narratives.",
    date: "2026-04-28", time: "5:30 PM", location: "Main Hall",
    tag: "Author Talk", tagColor: "#F0D8A8", seats: 50, seatsLeft: 22,
  },
  {
    id: 4,
    title: "Children's Story Hour",
    description: "A structured reading session for children aged 5–10, with a craft activity included.",
    date: "2026-05-03", time: "11:00 AM", location: "Children's Corner",
    tag: "Children", tagColor: "#FAC8C8", seats: 30, seatsLeft: 18,
  },
  {
    id: 5,
    title: "Mystery Night: Guess the Ending",
    description: "Read the first half of a mystery novel, then submit your theory before the librarian reveals the conclusion.",
    date: "2026-05-10", time: "7:00 PM", location: "Reading Room A",
    tag: "Book Club", tagColor: "#C8B8E8", seats: 25, seatsLeft: 14,
  },
  {
    id: 6,
    title: "Travel Writing Seminar",
    description: "An introductory seminar on documenting travel through prose. Open to all levels.",
    date: "2026-05-17", time: "2:00 PM", location: "Workshop Hall",
    tag: "Workshop", tagColor: "#B8D8B8", seats: 20, seatsLeft: 11,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(raw: string) {
  return new Date(raw).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function daysUntil(raw: string) {
  const diff  = new Date(raw).getTime() - Date.now();
  const days  = Math.ceil(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

// ── EventCard ─────────────────────────────────────────────────────────────────
function EventCard({
  event, isRegistered, onRegister,
}: {
  event: Event; isRegistered: boolean; onRegister: (e: Event) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const full   = event.seatsLeft === 0;
  const urgent = event.seatsLeft <= 5 && !full;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#FFFAF7", borderRadius: 18,
        border: `1.5px solid ${hovered ? "#C4836A" : "#F0DDD4"}`,
        padding: "28px", display: "flex", flexDirection: "column", gap: 14,
        boxShadow: hovered
          ? "0 12px 40px rgba(107,58,42,0.14)"
          : "0 2px 12px rgba(107,58,42,0.06)",
        transition: "all .28s ease",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ flex: 1 }}>
          {/* Tag pill */}
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
            background: event.tagColor + "55", color: "#5A3A2A",
            padding: "3px 10px", borderRadius: 999,
            fontFamily: "'Lato', sans-serif", textTransform: "uppercase",
          }}>
            {event.tag}
          </span>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 17, fontWeight: 600, color: "#3D1F15",
            margin: "8px 0 0", lineHeight: 1.3,
          }}>
            {event.title}
          </h3>
        </div>

        {/* Days until badge */}
        <span style={{
          fontSize: 10, fontWeight: 700, background: "#FFF0E8",
          color: "#C4836A", border: "1px solid #F0DDD4",
          padding: "4px 10px", borderRadius: 999,
          whiteSpace: "nowrap", fontFamily: "'Lato', sans-serif",
        }}>
          {daysUntil(event.date)}
        </span>
      </div>

      {/* Description */}
      <p style={{
        fontFamily: "'Lato', sans-serif", fontSize: 13,
        color: "#7A5040", lineHeight: 1.7, margin: 0,
      }}>
        {event.description}
      </p>

      {/* Meta */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {[
          { label: fmtDate(event.date) },
          { label: event.time },
          { label: event.location },
        ].map(({ label }) => (
          <span key={label} style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: 12, color: "#8B5E52",
          }}>
            {label}
          </span>
        ))}
      </div>

      {/* Seats + Register */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{
            width: 120, height: 4, background: "#F0DDD4",
            borderRadius: 999, overflow: "hidden", marginBottom: 6,
          }}>
            <div style={{
              height: "100%",
              width: `${(event.seatsLeft / event.seats) * 100}%`,
              background: full ? "#D9BFB5" : urgent ? "#E8A080" : "#C4836A",
              borderRadius: 999, transition: "width .4s ease",
            }} />
          </div>
          <span style={{
            fontFamily: "'Lato', sans-serif", fontSize: 11,
            color: full ? "#A07060" : urgent ? "#C04030" : "#8B5E52",
            fontWeight: urgent ? 700 : 400,
          }}>
            {full ? "No seats available" : `${event.seatsLeft} of ${event.seats} seats remaining`}
            {urgent && !full ? " — Limited availability" : ""}
          </span>
        </div>

        <button
          onClick={() => !full && onRegister(event)}
          disabled={full}
          style={{
            padding: "10px 24px", borderRadius: 999, border: "none",
            background: full
              ? "#D9BFB5"
              : isRegistered
                ? "#3D1F15"
                : "linear-gradient(135deg,#C4836A,#A5624C)",
            color: "#FFF8F0",
            fontFamily: "'Lato', sans-serif",
            fontSize: 12, fontWeight: 700, letterSpacing: 0.4,
            cursor: full ? "not-allowed" : "pointer",
            boxShadow: full ? "none" : "0 4px 14px rgba(165,98,76,0.3)",
            transition: "opacity .2s",
          }}
        >
          {full ? "Fully Booked" : isRegistered ? "Registered" : "Register"}
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Events() {
  const navigate = useNavigate();
  const [filter, setFilter]   = useState<string>("All");
  const [events, setEvents]   = useState<Event[]>(EVENTS);
  const [loading, setLoading] = useState(true);

  // Track locally registered IDs (also persisted in My Library via backend)
  const [registered, setRegistered] = useState<number[]>([]);

  useEffect(() => {
    api.getEvents()
      .then((data) => { if (data?.events?.length) setEvents(data.events); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tags     = ["All", ...Array.from(new Set(events.map((e) => e.tag)))];
  const filtered = filter === "All" ? events : events.filter((e) => e.tag === filter);

  const handleRegister = (event: Event) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    // Navigate to dedicated registration page
    navigate(`/events/${event.id}/register`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Lato:wght@300;400;700&display=swap');
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatOrb { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        .event-appear { animation: fadeInUp .45s ease both; }
        .tag-pill:hover { border-color: #C4836A !important; color: #C4836A !important; }
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "8%", left: "3%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(196,131,106,0.08) 0%,transparent 70%)", animation: "floatOrb 10s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "4%", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(200,184,232,0.08) 0%,transparent 70%)", animation: "floatOrb 14s ease-in-out infinite 3s" }} />
      </div>

      <div style={{
        position: "relative", zIndex: 1,
        minHeight: "100vh",
        background: "linear-gradient(160deg,#FDF5EE 0%,#F9EEE4 40%,#F4E6D8 100%)",
        fontFamily: "'Lato', sans-serif",
        padding: "52px 24px 100px",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{
            fontSize: 11, letterSpacing: 4, color: "#C4836A",
            textTransform: "uppercase", marginBottom: 10, opacity: 0.8,
          }}>
            Community
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic", fontSize: 44, fontWeight: 600,
            color: "#3D1F15", margin: 0,
          }}>
            Upcoming Events
          </h1>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic", color: "#A07060",
            fontSize: 16, marginTop: 10,
          }}>
            Gather, read, and grow together.
          </p>
          <div style={{
            margin: "18px auto 0", width: 60, height: 2,
            background: "linear-gradient(90deg,transparent,#C4836A,transparent)",
            borderRadius: 2,
          }} />
        </div>

        {/* Filter pills */}
        <div style={{
          display: "flex", gap: 8, justifyContent: "center",
          flexWrap: "wrap", marginBottom: 40,
        }}>
          {tags.map((tag) => (
            <button
              key={tag}
              className="tag-pill"
              onClick={() => setFilter(tag)}
              style={{
                padding: "8px 20px", borderRadius: 999, cursor: "pointer",
                border: `1.5px solid ${filter === tag ? "#C4836A" : "#E5C9BB"}`,
                background: filter === tag
                  ? "linear-gradient(135deg,#C4836A,#A5624C)"
                  : "rgba(255,250,247,0.85)",
                color: filter === tag ? "#FFF8F0" : "#6B3A2A",
                fontFamily: "'Lato', sans-serif",
                fontSize: 12, fontWeight: filter === tag ? 700 : 400,
                transition: "all .2s",
                boxShadow: filter === tag ? "0 4px 14px rgba(165,98,76,0.25)" : "none",
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <p style={{
            textAlign: "center", color: "#C4836A",
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic", fontSize: 17, marginTop: 40,
          }}>
            Loading events…
          </p>
        )}

        {/* Events grid */}
        {!loading && (
          <div style={{
            maxWidth: 980, margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
            gap: 24,
          }}>
            {filtered.map((event, i) => (
              <div
                key={event.id}
                className="event-appear"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <EventCard
                  event={event}
                  isRegistered={registered.includes(event.id)}
                  onRegister={handleRegister}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p style={{
            textAlign: "center", color: "#A07060",
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic", fontSize: 18, marginTop: 60,
          }}>
            No events found for this category.
          </p>
        )}
      </div>
    </>
  );
}