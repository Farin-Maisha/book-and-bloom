// MyLibrary.tsx
// Updated: Added "Events" tab for event registrations, removed cliché emojis,
// formal status badges, backend-ready.

import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import ApiClient               from "../api";
import ReservationModal        from "../ReservationModal";

const api      = new ApiClient();
const PER_PAGE = 5;

// ── Types ──────────────────────────────────────────────────────────────────────
interface BorrowedBook {
  id:               number;
  book:             { id: number; title: string; cover_image: string };
  issue_date:       string;
  due_date:         string;
  return_date:      string | null;
  pickup_deadline?: string;
  status:           "reserved" | "issued" | "borrowed" | "returned" | "overdue";
}

// Backend: GET /api/my-event-registrations
// Response: { registrations: [{ id, event: { id, title, date, time, location, tag }, status, created_at }] }
interface EventRegistration {
  id:         number;
  event:      { id: number; title: string; date: string; time: string; location: string; tag: string };
  status:     "confirmed" | "pending" | "cancelled";
  created_at: string;
}

// ── Membership config ─────────────────────────────────────────────────────────
const TIERS = [
  { name: "Silver",   min: 0,  max: 4,  color: "#A8B0B8", bg: "#F0F2F4", border: "#C8CDD2", glow: "rgba(168,176,184,0.3)" },
  { name: "Gold",     min: 5,  max: 14, color: "#C8A020", bg: "#FDF8E8", border: "#E8D070", glow: "rgba(200,160,32,0.25)" },
  { name: "Platinum", min: 15, max: Infinity, color: "#7060C0", bg: "#F4F0FC", border: "#B0A0E0", glow: "rgba(112,96,192,0.25)" },
];

function getTier(total: number) {
  return TIERS.find((t) => total >= t.min && total <= t.max) ?? TIERS[0];
}
function getNextTier(total: number) {
  const idx = TIERS.findIndex((t) => total >= t.min && total <= t.max);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

function formatDate(raw: string) {
  return new Date(raw).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function daysLeft(dueDate: string) {
  const diff = new Date(dueDate).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0)   return { label: `${Math.abs(days)}d overdue`, color: "#C04030" };
  if (days === 0) return { label: "Due today",                  color: "#E07020" };
  if (days <= 3)  return { label: `${days}d left`,              color: "#E07020" };
  return            { label: `${days}d left`,                   color: "#6B9060" };
}

// ── Status badge — text only, no emojis ───────────────────────────────────────
function StatusBadge({ status }: { status: BorrowedBook["status"] }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    reserved: { bg: "#EEE8FC", color: "#6040B0", label: "Reserved"  },
    issued:   { bg: "#E8F0FC", color: "#2050A0", label: "Issued"    },
    returned: { bg: "#D4F0D8", color: "#2E7D32", label: "Returned"  },
    borrowed: { bg: "#FAE0D8", color: "#B24E35", label: "Active"    },
    overdue:  { bg: "#FAD0CC", color: "#9B2418", label: "Overdue"   },
  };
  const s = map[status] ?? map.borrowed;
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "4px 14px", borderRadius: 999,
      fontSize: 11, fontWeight: 700,
      fontFamily: "'Lato', sans-serif", letterSpacing: 0.3,
    }}>
      {s.label}
    </span>
  );
}

function EventStatusBadge({ status }: { status: EventRegistration["status"] }) {
  const map = {
    confirmed:  { bg: "#D4F0D8", color: "#2E7D32", label: "Confirmed"  },
    pending:    { bg: "#FAE0D8", color: "#B24E35", label: "Pending"    },
    cancelled:  { bg: "#FAD0CC", color: "#9B2418", label: "Cancelled"  },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "4px 14px", borderRadius: 999,
      fontSize: 11, fontWeight: 700,
      fontFamily: "'Lato', sans-serif", letterSpacing: 0.3,
    }}>
      {s.label}
    </span>
  );
}

