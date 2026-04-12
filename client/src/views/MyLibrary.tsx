import { useState, useEffect, useRef } from "react";
import { useNavigate }                  from "react-router-dom";
import ApiClient                        from "../api";
import toast                            from "react-hot-toast";

const api      = new ApiClient();
const PER_PAGE = 5;

// ── Types ──────────────────────────────────────────────────────────────────────
interface BorrowedBook {
  id:             number;
  book:           { id: number; title: string; cover_image: string };
  issue_date:     string;
  due_date:       string;
  return_date:    string | null;
  status:         "borrowed" | "returned" | "overdue";
  fine_amount:    number;
  fine_paid:      boolean;
  payment_method: string | null;
  paid_at:        string | null;
}

type PayStep   = "select" | "number" | "otp" | "success";
type PayMethod = "bkash" | "nagad"; // lowercase to match backend

// ── Membership config ──────────────────────────────────────────────────────────
const TIERS = [
  { name: "Silver",   min: 0,  max: 4,          emoji: "🥈", color: "#A8B0B8", bg: "#F0F2F4", border: "#C8CDD2", glow: "rgba(168,176,184,0.3)"  },
  { name: "Gold",     min: 5,  max: 14,          emoji: "🥇", color: "#C8A020", bg: "#FDF8E8", border: "#E8D070", glow: "rgba(200,160,32,0.25)"  },
  { name: "Platinum", min: 15, max: Infinity,    emoji: "💎", color: "#7060C0", bg: "#F4F0FC", border: "#B0A0E0", glow: "rgba(112,96,192,0.25)"  },
];
function getTier(n: number)     { return TIERS.find((t) => n >= t.min && n <= t.max) ?? TIERS[0]; }
function getNextTier(n: number) { const i = TIERS.findIndex((t) => n >= t.min && n <= t.max); return i < TIERS.length - 1 ? TIERS[i + 1] : null; }

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(raw: string) {
  return new Date(raw).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function daysLeft(dueDate: string) {
  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  if (days < 0)   return { label: `${Math.abs(days)}d overdue`, color: "#C04030" };
  if (days === 0) return { label: "Due today",                  color: "#E07020" };
  if (days <= 3)  return { label: `${days}d left`,              color: "#E07020" };
  return            { label: `${days}d left`,                   color: "#6B9060" };
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: BorrowedBook["status"] }) {
  const map = {
    returned: { bg: "#D4F0D8", color: "#2E7D32", label: "Returned" },
    borrowed: { bg: "#FAE0D8", color: "#B24E35", label: "Due"      },
    overdue:  { bg: "#FAD0CC", color: "#9B2418", label: "Overdue"  },
  };
  const s = map[status] ?? map.borrowed;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "4px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: "'Lato',sans-serif", letterSpacing: 0.3 }}>
      {s.label}
    </span>
  );
}

