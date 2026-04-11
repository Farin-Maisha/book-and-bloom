import { useState } from "react";

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const SvgBookOpen = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4836A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const SvgPen = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7BA077" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const SvgMic = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4A050" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const SvgUsers = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C07070" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SvgSearch = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8070A0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SvgGlobe = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7BA077" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const SvgCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle" }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const SvgClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle" }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const SvgMapPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle" }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SvgCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Icon map by event id ──────────────────────────────────────────────────────
const EVENT_ICONS: Record<number, React.ReactNode> = {
  1: <SvgBookOpen />,
  2: <SvgPen />,
  3: <SvgMic />,
  4: <SvgUsers />,
  5: <SvgSearch />,
  6: <SvgGlobe />,
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface Event {
  id: number;
  title: string;
  description: string;
  date: string;       // "YYYY-MM-DD"
  time: string;       // "10:00 AM"
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
    description: "Join us for a cozy discussion of Matt Haig's heartwarming novel about second chances and infinite possibilities.",
    date: "2026-04-15", time: "6:00 PM", location: "Reading Room B",
    tag: "Book Club", tagColor: "#C8B8E8", seats: 20, seatsLeft: 7,
  },
  {
    id: 2,
    title: "Creative Writing Workshop",
    description: "A hands-on workshop for aspiring writers. Bring a notebook and leave with the first page of your story.",
    date: "2026-04-20", time: "3:00 PM", location: "Workshop Hall",
    tag: "Workshop", tagColor: "#B8D8B8", seats: 15, seatsLeft: 3,
  },
  {
    id: 3,
    title: "Author Talk: Vaishnavi Patel",
    description: "Meet the author of Kaikeyi as she discusses mythology, feminism, and the craft of retelling ancient stories.",
    date: "2026-04-28", time: "5:30 PM", location: "Main Hall",
    tag: "Author Talk", tagColor: "#F0D8A8", seats: 50, seatsLeft: 22,
  },
  {
    id: 4,
    title: "Children's Story Hour",
    description: "A magical reading session for children aged 5-10. Stories, songs, and a craft activity included!",
    date: "2026-05-03", time: "11:00 AM", location: "Children's Corner",
    tag: "Kids", tagColor: "#FAC8C8", seats: 30, seatsLeft: 18,
  },
  {
    id: 5,
    title: "Mystery Night: Guess the Ending",
    description: "Read the first half of a mystery novel and guess the ending before the librarian reveals all!",
    date: "2026-05-10", time: "7:00 PM", location: "Reading Room A",
    tag: "Book Club", tagColor: "#C8B8E8", seats: 25, seatsLeft: 14,
  },
  {
    id: 6,
    title: "Travel Writing Seminar",
    description: "Learn to capture your adventures in words. For travel lovers and writers at all levels.",
    date: "2026-05-17", time: "2:00 PM", location: "Workshop Hall",
    tag: "Workshop", tagColor: "#B8D8B8", seats: 20, seatsLeft: 11,
  },
];