// ── Membership card ───────────────────────────────────────────────────────────
function MembershipCard({ borrows }: { borrows: BorrowedBook[] }) {
  const total    = borrows.length;
  const returned = borrows.filter((b) => b.status === "returned").length;
  const reserved = borrows.filter((b) => b.status === "reserved").length;
  const issued   = borrows.filter((b) => b.status === "issued").length;
  const overdue  = borrows.filter((b) => b.status === "overdue").length;
  const tier     = getTier(total);
  const next     = getNextTier(total);
  const progress = next ? ((total - tier.min) / (next.min - tier.min)) * 100 : 100;

  return (
    <div style={{
      background: tier.bg,
      border: `2px solid ${tier.border}`,
      borderRadius: 20, padding: "28px 32px",
      boxShadow: `0 8px 32px ${tier.glow}`,
      marginBottom: 32,
      display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center",
    }}>
      {/* Tier badge — text-based, no emoji */}
      <div style={{ textAlign: "center", minWidth: 90 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: tier.color + "22",
          border: `2px solid ${tier.color}`,
          margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 10, fontWeight: 700,
            color: tier.color, letterSpacing: 1,
            textTransform: "uppercase",
          }}>
            {tier.name}
          </span>
        </div>
        <p style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: 11, color: "#8B5E52",
          margin: "8px 0 0",
        }}>
          Member
        </p>
      </div>

      {/* Stats */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic", fontSize: 20,
          fontWeight: 600, color: "#3D1F15",
          margin: "0 0 16px",
        }}>
          Reading Overview
        </p>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "Total",    value: total,    color: "#C4836A" },
            { label: "Reserved", value: reserved, color: "#6040B0" },
            { label: "Issued",   value: issued,   color: "#2050A0" },
            { label: "Returned", value: returned, color: "#2E7D32" },
            { label: "Overdue",  value: overdue,  color: "#9B2418" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: "center", minWidth: 60 }}>
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26, fontWeight: 700, color, margin: 0,
              }}>
                {value}
              </p>
              <p style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 10, color: "#8B5E52",
                margin: "2px 0 0", letterSpacing: 0.3,
              }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Progress */}
        {next ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: "#8B5E52" }}>
                Progress to {next.name}
              </span>
              <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: tier.color, fontWeight: 700 }}>
                {total} / {next.min}
              </span>
            </div>
            <div style={{ height: 6, background: "#E5D5C5", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${Math.min(progress, 100)}%`,
                background: `linear-gradient(90deg, ${tier.color}, ${next.color})`,
                borderRadius: 999, transition: "width .6s ease",
              }} />
            </div>
            <p style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: 10, color: "#A07060", marginTop: 5,
            }}>
              {next.min - total} more book{next.min - total !== 1 ? "s" : ""} to reach {next.name}
            </p>
          </div>
        ) : (
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic", fontSize: 13, color: tier.color,
          }}>
            You have reached the highest membership tier.
          </p>
        )}
      </div>

      {/* Perks */}
      <div style={{
        minWidth: 160,
        background: "rgba(255,255,255,0.6)",
        borderRadius: 12, padding: "14px 18px",
        border: `1px solid ${tier.border}`,
      }}>
        <p style={{
          fontFamily: "'Lato', sans-serif",
          fontSize: 11, fontWeight: 700, color: "#6B3A2A",
          textTransform: "uppercase", letterSpacing: 0.5,
          margin: "0 0 10px",
        }}>
          {tier.name} Perks
        </p>
        {(tier.name === "Silver"
          ? ["Borrow up to 2 books", "7-day loan period", "Email reminders"]
          : tier.name === "Gold"
            ? ["Borrow up to 4 books", "14-day loan period", "Priority reservations", "Early event access"]
            : ["Unlimited borrows", "21-day loan period", "VIP event seating", "Dedicated librarian", "Exclusive reads"]
        ).map((perk) => (
          <p key={perk} style={{
            fontFamily: "'Lato', sans-serif", fontSize: 12,
            color: "#6B3A2A", margin: "5px 0",
            display: "flex", gap: 6, alignItems: "center",
          }}>
            <span style={{ color: tier.color, fontWeight: 700 }}>+</span> {perk}
          </p>
        ))}
      </div>
    </div>
  );
}

// ── Notification banner — shown when reservations are pending pickup ───────────
function ReservationBanner({ borrows }: { borrows: BorrowedBook[] }) {
  const pending = borrows.filter((b) => b.status === "reserved");
  if (pending.length === 0) return null;
  return (
    <div style={{
      background: "#FFF0E8",
      border: "1.5px solid #F0C090",
      borderRadius: 12, padding: "14px 20px",
      marginBottom: 24,
      display: "flex", alignItems: "center",
      justifyContent: "space-between", flexWrap: "wrap", gap: 12,
    }}>
      <div>
        <p style={{
          fontFamily: "'Lato', sans-serif", fontSize: 13,
          fontWeight: 700, color: "#7A4010", margin: 0,
        }}>
          Pending Collection: {pending.length} book{pending.length !== 1 ? "s" : ""}
        </p>
        <p style={{
          fontFamily: "'Lato', sans-serif", fontSize: 12,
          color: "#A06030", margin: "4px 0 0",
        }}>
          Please collect from the library counter within 2 days of reservation to avoid auto-cancellation.
        </p>
      </div>
      <span style={{
        fontFamily: "'Lato', sans-serif", fontSize: 11,
        color: "#C4836A", fontWeight: 700,
        letterSpacing: 0.5, textTransform: "uppercase",
      }}>
        Counter Hours: 9:00 AM – 7:00 PM
      </span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MyLibrary() {
  const navigate = useNavigate();

  const [borrows,       setBorrows]       = useState<BorrowedBook[]>([]);
  const [eventRegs,     setEventRegs]     = useState<EventRegistration[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(1);
  const [returning,     setReturning]     = useState<number | null>(null);
  const [viewingQR,     setViewingQR]     = useState<{
    bookTitle: string; reservationId: number; pickupDeadline: string;
  } | null>(null);

  // Main section: "books" or "events"
  const [section,  setSection]  = useState<"books" | "events">("books");
  const [filter,   setFilter]   = useState<"all" | "reserved" | "issued" | "borrowed" | "returned" | "overdue">("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    Promise.all([
      api.getMyBorrows(),
      api.getMyEventRegistrations(),
    ]).then(([borrowData, eventData]) => {
      if (borrowData) setBorrows(borrowData.borrows || []);
      if (eventData)  setEventRegs(eventData.registrations || []);
    }).finally(() => setLoading(false));
  }, [navigate]);

  const handleReturn = async (borrow: BorrowedBook) => {
    if (borrow.status === "returned") return;
    setReturning(borrow.id);
    const result = await api.returnBook(borrow.id);
    if (result) {
      setBorrows((prev) => prev.map((b) =>
        b.id === borrow.id
          ? { ...b, status: "returned", return_date: new Date().toISOString().split("T")[0] }
          : b
      ));
    }
    setReturning(null);
  };

  const filtered   = filter === "all" ? borrows : borrows.filter((b) => b.status === filter);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const visible    = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const tabCounts = {
    all:      borrows.length,
    reserved: borrows.filter((b) => b.status === "reserved").length,
    issued:   borrows.filter((b) => b.status === "issued").length,
    borrowed: borrows.filter((b) => b.status === "borrowed").length,
    returned: borrows.filter((b) => b.status === "returned").length,
    overdue:  borrows.filter((b) => b.status === "overdue").length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Lato:wght@300;400;700&display=swap');
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatOrb { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        .lib-appear    { animation: fadeInUp .4s ease both; }
        .borrow-row:hover  { background: #FFF0E8 !important; }
        .return-btn:hover:not(:disabled) { background: #A5624C !important; }
        .filter-tab:hover  { border-color: #C4836A !important; color: #C4836A !important; }
      `}</style>

      {/* Ambient orb */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "8%", right: "5%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(196,131,106,0.07) 0%,transparent 70%)", animation: "floatOrb 11s ease-in-out infinite" }} />
      </div>

      <div style={{
        position: "relative", zIndex: 1,
        minHeight: "100vh",
        background: "linear-gradient(160deg,#FDF5EE 0%,#F9EEE4 40%,#F4E6D8 100%)",
        fontFamily: "'Lato', sans-serif",
        padding: "52px 24px 100px",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          {/* Header */}
          <div className="lib-appear" style={{ marginBottom: 32 }}>
            <p style={{
              fontSize: 11, letterSpacing: 4, color: "#C4836A",
              textTransform: "uppercase", marginBottom: 8, opacity: 0.8,
            }}>
              My Account
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic", fontSize: 38, fontWeight: 600,
              color: "#3D1F15", margin: 0,
            }}>
              Your Library
            </h1>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic", color: "#A07060",
              fontSize: 15, marginTop: 8,
            }}>
              Manage your books, reservations, and event registrations.
            </p>
          </div>

          {loading && (
            <p style={{
              textAlign: "center", color: "#C4836A",
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic", fontSize: 18, marginTop: 60,
            }}>
              Loading your library…
            </p>
          )}

          {!loading && (
            <>
              {/* Membership card */}
              <div className="lib-appear" style={{ animationDelay: "0.1s" }}>
                <MembershipCard borrows={borrows} />
              </div>

              {/* Reservation pickup banner */}
              <ReservationBanner borrows={borrows} />

              {/* ── Section tabs: Books | Events ── */}
              <div
                className="lib-appear"
                style={{
                  display: "flex", gap: 0, marginBottom: 24,
                  borderBottom: "2px solid #F0DDD4",
                  animationDelay: "0.12s",
                }}
              >
                {(["books", "events"] as const).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => { setSection(sec); setPage(1); }}
                    style={{
                      padding: "12px 28px",
                      background: "none", border: "none",
                      borderBottom: section === sec
                        ? "2.5px solid #C4836A"
                        : "2.5px solid transparent",
                      marginBottom: -2,
                      fontFamily: "'Lato', sans-serif",
                      fontSize: 13, fontWeight: section === sec ? 700 : 400,
                      color: section === sec ? "#C4836A" : "#8B5E52",
                      cursor: "pointer", transition: "color .2s",
                      letterSpacing: 0.3,
                    }}
                  >
                    {sec === "books"
                      ? `Books (${borrows.length})`
                      : `Event Registrations (${eventRegs.length})`}
                  </button>
                ))}
              </div>

              {/* ── BOOKS SECTION ── */}
              {section === "books" && (
                <>
                  {/* Filter tabs */}
                  <div
                    className="lib-appear"
                    style={{
                      display: "flex", gap: 8,
                      flexWrap: "wrap", marginBottom: 20,
                      animationDelay: "0.15s",
                    }}
                  >
                    {(["all", "reserved", "issued", "borrowed", "returned", "overdue"] as const).map((tab) => (
                      <button
                        key={tab}
                        className="filter-tab"
                        onClick={() => { setFilter(tab); setPage(1); }}
                        style={{
                          padding: "8px 18px", borderRadius: 999, cursor: "pointer",
                          border: `1.5px solid ${filter === tab ? "#C4836A" : "#E5C9BB"}`,
                          background: filter === tab
                            ? "linear-gradient(135deg,#C4836A,#A5624C)"
                            : "rgba(255,250,247,0.9)",
                          color: filter === tab ? "#FFF8F0" : "#6B3A2A",
                          fontFamily: "'Lato', sans-serif",
                          fontSize: 12, fontWeight: filter === tab ? 700 : 400,
                          transition: "all .2s",
                        }}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
                        <span style={{ opacity: 0.75 }}>({tabCounts[tab]})</span>
                      </button>
                    ))}
                  </div>

                  {/* Empty state */}
                  {filtered.length === 0 && (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                      <div style={{
                        width: 60, height: 60, borderRadius: "50%",
                        background: "#F5E6DC", margin: "0 auto 16px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontSize: 24 }}>○</span>
                      </div>
                      <p style={{
                        fontFamily: "'Playfair Display', serif",
                        fontStyle: "italic", fontSize: 20, color: "#3D1F15",
                      }}>
                        {filter === "all" ? "No books in your library yet" : `No ${filter} books`}
                      </p>
                      {filter === "all" && (
                        <a href="/books" style={{
                          color: "#C4836A",
                          fontFamily: "'Lato', sans-serif", fontSize: 13,
                        }}>
                          Browse the collection
                        </a>
                      )}
                    </div>
                  )}

                  {/* Table */}
                  {filtered.length > 0 && (
                    <div className="lib-appear" style={{
                      background: "#FFFAF7", borderRadius: 16,
                      boxShadow: "0 4px 24px rgba(107,58,42,0.10)",
                      overflow: "hidden", animationDelay: "0.2s",
                    }}>
                      {/* Header */}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "72px 1fr 120px 120px 110px 140px",
                        padding: "12px 20px", background: "#F5E6DC",
                      }}>
                        {["Cover", "Title", "Issue Date", "Due Date", "Status", "Action"].map((h) => (
                          <span key={h} style={{
                            fontSize: 11, fontWeight: 700, color: "#6B3A2A",
                            letterSpacing: 0.5, textTransform: "uppercase",
                          }}>
                            {h}
                          </span>
                        ))}
                      </div>

                      {/* Rows */}
                      {visible.map((borrow, i) => {
                        const dl = borrow.status === "borrowed" || borrow.status === "overdue"
                          ? daysLeft(borrow.due_date) : null;
                        return (
                          <div
                            key={borrow.id}
                            className="borrow-row"
                            style={{
                              display: "grid",
                              gridTemplateColumns: "72px 1fr 120px 120px 110px 140px",
                              alignItems: "center", padding: "14px 20px",
                              background: i % 2 === 0 ? "#FFFAF7" : "#FDF5EE",
                              borderBottom: "1px solid #F2E2D8",
                              transition: "background .15s",
                              animation: "fadeInUp .35s ease both",
                              animationDelay: `${i * 0.05}s`,
                            }}
                          >
                            {/* Cover */}
                            <img
                              src={borrow.book.cover_image}
                              alt={borrow.book.title}
                              style={{ width: 44, height: 60, objectFit: "cover", borderRadius: 4 }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/44x60/E8C9B5/6B3A2A?text=Book";
                              }}
                            />

                            {/* Title + countdown */}
                            <div>
                              <span style={{
                                fontFamily: "'Playfair Display', serif",
                                fontStyle: "italic", fontSize: 13,
                                color: "#3D1F15", fontWeight: 600,
                              }}>
                                {borrow.book.title.length > 30
                                  ? borrow.book.title.slice(0, 28) + "…"
                                  : borrow.book.title}
                              </span>
                              {dl && (
                                <p style={{
                                  fontFamily: "'Lato', sans-serif",
                                  fontSize: 10, color: dl.color,
                                  margin: "3px 0 0", fontWeight: 700,
                                }}>
                                  {dl.label}
                                </p>
                              )}
                            </div>

                            <span style={{ fontSize: 12, color: "#8B5E52" }}>
                              {formatDate(borrow.issue_date)}
                            </span>

                            <div>
                              <span style={{ fontSize: 12, color: "#8B5E52" }}>
                                {formatDate(borrow.due_date)}
                              </span>
                              {borrow.status === "reserved" && borrow.pickup_deadline && (
                                <p style={{
                                  fontFamily: "'Lato', sans-serif",
                                  fontSize: 10, color: "#6040B0",
                                  fontWeight: 700, margin: "3px 0 0",
                                }}>
                                  Collect by: {formatDate(borrow.pickup_deadline)}
                                </p>
                              )}
                            </div>

                            <StatusBadge status={borrow.status} />

                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              {borrow.status === "reserved" ? (
                                <button
                                  onClick={() => setViewingQR({
                                    bookTitle:      borrow.book.title,
                                    reservationId:  borrow.id,
                                    pickupDeadline: borrow.pickup_deadline ?? "",
                                  })}
                                  style={{
                                    background: "linear-gradient(135deg,#6040B0,#4020A0)",
                                    color: "#FFF8F0", border: "none", borderRadius: 999,
                                    padding: "7px 14px",
                                    fontFamily: "'Lato', sans-serif",
                                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                                    minWidth: 108,
                                  }}
                                >
                                  Show QR Code
                                </button>
                              ) : (
                                <button
                                  className="return-btn"
                                  onClick={() => handleReturn(borrow)}
                                  disabled={borrow.status === "returned" || returning === borrow.id}
                                  style={{
                                    background: borrow.status === "returned"
                                      ? "#D9BFB5"
                                      : "linear-gradient(135deg,#C4836A,#A5624C)",
                                    color: "#FFF8F0", border: "none", borderRadius: 999,
                                    padding: "7px 14px",
                                    fontFamily: "'Lato', sans-serif",
                                    fontSize: 11, fontWeight: 700,
                                    cursor: borrow.status === "returned" ? "not-allowed" : "pointer",
                                    transition: "background .2s", minWidth: 108,
                                  }}
                                >
                                  {returning === borrow.id ? "Processing…"
                                    : borrow.status === "returned" ? "Returned"
                                    : "Return / Renew"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          style={{
                            width: 36, height: 36, borderRadius: "50%",
                            border: "1.5px solid #C4836A",
                            background: p === page
                              ? "linear-gradient(135deg,#C4836A,#A5624C)"
                              : "transparent",
                            color: p === page ? "#FFF8F0" : "#C4836A",
                            fontFamily: "'Lato', sans-serif",
                            fontWeight: 700, fontSize: 13,
                            cursor: "pointer", transition: "all .2s",
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ── EVENTS SECTION ── */}
              {section === "events" && (
                <>
                  {eventRegs.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                      <p style={{
                        fontFamily: "'Playfair Display', serif",
                        fontStyle: "italic", fontSize: 20, color: "#3D1F15",
                        marginBottom: 12,
                      }}>
                        No event registrations yet
                      </p>
                      <a href="/events" style={{
                        color: "#C4836A",
                        fontFamily: "'Lato', sans-serif", fontSize: 13,
                      }}>
                        Browse upcoming events
                      </a>
                    </div>
                  ) : (
                    <div style={{
                      background: "#FFFAF7", borderRadius: 16,
                      boxShadow: "0 4px 24px rgba(107,58,42,0.10)",
                      overflow: "hidden",
                      animation: "fadeInUp .4s ease both",
                    }}>
                      {/* Header */}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 180px 100px 120px 110px",
                        padding: "12px 20px", background: "#F5E6DC",
                      }}>
                        {["Event", "Date / Time", "Tag", "Registered On", "Status"].map((h) => (
                          <span key={h} style={{
                            fontSize: 11, fontWeight: 700, color: "#6B3A2A",
                            letterSpacing: 0.5, textTransform: "uppercase",
                          }}>
                            {h}
                          </span>
                        ))}
                      </div>

                      {eventRegs.map((reg, i) => (
                        <div
                          key={reg.id}
                          className="borrow-row"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 180px 100px 120px 110px",
                            alignItems: "center", padding: "14px 20px",
                            background: i % 2 === 0 ? "#FFFAF7" : "#FDF5EE",
                            borderBottom: "1px solid #F2E2D8",
                            transition: "background .15s",
                          }}
                        >
                          {/* Title + location */}
                          <div>
                            <span style={{
                              fontFamily: "'Playfair Display', serif",
                              fontStyle: "italic", fontSize: 13,
                              color: "#3D1F15", fontWeight: 600,
                            }}>
                              {reg.event.title.length > 32
                                ? reg.event.title.slice(0, 30) + "…"
                                : reg.event.title}
                            </span>
                            <p style={{
                              fontFamily: "'Lato', sans-serif",
                              fontSize: 11, color: "#A07060",
                              margin: "3px 0 0",
                            }}>
                              {reg.event.location}
                            </p>
                          </div>

                          <div>
                            <span style={{ fontSize: 12, color: "#8B5E52" }}>
                              {new Date(reg.event.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <p style={{
                              fontFamily: "'Lato', sans-serif",
                              fontSize: 11, color: "#A07060", margin: "3px 0 0",
                            }}>
                              {reg.event.time}
                            </p>
                          </div>

                          <span style={{
                            fontSize: 11, color: "#6B3A2A",
                            background: "#FFF0E8",
                            border: "1px solid #F0DDD4",
                            borderRadius: 999,
                            padding: "3px 10px",
                            fontFamily: "'Lato', sans-serif",
                          }}>
                            {reg.event.tag}
                          </span>

                          <span style={{ fontSize: 12, color: "#8B5E52" }}>
                            {formatDate(reg.created_at)}
                          </span>

                          <EventStatusBadge status={reg.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {viewingQR && (
        <ReservationModal
          bookTitle={viewingQR.bookTitle}
          reservationId={viewingQR.reservationId}
          pickupDeadline={viewingQR.pickupDeadline}
          onClose={() => setViewingQR(null)}
        />
      )}
    </>
  );
}