// ── Membership card ───────────────────────────────────────────────────────────
function MembershipCard({ borrows }: { borrows: BorrowedBook[] }) {
  const total    = borrows.length;
  const returned = borrows.filter((b) => b.status === "returned").length;
  const active   = borrows.filter((b) => b.status === "borrowed").length;
  const overdue  = borrows.filter((b) => b.status === "overdue").length;
  const tier     = getTier(total);
  const next     = getNextTier(total);
  const progress = next ? ((total - tier.min) / (next.min - tier.min)) * 100 : 100;

  return (
    <div style={{ background: tier.bg, border: `2px solid ${tier.border}`, borderRadius: 20, padding: "28px 32px", boxShadow: `0 8px 32px ${tier.glow}`, marginBottom: 32, display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center" }}>
      <div style={{ textAlign: "center", minWidth: 90 }}>
        <div style={{ fontSize: 48 }}>{tier.emoji}</div>
        <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 16, fontWeight: 700, color: tier.color, margin: "6px 0 0" }}>{tier.name}</p>
        <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, color: "#8B5E52", margin: "2px 0 0" }}>Member</p>
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 20, fontWeight: 600, color: "#3D1F15", margin: "0 0 16px" }}>Your Reading Journey</p>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "Total Borrowed", value: total,    color: "#C4836A" },
            { label: "Returned",       value: returned, color: "#2E7D32" },
            { label: "Active",         value: active,   color: "#B24E35" },
            { label: "Overdue",        value: overdue,  color: "#9B2418" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: "center", minWidth: 64 }}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color, margin: 0 }}>{value}</p>
              <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 10, color: "#8B5E52", margin: "2px 0 0", letterSpacing: 0.3 }}>{label}</p>
            </div>
          ))}
        </div>
        {next ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, color: "#8B5E52" }}>Progress to {next.emoji} {next.name}</span>
              <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, color: tier.color, fontWeight: 700 }}>{total} / {next.min} books</span>
            </div>
            <div style={{ height: 7, background: "#E5D5C5", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(progress, 100)}%`, background: `linear-gradient(90deg, ${tier.color}, ${next.color})`, borderRadius: 999, transition: "width .6s ease" }} />
            </div>
            <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 10, color: "#A07060", marginTop: 5 }}>
              {next.min - total} more book{next.min - total !== 1 ? "s" : ""} to reach {next.name}!
            </p>
          </div>
        ) : (
          <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 13, color: tier.color }}>🎉 You've reached the highest tier!</p>
        )}
      </div>
      <div style={{ minWidth: 160, background: "rgba(255,255,255,0.6)", borderRadius: 12, padding: "14px 18px", border: `1px solid ${tier.border}` }}>
        <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, fontWeight: 700, color: "#6B3A2A", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 10px" }}>{tier.emoji} {tier.name} Perks</p>
        {(tier.name === "Silver"
          ? ["Borrow up to 2 books", "7-day loan period", "Email reminders"]
          : tier.name === "Gold"
          ? ["Borrow up to 4 books", "14-day loan period", "Priority reservations", "Early event access"]
          : ["Unlimited borrows", "21-day loan period", "VIP event seating", "Dedicated librarian", "Exclusive reads"]
        ).map((perk) => (
          <p key={perk} style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, color: "#6B3A2A", margin: "5px 0", display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ color: tier.color }}>✓</span> {perk}
          </p>
        ))}
      </div>
    </div>
  );
}

// ── Payment Modal ─────────────────────────────────────────────────────────────
function PaymentModal({ borrow, onClose, onPaid }: {
  borrow:  BorrowedBook;
  onClose: () => void;
  onPaid:  (borrowId: number, method: PayMethod) => Promise<void>;
}) {
  const [step,         setStep]         = useState<PayStep>("select");
  const [method,       setMethod]       = useState<PayMethod | null>(null);
  const [phone,        setPhone]        = useState("");
  const [phoneErr,     setPhoneErr]     = useState("");
  const [otp,          setOtp]          = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpErr,       setOtpErr]       = useState("");
  const [sending,      setSending]      = useState(false);
  const [verifying,    setVerifying]    = useState(false);
  const [countdown,    setCountdown]    = useState(0);
  const otpRefs  = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const BKASH_COLOR = "#E2136E";
  const NAGAD_COLOR = "#F15822";
  const activeColor = method === "bkash" ? BKASH_COLOR : method === "nagad" ? NAGAD_COLOR : "#C4836A";
  // Display label with proper casing
  const methodLabel = method === "bkash" ? "bKash" : method === "nagad" ? "Nagad" : "";

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startCountdown = (secs: number) => {
    setCountdown(secs);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { clearInterval(timerRef.current!); return 0; } return c - 1; });
    }, 1000);
  };

  const handleSelectMethod = (m: PayMethod) => { setMethod(m); setStep("number"); };

  const handleSendOtp = async () => {
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      setPhoneErr("Enter a valid 11-digit number (e.g. 01XXXXXXXXX)");
      return;
    }
    setPhoneErr("");
    setSending(true);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setStep("otp");
    startCountdown(60);
    toast(`🔐 Demo OTP: ${code}`, {
      duration: 20000,
      style: { fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 13, background: "#3D1F15", color: "#FFF8F0" },
    });
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next); setOtpErr("");
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleResend = () => {
    if (countdown > 0) return;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtp(["", "", "", "", "", ""]); setOtpErr("");
    startCountdown(60);
    toast(`🔐 New OTP: ${code}`, {
      duration: 20000,
      style: { fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 13, background: "#3D1F15", color: "#FFF8F0" },
    });
  };

  const handleVerify = async () => {
    const entered = otp.join("");
    if (entered.length < 6) { setOtpErr("Enter the complete 6-digit OTP."); return; }
    if (entered !== generatedOtp) {
      setOtpErr("Incorrect OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      return;
    }
    setVerifying(true);
    await onPaid(borrow.id, method!);
    setVerifying(false);
    setStep("success");
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(30,10,5,0.6)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#FDF5EE", borderRadius: 24, width: "100%", maxWidth: 420, boxShadow: "0 28px 80px rgba(107,58,42,0.35)", overflow: "hidden", animation: "slideUp .3s cubic-bezier(.16,1,.3,1) both" }}>

        {/* Header */}
        <div style={{ background: step === "select" ? "#C4836A" : activeColor, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "background .3s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              {step === "select" ? "💰" : method === "bkash" ? "💳" : "📲"}
            </div>
            <div>
              <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.8)", margin: 0, letterSpacing: 1.5, textTransform: "uppercase" }}>
                {step === "select" ? "Fine Payment" : `${methodLabel} Payment`}
              </p>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: "2px 0 0" }}>
                ৳{borrow.fine_amount} Fine
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 34, height: 34, color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ padding: "28px 24px 24px" }}>

          {/* Step 1: Select */}
          {step === "select" && (
            <>
              <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 14, color: "#6B3A2A", marginBottom: 4 }}>Paying fine for</p>
              <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 13, color: "#3D1F15", fontWeight: 700, marginBottom: 24 }}>"{borrow.book.title}"</p>
              <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, color: "#6B3A2A", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Choose payment method</p>
              <div style={{ display: "flex", gap: 12 }}>
                {([
                  { id: "bkash" as PayMethod, label: "bKash", color: BKASH_COLOR, bg: "#FFF0F6", hoverBg: "#FFD6E9", icon: "💳" },
                  { id: "nagad" as PayMethod, label: "Nagad", color: NAGAD_COLOR, bg: "#FFF5F0", hoverBg: "#FFD8C4", icon: "📲" },
                ]).map((m) => (
                  <button key={m.id} onClick={() => handleSelectMethod(m.id)}
                    style={{ flex: 1, padding: "20px 0", background: m.bg, border: `2px solid ${m.color}`, borderRadius: 16, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all .2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = m.hoverBg; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = m.bg;      e.currentTarget.style.transform = "none"; }}
                  >
                    <span style={{ fontSize: 30 }}>{m.icon}</span>
                    <span style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 16, color: m.color }}>{m.label}</span>
                    <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 10, color: "#A07060" }}>Mobile Banking</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 2: Phone */}
          {step === "number" && (
            <>
              <button onClick={() => setStep("select")} style={{ background: "none", border: "none", color: "#C4836A", cursor: "pointer", fontSize: 13, fontFamily: "'Lato',sans-serif", padding: 0, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
                ← Back
              </button>
              <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 13, color: "#3D1F15", marginBottom: 20 }}>
                Enter your <strong style={{ color: activeColor }}>{methodLabel}</strong> account number
              </p>
              <label style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, color: "#6B3A2A", fontWeight: 700, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Mobile Number
              </label>
              <div style={{ display: "flex", alignItems: "center", border: `2px solid ${phoneErr ? "#C04030" : "#E5C9BB"}`, borderRadius: 12, overflow: "hidden", background: "#FFFAF7", marginBottom: 6 }}>
                <span style={{ padding: "13px 14px", fontFamily: "'Lato',sans-serif", fontSize: 13, color: "#8B5E52", borderRight: "1px solid #E5C9BB", background: "#F5EDE5", whiteSpace: "nowrap" }}>🇧🇩 +88</span>
                <input
                  type="tel" maxLength={11} value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setPhoneErr(""); }}
                  placeholder="01XXXXXXXXX"
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  style={{ flex: 1, padding: "13px 12px", border: "none", background: "transparent", fontFamily: "'Lato',sans-serif", fontSize: 16, color: "#3D1F15", outline: "none", letterSpacing: 2 }}
                />
                <span style={{ padding: "0 12px", fontFamily: "'Lato',sans-serif", fontSize: 11, color: phone.length === 11 ? "#2E7D32" : "#B0907A", fontWeight: 700 }}>{phone.length}/11</span>
              </div>
              {phoneErr && <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, color: "#C04030", margin: "0 0 12px" }}>{phoneErr}</p>}
              <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, color: "#A07060", marginBottom: 24 }}>A 6-digit OTP will be sent for verification.</p>
              <button onClick={handleSendOtp} disabled={sending}
                style={{ width: "100%", padding: "13px 0", background: sending ? "#D9BFB5" : activeColor, color: "#fff", border: "none", borderRadius: 999, fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 14, cursor: sending ? "not-allowed" : "pointer", transition: "all .2s" }}
              >
                {sending ? "Sending OTP…" : "Send OTP →"}
              </button>
            </>
          )}

          {/* Step 3: OTP */}
          {step === "otp" && (
            <>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>📱</div>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: "#3D1F15", margin: "0 0 6px" }}>Enter OTP</p>
                <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, color: "#8B5E52", margin: 0 }}>
                  Sent to <strong>{phone.slice(0, 4)}***{phone.slice(-3)}</strong>
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 10 }}>
                {otp.map((digit, i) => (
                  <input key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    autoFocus={i === 0}
                    style={{ width: 46, height: 54, textAlign: "center", fontSize: 22, fontWeight: 700, fontFamily: "'Lato',sans-serif", color: "#3D1F15", border: `2px solid ${digit ? activeColor : otpErr ? "#C04030" : "#E5C9BB"}`, borderRadius: 12, background: digit ? "#FFFAF7" : "#F8F0EA", outline: "none", transition: "border-color .15s" }}
                  />
                ))}
              </div>
              {otpErr && <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 11, color: "#C04030", textAlign: "center", margin: "0 0 8px" }}>{otpErr}</p>}
              <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, color: "#A07060", textAlign: "center", marginBottom: 20 }}>
                {countdown > 0
                  ? `Resend OTP in ${countdown}s`
                  : <span onClick={handleResend} style={{ color: activeColor, cursor: "pointer", fontWeight: 700, textDecoration: "underline" }}>Resend OTP</span>
                }
              </p>
              <button onClick={handleVerify} disabled={verifying || otp.join("").length < 6}
                style={{ width: "100%", padding: "13px 0", background: (verifying || otp.join("").length < 6) ? "#D9BFB5" : activeColor, color: "#fff", border: "none", borderRadius: 999, fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 14, cursor: (verifying || otp.join("").length < 6) ? "not-allowed" : "pointer", transition: "all .2s", marginBottom: 8 }}
              >
                {verifying ? "Processing…" : `Confirm & Pay ৳${borrow.fine_amount}`}
              </button>
              <button onClick={() => { setStep("number"); setOtp(["", "", "", "", "", ""]); setOtpErr(""); }}
                style={{ width: "100%", padding: "10px 0", background: "transparent", color: "#8B5E52", border: "none", fontFamily: "'Lato',sans-serif", fontSize: 12, cursor: "pointer" }}
              >
                ← Change number
              </button>
            </>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#D4F0D8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px" }}>✅</div>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#2E7D32", margin: "0 0 8px" }}>Payment Submitted!</p>
              <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 13, color: "#8B5E52", margin: "0 0 4px" }}>
                ৳{borrow.fine_amount} via <strong style={{ color: activeColor }}>{methodLabel}</strong>
              </p>
              <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 12, color: "#A07060", marginBottom: 28 }}>
                Awaiting admin confirmation. Your fine will be cleared once confirmed.
              </p>
              <button onClick={onClose} style={{ padding: "12px 40px", background: activeColor, color: "#fff", border: "none", borderRadius: 999, fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MyLibrary() {
  const navigate = useNavigate();

  const [borrows,      setBorrows]      = useState<BorrowedBook[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(1);
  const [returning,    setReturning]    = useState<number | null>(null);
  const [filter,       setFilter]       = useState<"all" | "borrowed" | "returned" | "overdue">("all");
  const [payingBorrow, setPayingBorrow] = useState<BorrowedBook | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    api.getMyBorrows()
      .then((data) => { if (data) setBorrows(data.borrows || []); })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleReturn = async (borrow: BorrowedBook) => {
    if (borrow.status === "returned") return;
    setReturning(borrow.id);
    const result = await api.returnBook(borrow.id);
    if (result?.success) {
      setBorrows((prev) => prev.map((b) =>
        b.id === borrow.id ? { ...b, status: "returned", return_date: new Date().toISOString().split("T")[0] } : b
      ));
    }
    setReturning(null);
  };

  const handlePaid = async (borrowId: number, method: PayMethod): Promise<void> => {
    const result = await api.submitFinePayment(borrowId, method);
    if (result?.success) {
      setBorrows((prev) => prev.map((b) =>
        b.id === borrowId
          ? { ...b, paid_at: new Date().toISOString(), payment_method: method }
          : b
      ));
    } else {
      toast.error(result?.message || "Payment failed. Try again.");
    }
  };

  const filtered   = filter === "all" ? borrows : borrows.filter((b) => b.status === filter);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const visible    = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const tabCounts  = {
    all:      borrows.length,
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
        @keyframes slideUp  { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        .lib-appear { animation: fadeInUp .4s ease both; }
        .borrow-row:hover { background: #FFF0E8 !important; }
        .filter-tab:hover { border-color: #C4836A !important; color: #C4836A !important; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "8%", right: "5%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(196,131,106,0.07) 0%,transparent 70%)", animation: "floatOrb 11s ease-in-out infinite" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", background: "linear-gradient(160deg,#FDF5EE 0%,#F9EEE4 40%,#F4E6D8 100%)", fontFamily: "'Lato',sans-serif", padding: "52px 24px 100px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          <div className="lib-appear" style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, letterSpacing: 4, color: "#C4836A", textTransform: "uppercase", marginBottom: 8, opacity: 0.8 }}>My Account</p>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 38, fontWeight: 600, color: "#3D1F15", margin: 0 }}>Your Reading Library</h1>
            <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", color: "#A07060", fontSize: 15, marginTop: 8 }}>Track your books, monitor your status, and grow your membership.</p>
          </div>

          {loading && <p style={{ textAlign: "center", color: "#C4836A", fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 18, marginTop: 60 }}>Loading your library…</p>}

          {!loading && (
            <>
              <div className="lib-appear" style={{ animationDelay: "0.1s" }}>
                <MembershipCard borrows={borrows} />
              </div>

              <div className="lib-appear" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, animationDelay: "0.15s" }}>
                {(["all", "borrowed", "returned", "overdue"] as const).map((tab) => (
                  <button key={tab} className="filter-tab"
                    onClick={() => { setFilter(tab); setPage(1); }}
                    style={{ padding: "8px 18px", borderRadius: 999, cursor: "pointer", border: `1.5px solid ${filter === tab ? "#C4836A" : "#E5C9BB"}`, background: filter === tab ? "linear-gradient(135deg,#C4836A,#A5624C)" : "rgba(255,250,247,0.9)", color: filter === tab ? "#FFF8F0" : "#6B3A2A", fontFamily: "'Lato',sans-serif", fontSize: 12, fontWeight: filter === tab ? 700 : 400, transition: "all .2s" }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} <span style={{ opacity: 0.75 }}>({tabCounts[tab]})</span>
                  </button>
                ))}
              </div>

              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <p style={{ fontSize: 44 }}>📚</p>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 22, color: "#3D1F15" }}>
                    {filter === "all" ? "You haven't borrowed any books yet" : `No ${filter} books`}
                  </p>
                  {filter === "all" && <a href="/books" style={{ color: "#C4836A", fontFamily: "'Lato',sans-serif", fontSize: 13 }}>Browse Books →</a>}
                </div>
              )}

              {filtered.length > 0 && (
                <div className="lib-appear" style={{ background: "#FFFAF7", borderRadius: 16, boxShadow: "0 4px 24px rgba(107,58,42,0.10)", overflow: "hidden", animationDelay: "0.2s" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "72px 1fr 110px 110px 100px 170px", padding: "12px 20px", background: "#F5E6DC" }}>
                    {["Cover", "Title", "Issue Date", "Due Date", "Status", "Action"].map((h) => (
                      <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#6B3A2A", letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</span>
                    ))}
                  </div>

                  {visible.map((borrow, i) => {
                    const dl              = borrow.status !== "returned" ? daysLeft(borrow.due_date) : null;
                    const hasUnpaidFine   = borrow.fine_amount > 0 && !borrow.fine_paid && !borrow.paid_at;
                    const awaitingConfirm = borrow.fine_amount > 0 && !borrow.fine_paid && !!borrow.paid_at;

                    return (
                      <div key={borrow.id} className="borrow-row"
                        style={{ display: "grid", gridTemplateColumns: "72px 1fr 110px 110px 100px 170px", alignItems: "center", padding: "14px 20px", background: i % 2 === 0 ? "#FFFAF7" : "#FDF5EE", borderBottom: "1px solid #F2E2D8", transition: "background .15s", animation: "fadeInUp .35s ease both", animationDelay: `${i * 0.05}s` }}
                      >
                        <img src={borrow.book.cover_image} alt={borrow.book.title}
                          style={{ width: 44, height: 60, objectFit: "cover", borderRadius: 4 }}
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/44x60/E8C9B5/6B3A2A?text=📖"; }}
                        />

                        <div>
                          <span style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 13, color: "#3D1F15", fontWeight: 600 }}>
                            {borrow.book.title.length > 28 ? borrow.book.title.slice(0, 26) + "…" : borrow.book.title}
                          </span>
                          {dl && <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 10, color: dl.color, margin: "3px 0 0", fontWeight: 700 }}>{dl.label}</p>}
                          {borrow.fine_amount > 0 && (
                            <p style={{ fontFamily: "'Lato',sans-serif", fontSize: 10, color: borrow.fine_paid ? "#2E7D32" : "#C04030", margin: "2px 0 0", fontWeight: 700 }}>
                              Fine: ৳{borrow.fine_amount}
                              {borrow.fine_paid ? " ✓" : awaitingConfirm ? " ⏳" : ""}
                            </p>
                          )}
                        </div>

                        <span style={{ fontSize: 12, color: "#8B5E52" }}>{formatDate(borrow.issue_date)}</span>
                        <span style={{ fontSize: 12, color: "#8B5E52" }}>{formatDate(borrow.due_date)}</span>
                        <StatusBadge status={borrow.status} />

                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          {borrow.status !== "overdue" && (
                            <button onClick={() => handleReturn(borrow)}
                              disabled={borrow.status === "returned" || returning === borrow.id}
                              style={{ background: borrow.status === "returned" ? "#D9BFB5" : "linear-gradient(135deg,#C4836A,#A5624C)", color: "#FFF8F0", border: "none", borderRadius: 999, padding: "7px 10px", fontFamily: "'Lato',sans-serif", fontSize: 11, fontWeight: 700, cursor: borrow.status === "returned" ? "not-allowed" : "pointer", transition: "all .2s" }}
                            >
                              {returning === borrow.id ? "Returning…" : borrow.status === "returned" ? "Returned ✓" : "Return / Renew"}
                            </button>
                          )}

                          {hasUnpaidFine && (
                            <button onClick={() => setPayingBorrow(borrow)}
                              style={{ padding: "7px 10px", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#E2136E,#F15822)", color: "#fff", fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 11, cursor: "pointer", boxShadow: "0 2px 10px rgba(226,19,110,0.35)", transition: "all .2s" }}
                              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1";    e.currentTarget.style.transform = "none"; }}
                            >
                              💳 Pay Fine ৳{borrow.fine_amount}
                            </button>
                          )}

                          {awaitingConfirm && (
                            <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 10, color: "#E07020", fontWeight: 700 }}>⏳ Awaiting admin</span>
                          )}
                          {borrow.fine_paid && (
                            <span style={{ fontFamily: "'Lato',sans-serif", fontSize: 10, color: "#2E7D32", fontWeight: 700 }}>✓ Fine cleared</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #C4836A", background: p === page ? "linear-gradient(135deg,#C4836A,#A5624C)" : "transparent", color: p === page ? "#FFF8F0" : "#C4836A", fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all .2s" }}
                    >{p}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {payingBorrow && (
        <PaymentModal
          borrow={payingBorrow}
          onClose={() => setPayingBorrow(null)}
          onPaid={async (id, method) => {
            await handlePaid(id, method);
            setPayingBorrow(null);
          }}
        />
      )}
    </>
  );
}