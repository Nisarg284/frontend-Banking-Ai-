import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { askQuestion } from "./services/api";

const quickPrompts = [
  {
    label: "Loan planning",
    prompt: "How do I check my loan eligibility?",
    icon: "↗",
    tone: "violet",
  },
  {
    label: "Monthly payment",
    prompt: "Calculate EMI for a ₹5,00,000 loan at 8.5% for 5 years",
    icon: "◒",
    tone: "blue",
  },
  {
    label: "Fixed deposits",
    prompt: "What are the current FD policy options?",
    icon: "▣",
    tone: "amber",
  },
  {
    label: "KYC guide",
    prompt: "Which documents do I need for KYC?",
    icon: "✓",
    tone: "mint",
  },
];

const initialMessage = {
  id: "welcome",
  sender: "bot",
  text: "Welcome to Finora Assist. I can help you understand loan policies, estimate EMIs, compare fixed deposits, and find the right KYC documents.",
  time: "Just now",
};

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="3" y="15" width="6" height="6" rx="1" /><rect x="15" y="15" width="6" height="6" rx="1" /></>,
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.6 8.6 0 0 1-3.2-.6L4 20l1.5-3.8A7.3 7.3 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" strokeLinecap="round" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 3-4 3 2 5-7" /></>,
    file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
    spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    moon: <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    send: <><path d="m21 3-7.2 18-3.7-7.1L3 10.2 21 3Z" /><path d="M10.1 13.9 21 3" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
  };

  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function App() {
  const [messages, setMessages] = useState([initialMessage]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const messageCountLabel = useMemo(() => {
    const count = messages.filter((message) => message.sender === "user").length;
    return `${count} ${count === 1 ? "question" : "questions"} asked`;
  }, [messages]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  const handleSend = async (value = question) => {
    const trimmedQuestion = value.trim();
    if (!trimmedQuestion || loading) return;

    setQuestion("");
    setMessages((previous) => [
      ...previous,
      { id: `user-${Date.now()}`, sender: "user", text: trimmedQuestion, time: "Just now" },
    ]);
    setLoading(true);

    try {
      const answer = await askQuestion(trimmedQuestion);
      setMessages((previous) => [
        ...previous,
        { id: `bot-${Date.now()}`, sender: "bot", text: typeof answer === "string" ? answer : JSON.stringify(answer), time: "Just now" },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((previous) => [
        ...previous,
        { id: `error-${Date.now()}`, sender: "bot", text: "I couldn’t reach the assistant right now. Please check that the banking service is running and try again.", time: "Just now", error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetConversation = () => {
    setMessages([initialMessage]);
    setQuestion("");
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><span>F</span></div>
          <div className="brand-copy"><strong>finora</strong><span>Banking intelligence</span></div>
          <button className="icon-button sidebar-close" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><Icon name="close" /></button>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-icon"><Icon name="shield" size={16} /></div>
          <div><span>Workspace</span><strong>Personal banking</strong></div>
          <span className="chevron">⌄</span>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          <button className="nav-item active"><Icon name="chat" /><span>AI Assistant</span><span className="nav-pill">Live</span></button>
          <button className="nav-item"><Icon name="chart" /><span>Financial overview</span></button>
          <button className="nav-item"><Icon name="file" /><span>Saved guidance</span></button>
          <p className="nav-label nav-label-spaced">Explore</p>
          <button className="nav-item"><Icon name="grid" /><span>Banking products</span></button>
        </nav>

        <div className="sidebar-tip">
          <div className="tip-icon"><Icon name="spark" size={17} /></div>
          <div><strong>Ask naturally</strong><p>Get clear answers without banking jargon.</p></div>
        </div>

        <div className="sidebar-footer">
          <div className="security-note"><span className="status-dot" /> <span>Secure session</span></div>
          <div className="profile-row"><div className="avatar">NS</div><div><strong>Nisarg Shah</strong><span>Personal account</span></div><span className="more">•••</span></div>
        </div>
      </aside>

      {mobileNavOpen && <button className="mobile-overlay" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation overlay" />}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Icon name="menu" /></button>
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-separator">/</span><strong>AI Assistant</strong></div>
          <div className="topbar-actions">
            <div className="live-status"><span className="status-dot" /> Assistant online</div>
            <button className="icon-button" onClick={() => setIsDarkMode((value) => !value)} aria-label="Toggle color theme"><Icon name={isDarkMode ? "sun" : "moon"} size={17} /></button>
            <button className="avatar top-avatar" aria-label="Account menu">NS</button>
          </div>
        </header>

        <section className="content-wrap">
          <div className="page-intro">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" /> FINORA ASSIST</p>
              <h1>Your smarter <em>banking</em> companion.</h1>
              <p className="intro-copy">Clear, confident answers for the decisions that move your money forward.</p>
            </div>
            <div className="intro-meta"><span className="meta-chip"><Icon name="shield" size={14} /> Your data stays private</span><button className="text-button" onClick={resetConversation}>Start fresh <Icon name="arrow" size={14} /></button></div>
          </div>

          <div className="dashboard-grid">
            <section className="assistant-card">
              <div className="assistant-card-header">
                <div className="assistant-identity"><div className="assistant-orb"><Icon name="spark" size={20} /></div><div><strong>Finora Assistant</strong><span>Powered by your banking knowledge base</span></div></div>
                <span className="secure-badge"><span className="status-dot" /> Ready to help</span>
              </div>

              <div className="chat-stream" aria-live="polite">
                {messages.map((message) => (
                  <div className={`message-row ${message.sender === "user" ? "user-row" : ""}`} key={message.id}>
                    {message.sender === "bot" && <div className="message-avatar"><Icon name="spark" size={14} /></div>}
                    <div className={`message-bubble ${message.sender === "user" ? "user-bubble" : "bot-bubble"} ${message.error ? "error-bubble" : ""}`}>
                      <p>{message.text}</p><span className="message-time">{message.time}</span>
                    </div>
                  </div>
                ))}
                {loading && <div className="message-row"><div className="message-avatar"><Icon name="spark" size={14} /></div><div className="message-bubble bot-bubble typing-bubble"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /><span className="typing-label">Thinking through it...</span></div></div>}
                <div ref={messagesEndRef} />
              </div>

              <div className="composer-wrap">
                <div className="composer">
                  <textarea value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); handleSend(); } }} placeholder="Ask anything about your banking..." rows="1" aria-label="Ask your banking question" />
                  <button className="send-button" onClick={() => handleSend()} disabled={!question.trim() || loading} aria-label="Send question"><Icon name="send" size={17} /></button>
                </div>
                <div className="composer-hint"><span>Press <kbd>Enter</kbd> to send</span><span>{messageCountLabel}</span></div>
              </div>
            </section>

            <aside className="insights-column">
              <div className="section-heading"><div><p className="eyebrow">GET STARTED</p><h2>What can I help with?</h2></div><span className="sparkle-small"><Icon name="spark" size={15} /></span></div>
              <div className="prompt-list">
                {quickPrompts.map((item) => <button className="prompt-card" key={item.label} onClick={() => handleSend(item.prompt)}><span className={`prompt-icon ${item.tone}`}>{item.icon}</span><span className="prompt-copy"><strong>{item.label}</strong><span>{item.prompt}</span></span><Icon name="arrow" size={16} /></button>)}
              </div>
              <div className="trust-card"><div className="trust-card-top"><span className="trust-icon"><Icon name="shield" size={17} /></span><span className="trust-check">● Protected</span></div><strong>Built for better decisions.</strong><p>Answers grounded in your bank’s policies, so you can act with confidence.</p><div className="trust-rule" /><div className="trust-footer"><span>Knowledge base</span><strong>Always learning <span>↗</span></strong></div></div>
            </aside>
          </div>

          <footer className="page-footer"><span>Finora Assist <span className="footer-dot">•</span> Banking intelligence, made clear.</span><span>For guidance only. Always review official terms.</span></footer>
        </section>
      </main>
    </div>
  );
}

export default App;