// ── Format date ───────────────────────────────────────────────────────────────
function fmtDate(raw: string) {
  const d = new Date(raw);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function daysUntil(raw: string) {
  const diff = new Date(raw).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

// ── EventCard ─────────────────────────────────────────────────────────────────
function EventCard({ event, onRegister }: { event: Event; onRegister: (e: Event) => void }) {
  const [hovered, setHovered] = useState(false);
  const full     = event.seatsLeft === 0;
  const urgent   = event.seatsLeft <= 5 && !full;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#FFFAF7", borderRadius: 18,
        border: `1.5px solid ${hovered ? "#C4836A" : "#F0DDD4"}`,
        padding: "28px", display: "flex", flexDirection: "column", gap: 14,
        boxShadow: hovered ? "0 12px 40px rgba(107,58,42,0.14)" : "0 2px 12px rgba(107,58,42,0.06)",
        transition: "all .28s ease",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <span style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 12, background: "#FFF0E8" }}>
          {EVENT_ICONS[event.id] || <SvgBookOpen />}
        </span>
        <div style={{ flex: 1 }}>
          {/* Tag pill */}
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
            background: event.tagColor + "55", color: "#5A3A2A",
            padding: "3px 10px", borderRadius: 999,
            fontFamily: "'Lato',sans-serif", textTransform: "uppercase",
          }}>
            {event.tag}
          </span>
          {/* Title */}
          <h3 style={{
            fontFamily: "'Playfair Display',serif", fontStyle: "italic",
            fontSize: 17, fontWeight: 600, color: "#3D1F15",
            margin: "6px 0 0", lineHeight: 1.3,
          }}>
            {event.title}
          </h3>
        </div>
        {/* Days until badge */}
        <span style={{
          fontSize: 10, fontWeight: 700, background: "#FFF0E8",
          color: "#C4836A", border: "1px solid #F0DDD4",
          padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap",
          fontFamily: "'Lato',sans-serif",
        }}>
          {daysUntil(event.date)}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 13, color: "#7A5040", lineHeight: 1.7, margin: 0 }}>
        {event.description}
      </p>

      {/* Meta info */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {[
          { icon: <SvgCalendar />, text: fmtDate(event.date) },
          { icon: <SvgClock />, text: event.time },
          { icon: <SvgMapPin />, text: event.location },
        ].map(({ icon, text }) => (
          <span key={text} style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, color: "#8B5E52", display: "flex", alignItems: "center", gap: 5 }}>
            {icon} {text}
          </span>
        ))}
      </div>

      {/* Seats + Register */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <div>
          {/* Seat bar */}
          <div style={{ width: 120, height: 5, background: "#F0DDD4", borderRadius: 999, overflow: "hidden", marginBottom: 4 }}>
            <div style={{
              height: "100%",
              width: `${(event.seatsLeft / event.seats) * 100}%`,
              background: full ? "#D9BFB5" : urgent ? "#E8A080" : "#C4836A",
              borderRadius: 999, transition: "width .4s ease",
            }} />
          </div>
          <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, color: full ? "#A07060" : urgent ? "#C04030" : "#8B5E52", fontWeight: urgent ? 700 : 400 }}>
            {full ? "Fully booked" : `${event.seatsLeft} of ${event.seats} seats left`}
            {urgent && !full ? " — Almost full!" : ""}
          </span>
        </div>

        <button
          onClick={() => !full && onRegister(event)}
          disabled={full}
          style={{
            padding: "9px 22px", borderRadius: 999, border: "none",
            background: full ? "#D9BFB5" : "linear-gradient(135deg,#C4836A,#A5624C)",
            color: "#FFF8F0", fontFamily: "'Lato',sans-serif",
            fontSize: 12, fontWeight: 700, cursor: full ? "not-allowed" : "pointer",
            boxShadow: full ? "none" : "0 4px 14px rgba(165,98,76,0.3)",
            transition: "opacity .2s",
            opacity: hovered && !full ? 0.9 : 1,
          }}
        >
          {full ? "Full" : "Register \u2192"}
        </button>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
      background: "#6B3A2A", color: "#FFF8F0", padding: "12px 28px",
      borderRadius: 999, fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 14,
      boxShadow: "0 8px 40px rgba(107,58,42,0.3)", zIndex: 9999,
      animation: "fadeUp .3s ease", whiteSpace: "nowrap",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <SvgCheck />
      {msg}
      <button onClick={onClose} style={{ marginLeft: 14, background: "none", border: "none", color: "#FFF8F0", cursor: "pointer", fontSize: 18 }}>\u00d7</button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Events() {
  const [filter, setFilter]   = useState<string>("All");
  const [toast, setToast]     = useState<string | null>(null);
  const [registered, setRegistered] = useState<number[]>([]);

  const tags = ["All", ...Array.from(new Set(EVENTS.map((e) => e.tag)))];

  const filtered = filter === "All" ? EVENTS : EVENTS.filter((e) => e.tag === filter);

  const handleRegister = (event: Event) => {
    if (registered.includes(event.id)) return;
    setRegistered((prev) => [...prev, event.id]);
    setToast(`You're registered for "${event.title}"!`);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Lato:wght@300;400;700&display=swap');
        @keyframes fadeUp    { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes fadeInUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatOrb  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
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
        fontFamily: "'Lato',sans-serif",
        padding: "52px 24px 100px",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: 4, color: "#C4836A", textTransform: "uppercase", marginBottom: 10, opacity: 0.8 }}>
            Community
          </p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 44, fontWeight: 600, color: "#3D1F15", margin: 0 }}>
            Upcoming Events
          </h1>
          <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", color: "#A07060", fontSize: 16, marginTop: 10 }}>
            Gather, read, and grow together.
          </p>
          <div style={{ margin: "18px auto 0", width: 60, height: 2, background: "linear-gradient(90deg,transparent,#C4836A,transparent)", borderRadius: 2 }} />
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
          {tags.map((tag) => (
            <button
              key={tag}
              className="tag-pill"
              onClick={() => setFilter(tag)}
              style={{
                padding: "8px 20px", borderRadius: 999, cursor: "pointer",
                border: `1.5px solid ${filter === tag ? "#C4836A" : "#E5C9BB"}`,
                background: filter === tag ? "linear-gradient(135deg,#C4836A,#A5624C)" : "rgba(255,250,247,0.85)",
                color: filter === tag ? "#FFF8F0" : "#6B3A2A",
                fontFamily: "'Lato',sans-serif", fontSize: 12, fontWeight: filter === tag ? 700 : 400,
                transition: "all .2s",
                boxShadow: filter === tag ? "0 4px 14px rgba(165,98,76,0.25)" : "none",
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Events grid */}
        <div style={{
          maxWidth: 980, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: 24,
        }}>
          {filtered.map((event, i) => (
            <div key={event.id} className="event-appear" style={{ animationDelay: `${i * 0.07}s` }}>
              <EventCard
                event={registered.includes(event.id) ? { ...event, seatsLeft: Math.max(0, event.seatsLeft - 1) } : event}
                onRegister={handleRegister}
              />
            </div>
          ))}
        </div>
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}