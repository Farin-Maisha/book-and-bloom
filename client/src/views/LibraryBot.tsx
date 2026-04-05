import { useState, useEffect, useRef } from "react";
import ApiClient from "../api";

const api = new ApiClient();

// ── Types ──────────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
}

// ── Aisle / shelf layout info ──────────────────────────────────────────────────
// This is the physical library layout injected into the AI's knowledge.
// Edit this to match your real library's aisle arrangement.
const AISLE_INFO = `
Library Floor Layout — Book & Bloom:
- Entrance / Welcome Desk: Ground floor, straight ahead from the main door
- Aisle A (Fiction & Literature):     Shelf rows A1–A8,  left wing, ground floor
- Aisle B (Mystery & Thriller):       Shelf rows B1–B6,  left wing, ground floor
- Aisle C (Science Fiction & Fantasy):Shelf rows C1–C7,  left wing, first floor
- Aisle D (Romance):                  Shelf rows D1–D5,  right wing, ground floor
- Aisle E (Non-Fiction):              Shelf rows E1–E10, right wing, ground floor
- Aisle F (History & Biography):      Shelf rows F1–F8,  right wing, first floor
- Aisle G (Self-Help & Wellness):     Shelf rows G1–G4,  centre, ground floor
- Aisle H (Poetry & Drama):           Shelf rows H1–H3,  centre, first floor
- Aisle I (Children & Young Adult):   Shelf rows I1–I6,  rear, ground floor
- Aisle J (Travel & Adventure):       Shelf rows J1–J4,  rear, first floor
- Reading Lounge:                     Rear of ground floor, near large windows
- Study Rooms:                        First floor, north corridor (book ahead)
- Café Corner:                        Ground floor, right of entrance
`;

// ── Build the system prompt with live library data ─────────────────────────────
// This is what makes the bot smart — it knows YOUR library's actual contents.
function buildSystemPrompt(books: any[], categories: any[]): string {
  const bookList = books
    .slice(0, 80) // keep prompt size reasonable
    .map((b: any) =>
      `• "${b.title}" by ${b.author} | Category: ${b.category?.name ?? "General"} | ${b.available_copies > 0 ? `${b.available_copies} copies available` : "Currently borrowed out"}`
    )
    .join("\n");

  const categoryList = categories
    .map((c: any) => `• ${c.name}${c.books_count ? ` (${c.books_count} books)` : ""}`)
    .join("\n");

  return `You are BloomBot, the friendly and knowledgeable AI librarian assistant for Book & Bloom — a cozy digital library platform.

Your personality: warm, enthusiastic about books, helpful, concise. You speak like a librarian who genuinely loves reading. Use light, friendly language. Never be dry or robotic.

You can help with:
- Finding books by title, author, genre, or mood
- Recommending books based on the reader's preferences or what they've enjoyed before
- Explaining where to find books in the physical library (aisle info below)
- Answering questions about borrowing, returning, library hours, membership
- Suggesting reading lists or "if you liked X, try Y" style recommendations
- Explaining what categories/genres are available

=== LIBRARY DETAILS ===
Name: Book & Bloom
Tagline: "Where Stories Blossom"
Contact: book@bloom@gmail.com | +880941-63843213
Location: Justice Shahabuddin Ahmed Park, Dhaka
Hours: Mon–Fri 9am–8pm, Sat–Sun 10am–6pm
Membership: Free for all registered users. Borrow up to 3 books at a time. 14-day loan period.

=== PHYSICAL AISLE LAYOUT ===
${AISLE_INFO}

=== AVAILABLE CATEGORIES ===
${categoryList || "Fiction, Non-Fiction, Mystery, Romance, Science Fiction, Fantasy, History, Self-Help, Poetry, Children"}

=== CURRENT BOOK CATALOGUE (${books.length} books) ===
${bookList || "Catalogue loading — please ask the user to try again shortly."}

=== RULES ===
- Only recommend books that are in the catalogue above. Don't invent titles.
- If a book is "Currently borrowed out", mention it but suggest the user put themselves on a waitlist or check back.
- If asked something outside your knowledge (e.g. specific staff names, event schedules), say you're not sure and suggest they contact the library directly.
- Keep responses concise — 2–4 short paragraphs max. Use bullet points for lists.
- Never refuse to help with book-related questions.`;
}

// ── Thinking dots animation ────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "10px 14px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#C4836A", opacity: 0.6,
            animation: "bounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
            display: "inline-block",
          }}
        />
      ))}
    </div>
  );
}

