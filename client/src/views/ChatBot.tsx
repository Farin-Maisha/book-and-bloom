import { useState, useRef, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

// ── SVG Icon Components ───────────────────────────────────────────────────────
const IconChat = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const IconBot = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4836A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
    <circle cx="9" cy="13" r="1" fill="#C4836A" />
    <circle cx="15" cy="13" r="1" fill="#C4836A" />
    <path d="M10 17h4" />
  </svg>
);

const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconBook = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconDollar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

// ── Quick-reply suggestions ───────────────────────────────────────────────────
const QUICK_REPLIES = [
  { label: "Opening hours", icon: <IconClock /> },
  { label: "Location", icon: <IconMapPin /> },
  { label: "New arrivals", icon: <IconBook /> },
  { label: "Upcoming events", icon: <IconCalendar /> },
  { label: "Membership fee", icon: <IconDollar /> },
  { label: "Contact info", icon: <IconPhone /> },
];

// ── Grok API call ─────────────────────────────────────────────────────────────
const askGrok = async (userMessage: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GROK_API_KEY;

  if (!apiKey) {
    return "API key is missing. Please check your .env.local file.";
  }

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{
          text: `You are Bloom, a friendly assistant for Book&Bloom library in Dhaka, Bangladesh.
You only answer library-related questions. Here is all the information you know:
- Opening hours: Saturday to Thursday, 9 AM to 8 PM. Closed on Fridays.
- Location: 42 Banani Road, Dhaka 1213. Next to Banani park.
- Membership fee: 500 taka per year. Borrow up to 3 books for 14 days.
- Late return fine: 10 taka per day.
- Contact: Phone +880 1700-123456, Email hello@bookandbloom.com.
- Events: Storytelling every Saturday 4 PM, book swap every Wednesday 6 PM.
Keep answers short, warm and friendly. Only answer library-related questions.`
        }]
      },
      contents: [{
        parts: [{ text: userMessage }]
      }]
    }),
  });

  if (!response.ok) {
    const errData = await response.json();
    console.error("Gemini error:", errData);
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

// ── Component ─────────────────────────────────────────────────────────────────
const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! I'm Bloom, your Book&Bloom assistant. Ask me anything about our library!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  // ── Send message handler (calls real Grok API) ────────────────────────────
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now(),
      text: trimmed,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const replyText = await askGrok(trimmed);
      const botReply: Message = {
        id: Date.now() + 1,
        text: replyText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again!",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Quick reply handler (calls real Grok API) ─────────────────────────────
  const handleQuickReply = async (label: string) => {
    const userMsg: Message = {
      id: Date.now(),
      text: label,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const replyText = await askGrok(label);
      const botReply: Message = {
        id: Date.now() + 1,
        text: replyText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "Sorry, something went wrong. Please try again!",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* ── Inline styles ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Lato:wght@300;400;700&display=swap');

        .bloom-fab {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #C4836A 0%, #A0644E 100%);
          color: #FFF8F0;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(107,58,42,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .bloom-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 28px rgba(107,58,42,0.35);
        }

        .bloom-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          background: #E74C3C;
          border-radius: 50%;
          border: 2px solid #FFF8F0;
          animation: bloom-pulse 2s infinite;
        }
        @keyframes bloom-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }

        .bloom-chat-window {
          position: fixed;
          bottom: 100px;
          right: 28px;
          z-index: 9998;
          width: 370px;
          max-height: 520px;
          background: #FFFAF7;
          border-radius: 20px;
          box-shadow: 0 8px 40px rgba(107,58,42,0.18);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: bloom-slide-up 0.35s ease;
          border: 1px solid #F0DDD4;
        }
        @keyframes bloom-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .bloom-chat-header {
          background: linear-gradient(135deg, #C4836A 0%, #A0644E 100%);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bloom-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #FFF8F0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bloom-header-text h3 {
          margin: 0;
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 600;
          color: #FFF8F0;
        }
        .bloom-header-text p {
          margin: 2px 0 0;
          font-family: 'Lato', sans-serif;
          font-size: 11px;
          color: rgba(255,248,240,0.8);
        }
        .bloom-online-dot {
          width: 8px;
          height: 8px;
          background: #5BDB6D;
          border-radius: 50%;
          display: inline-block;
          margin-right: 4px;
        }

        .bloom-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #FFFAF7;
        }
        .bloom-messages::-webkit-scrollbar {
          width: 5px;
        }
        .bloom-messages::-webkit-scrollbar-thumb {
          background: #E5C9BB;
          border-radius: 10px;
        }

        .bloom-msg {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 16px;
          font-family: 'Lato', sans-serif;
          font-size: 13.5px;
          line-height: 1.5;
          word-wrap: break-word;
          animation: bloom-fade-in 0.25s ease;
        }
        @keyframes bloom-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .bloom-msg-bot {
          align-self: flex-start;
          background: #FFF0E8;
          color: #3D1F15;
          border-bottom-left-radius: 4px;
        }
        .bloom-msg-user {
          align-self: flex-end;
          background: linear-gradient(135deg, #C4836A 0%, #B07460 100%);
          color: #FFF8F0;
          border-bottom-right-radius: 4px;
        }
        .bloom-msg-time {
          font-size: 10px;
          opacity: 0.6;
          margin-top: 4px;
        }
        .bloom-msg-user .bloom-msg-time {
          text-align: right;
        }

        .bloom-typing {
          align-self: flex-start;
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          background: #FFF0E8;
          border-radius: 16px;
          border-bottom-left-radius: 4px;
        }
        .bloom-typing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #C4836A;
          animation: bloom-bounce 1.4s infinite ease-in-out;
        }
        .bloom-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .bloom-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bloom-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        .bloom-quick-replies {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 8px 16px 4px;
          background: #FFFAF7;
          border-top: 1px solid #F0DDD4;
        }
        .bloom-quick-btn {
          font-family: 'Lato', sans-serif;
          font-size: 11.5px;
          padding: 5px 12px;
          border-radius: 999px;
          border: 1px solid #E5C9BB;
          background: #FFF8F0;
          color: #6B3A2A;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .bloom-quick-btn:hover {
          background: #C4836A;
          color: #FFF8F0;
          border-color: #C4836A;
        }
        .bloom-quick-btn:hover svg {
          stroke: #FFF8F0;
        }

        .bloom-input-area {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: #FFF8F0;
          border-top: 1px solid #F0DDD4;
        }
        .bloom-input {
          flex: 1;
          border: 1px solid #E5C9BB;
          border-radius: 999px;
          padding: 9px 16px;
          font-family: 'Lato', sans-serif;
          font-size: 13px;
          color: #3D1F15;
          background: #FFFAF7;
          outline: none;
          transition: border-color 0.2s;
        }
        .bloom-input::placeholder {
          color: #B08070;
        }
        .bloom-input:focus {
          border-color: #C4836A;
        }
        .bloom-send-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #C4836A 0%, #A0644E 100%);
          color: #FFF8F0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, opacity 0.2s;
          flex-shrink: 0;
        }
        .bloom-send-btn:hover {
          transform: scale(1.08);
        }
        .bloom-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 430px) {
          .bloom-chat-window {
            width: calc(100vw - 20px);
            right: 10px;
            bottom: 90px;
            max-height: 70vh;
          }
          .bloom-fab {
            bottom: 18px;
            right: 18px;
          }
        }
      `}</style>

      {/* ── Floating Action Button ────────────────────────────────────────── */}
      <button
        className="bloom-fab"
        onClick={handleToggle}
        aria-label={isOpen ? "Close chat" : "Open chat assistant"}
        tabIndex={0}
      >
        {isOpen ? <IconClose /> : (
          <>
            <IconChat />
            <span className="bloom-badge" />
          </>
        )}
      </button>

      {/* ── Chat Window ───────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="bloom-chat-window" role="dialog" aria-label="Chat with Bloom">
          {/* Header */}
          <div className="bloom-chat-header">
            <div className="bloom-avatar">
              <IconBot />
            </div>
            <div className="bloom-header-text">
              <h3>Bloom Assistant</h3>
              <p>
                <span className="bloom-online-dot" />
                Always here to help
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="bloom-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`bloom-msg ${
                  msg.sender === "bot" ? "bloom-msg-bot" : "bloom-msg-user"
                }`}
              >
                {msg.text}
                <div className="bloom-msg-time">{formatTime(msg.timestamp)}</div>
              </div>
            ))}

            {isTyping && (
              <div className="bloom-typing">
                <span className="bloom-typing-dot" />
                <span className="bloom-typing-dot" />
                <span className="bloom-typing-dot" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies — shown only at the start */}
          {messages.length <= 2 && (
            <div className="bloom-quick-replies">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply.label}
                  className="bloom-quick-btn"
                  onClick={() => handleQuickReply(reply.label)}
                  tabIndex={0}
                >
                  {reply.icon}
                  {reply.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="bloom-input-area">
            <input
              ref={inputRef}
              className="bloom-input"
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Type your message"
            />
            <button
              className="bloom-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
            >
              <IconSend />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;