// ── Single chat message bubble ─────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 12,
    }}>
      {/* Bot avatar — only on assistant messages */}
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "#F5E6DC",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, marginRight: 8, flexShrink: 0, alignSelf: "flex-end",
        }}>
          📖
        </div>
      )}

      <div style={{
        maxWidth: "78%",
        background: isUser ? "#C4836A" : "#FFFAF7",
        color:      isUser ? "#FFF8F0" : "#3D1F15",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        padding: "10px 14px",
        fontSize: 13,
        lineHeight: 1.6,
        fontFamily: "'Lato', sans-serif",
        boxShadow: "0 2px 8px rgba(107,58,42,0.10)",
        // Render newlines and simple markdown-like formatting
        whiteSpace: "pre-wrap",
      }}>
        {/* Simple bold rendering: **text** → <strong>text</strong> */}
        {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={i}>{part.slice(2, -2)}</strong>
            : part
        )}
      </div>
    </div>
  );
}

// ── Main LibraryBot component ──────────────────────────────────────────────────
export default function LibraryBot() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReady,   setIsReady]   = useState(false); // true once we've loaded library data

  // Store library data in refs so we don't re-fetch on every render
  const systemPromptRef = useRef<string>("");
  const bottomRef       = useRef<HTMLDivElement>(null);

  // ── Load library data once when the bot first opens ───────────────────────
  // We lazy-load so we don't hit the API on every page load.
  useEffect(() => {
    if (!isOpen || isReady) return; // already loaded or not open yet

    Promise.all([api.getBooks(), api.getCategories()])
      .then(([booksData, catsData]) => {
        const books      = booksData?.books      ?? [];
        const categories = catsData?.categories  ?? [];
        systemPromptRef.current = buildSystemPrompt(books, categories);
        setIsReady(true);

        // Greeting message once data is ready
        setMessages([{
          role: "assistant",
          content: `Hello! I'm BloomBot 📖, your personal library assistant at Book & Bloom.\n\nI can help you:\n• **Find books** by title, author or mood\n• **Get recommendations** based on what you love\n• **Navigate the library** — aisles, shelves, and facilities\n• **Answer borrowing** questions\n\nWhat can I help you with today?`,
        }]);
      })
      .catch(() => {
        // If API fails, still work with the basic system prompt
        systemPromptRef.current = buildSystemPrompt([], []);
        setIsReady(true);
        setMessages([{
          role: "assistant",
          content: "Hello! I'm BloomBot 📖. I'm having a bit of trouble loading the full catalogue right now, but I can still help with general library questions. What do you need?",
        }]);
      });
  }, [isOpen, isReady]);

  // ── Auto-scroll to bottom when new messages arrive ────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Send a message to the Anthropic API ───────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading || !isReady) return;

    // Add user message to the UI immediately
    const userMsg: Message = { role: "user", content: text };
    const updatedMessages  = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Call the Anthropic API
      // We send the FULL conversation history so the bot remembers context.
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model:      "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system:     systemPromptRef.current,
          // Only send role + content — Anthropic API doesn't want extra fields
          messages:   updatedMessages.map((m) => ({
            role:    m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      // Extract the text from the response
      // data.content is an array of blocks; we want the first text block.
      const replyText =
        data.content?.find((block: any) => block.type === "text")?.text ??
        "Sorry, I didn't get a response. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", content: replyText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! Something went wrong. Please try again in a moment. 🙏" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send on Enter key (Shift+Enter = new line)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Quick suggestion chips ─────────────────────────────────────────────────
  // Shown as clickable pill buttons so first-time users know what to ask.
  const suggestions = [
    "Suggest a mystery book",
    "Where is Aisle C?",
    "I loved Harry Potter, what next?",
    "What categories do you have?",
  ];

  const handleSuggestion = (text: string) => {
    setInput(text);
    // Small delay so the user sees the input fill before it sends
    setTimeout(() => sendMessage(), 50);
  };

  // But sendMessage reads `input` state, so we need to send it directly:
  const sendSuggestion = async (text: string) => {
    if (isLoading || !isReady) return;
    const userMsg: Message = { role: "user", content: text };
    const updatedMessages  = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: systemPromptRef.current,
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const replyText = data.content?.find((b: any) => b.type === "text")?.text ?? "Try again!";
      setMessages((prev) => [...prev, { role: "assistant", content: replyText }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please retry." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1;   }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1);   }
        }

        .bot-bubble:hover { transform: scale(1.08) !important; }
        .suggestion-chip:hover { background: #C4836A !important; color: #FFF8F0 !important; }
        .send-btn:hover:not(:disabled) { background: #A5624C !important; }
        .chat-input:focus { outline: none; border-color: #C4836A !important; }

        /* Thin scrollbar for chat window */
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: #E5C9BB; border-radius: 4px; }
      `}</style>

      {/* ── Floating bubble button ─────────────────────────────────────────── */}
      <button
        className="bot-bubble"
        onClick={() => setIsOpen((o) => !o)}
        style={{
          position: "fixed", bottom: 28, right: 28,
          width: 56, height: 56, borderRadius: "50%",
          background: isOpen ? "#3D1F15" : "#C4836A",
          border: "none", cursor: "pointer",
          boxShadow: "0 6px 24px rgba(107,58,42,0.35)",
          fontSize: 24, zIndex: 999,
          transition: "background .25s, transform .2s",
          animation: "popIn .3s ease",
        }}
        aria-label="Open library assistant"
      >
        {isOpen ? "✕" : "📖"}
      </button>

      {/* ── Chat window ───────────────────────────────────────────────────── */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: 96, right: 28,
          width: 360, height: 520,
          background: "#FDF5EE",
          borderRadius: 20,
          boxShadow: "0 20px 60px rgba(107,58,42,0.22)",
          display: "flex", flexDirection: "column",
          zIndex: 998, overflow: "hidden",
          animation: "slideUp .25s ease",
          fontFamily: "'Lato', sans-serif",
        }}>

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div style={{
            background: "linear-gradient(135deg, #C4836A, #A5624C)",
            padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,248,240,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>
              📖
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#FFF8F0" }}>
                BloomBot
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,248,240,0.75)" }}>
                {isReady ? "● Online — here to help" : "● Loading library data…"}
              </p>
            </div>
          </div>

          {/* ── Messages area ───────────────────────────────────────────────── */}
          <div
            className="chat-messages"
            style={{
              flex: 1, overflowY: "auto",
              padding: "16px 14px 8px",
            }}
          >
            {/* Loading skeleton before data is ready */}
            {!isReady && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#C4836A" }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>📚</p>
                <p style={{ fontSize: 13, fontFamily: "'Playfair Display', serif" }}>
                  Loading your library…
                </p>
              </div>
            )}

            {/* Actual messages */}
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
                <div style={{
                  background: "#FFFAF7", borderRadius: "18px 18px 18px 4px",
                  boxShadow: "0 2px 8px rgba(107,58,42,0.10)",
                }}>
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Quick suggestion chips — only show after greeting, before any user message */}
            {isReady && messages.length === 1 && !isLoading && (
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    className="suggestion-chip"
                    onClick={() => sendSuggestion(s)}
                    style={{
                      padding: "6px 14px", borderRadius: 999,
                      border: "1.5px solid #C4836A",
                      background: "transparent", color: "#C4836A",
                      fontSize: 11, fontWeight: 700,
                      cursor: "pointer", transition: "all .2s",
                      fontFamily: "'Lato', sans-serif",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Invisible div at bottom — we scroll to this */}
            <div ref={bottomRef} />
          </div>

          {/* ── Input area ──────────────────────────────────────────────────── */}
          <div style={{
            padding: "12px 14px",
            borderTop: "1px solid #F0DDD4",
            background: "#FFFAF7",
            display: "flex", gap: 8, alignItems: "flex-end",
          }}>
            <textarea
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isReady ? "Ask me anything about our library…" : "Loading…"}
              disabled={!isReady || isLoading}
              rows={1}
              style={{
                flex: 1,
                padding: "10px 14px",
                border: "1.5px solid #E5C9BB",
                borderRadius: 14,
                fontFamily: "'Lato', sans-serif",
                fontSize: 13, color: "#3D1F15",
                background: "#FDF5EE",
                resize: "none", lineHeight: 1.5,
                transition: "border-color .2s",
                // Auto-grow: max 3 lines
                maxHeight: 72, overflowY: "auto",
              }}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || !isReady}
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: (!input.trim() || isLoading || !isReady) ? "#D9BFB5" : "#C4836A",
                border: "none",
                color: "#FFF8F0",
                fontSize: 16, cursor: (!input.trim() || isLoading) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background .2s", flexShrink: 0,
              }}
            >
              ↑
            </button>
          </div>

          {/* ── Tiny footer ─────────────────────────────────────────────────── */}
          <p style={{
            textAlign: "center", fontSize: 10, color: "#C4836A",
            padding: "6px 0 8px",
            fontFamily: "'Lato', sans-serif", opacity: 0.7,
            background: "#FFFAF7",
          }}>
            Powered by AI · Book & Bloom Library
          </p>
        </div>
      )}
    </>
  );
}
