import { useEffect, useRef, useState } from "react";
import "./App.css";
import { askQuestion } from "./services/api";

const supportedTopics = [
  { label: "KYC documents", prompt: "Which documents do I need for KYC?", icon: "▤", tone: "mint" },
  { label: "FD policies", prompt: "What are the current FD policy options?", icon: "▣", tone: "amber" },
  { label: "Loan policies", prompt: "What loan policies should I know about?", icon: "◈", tone: "violet" },
  { label: "Loan eligibility", prompt: "How do I check my loan eligibility?", icon: "↗", tone: "blue" },
  { label: "EMI calculations", prompt: "Calculate EMI for a ₹5,00,000 loan at 8.5% for 5 years", icon: "◒", tone: "rose" },
  { label: "Policy comparison", prompt: "Compare the available banking policy options", icon: "⇄", tone: "slate" },
];

const initialMessage = {
  id: "welcome",
  sender: "bot",
  text: "Welcome to Banking AI Assistant. Ask me about KYC documents, FD policies, loan policies, loan eligibility, EMI calculations, or policy comparisons.",
  time: "Just now",
};

function Icon({ name, size = 18 }) {
  const paths = {
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.6 8.6 0 0 1-3.2-.6L4 20l1.5-3.8A7.3 7.3 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" strokeLinecap="round" /></>,
    spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    moon: <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    send: <><path d="m21 3-7.2 18-3.7-7.1L3 10.2 21 3Z" /><path d="M10.1 13.9 21 3" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
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
    setMessages((previous) => [...previous, { id: `user-${Date.now()}`, sender: "user", text: trimmedQuestion, time: "Just now" }]);
    setLoading(true);

    try {
      const answer = await askQuestion(trimmedQuestion);
      setMessages((previous) => [...previous, { id: `bot-${Date.now()}`, sender: "bot", text: typeof answer === "string" ? answer : JSON.stringify(answer), time: "Just now" }]);
    } catch (error) {
      console.error(error);
      setMessages((previous) => [...previous, { id: `error-${Date.now()}`, sender: "bot", text: "I couldn’t reach the Banking AI Assistant right now. Please try again in a moment.", time: "Just now", error: true }]);
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
          <div className="brand-copy"><strong>finora</strong><span>Banking AI Assistant</span></div>
          <button className="icon-button sidebar-close" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><Icon name="close" /></button>
        </div>

        <nav className="main-nav" aria-label="Assistant navigation">
          <p className="nav-label">Assistant</p>
          <button className="nav-item active"><Icon name="chat" /><span>Banking AI Assistant</span></button>
        </nav>

        <div className="topic-panel">
          <p className="nav-label">Supported topics</p>
          <div className="topic-list">
            {supportedTopics.map((topic) => <button className="topic-link" key={topic.label} onClick={() => { handleSend(topic.prompt); setMobileNavOpen(false); }}><span className={`topic-dot ${topic.tone}`} />{topic.label}</button>)}
          </div>
        </div>

        <div className="sidebar-tip"><div className="tip-icon"><Icon name="spark" size={17} /></div><div><strong>Ask a question</strong><p>Use everyday language and I’ll look through the banking assistant’s available guidance.</p></div></div>

        <div className="sidebar-footer"><div className="assistant-note"><span className="status-dot" /> <span>Chat assistant</span></div><div className="footer-caption">Policy guidance and calculations in one place.</div></div>
      </aside>

      {mobileNavOpen && <button className="mobile-overlay" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation overlay" />}

      <main className="main-area">
        <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Icon name="menu" /></button><div className="breadcrumb"><span>Finora</span><span className="breadcrumb-separator">/</span><strong>Banking AI Assistant</strong></div><div className="topbar-actions"><button className="icon-button" onClick={() => setIsDarkMode((value) => !value)} aria-label="Toggle color theme"><Icon name={isDarkMode ? "sun" : "moon"} size={17} /></button></div></header>

        <section className="content-wrap">
          <div className="page-intro"><div><p className="eyebrow"><span className="eyebrow-line" /> BANKING AI ASSISTANT</p><h1>Banking questions, made <em>simpler.</em></h1><p className="intro-copy">Get clear guidance on policies, eligibility, documents, and monthly loan payments.</p></div><div className="intro-meta"><span className="meta-chip">Ask about the topics shown below</span><button className="text-button" onClick={resetConversation}><Icon name="plus" size={14} /> New conversation</button></div></div>

          <div className="dashboard-grid">
            <section className="assistant-card">
              <div className="assistant-card-header"><div className="assistant-identity"><div className="assistant-orb"><Icon name="spark" size={20} /></div><div><strong>Banking AI Assistant</strong><span>Ask a question to get started</span></div></div><span className="chat-badge"><Icon name="chat" size={12} /> Chat</span></div>

              <div className="chat-stream" aria-live="polite">
                {messages.map((message) => <div className={`message-row ${message.sender === "user" ? "user-row" : ""}`} key={message.id}>{message.sender === "bot" && <div className="message-avatar"><Icon name="spark" size={14} /></div>}<div className={`message-bubble ${message.sender === "user" ? "user-bubble" : "bot-bubble"} ${message.error ? "error-bubble" : ""}`}><p>{message.text}</p><span className="message-time">{message.time}</span></div></div>)}
                {loading && <div className="message-row"><div className="message-avatar"><Icon name="spark" size={14} /></div><div className="message-bubble bot-bubble typing-bubble"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /><span className="typing-label">Thinking through it...</span></div></div>}
                <div ref={messagesEndRef} />
              </div>

              <div className="composer-wrap"><div className="composer"><textarea value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); handleSend(); } }} placeholder="Ask about KYC, loans, EMI, FD policies..." rows="1" aria-label="Ask your banking question" /><button className="send-button" onClick={() => handleSend()} disabled={!question.trim() || loading} aria-label="Send question"><Icon name="send" size={17} /></button></div><div className="composer-hint"><span>Press <kbd>Enter</kbd> to send</span><span>{messages.filter((message) => message.sender === "user").length} questions asked</span></div></div>
            </section>

            <aside className="insights-column"><div className="section-heading"><div><p className="eyebrow">GET STARTED</p><h2>Choose a banking topic</h2></div><span className="sparkle-small"><Icon name="spark" size={15} /></span></div><div className="prompt-list">{supportedTopics.map((topic) => <button className="prompt-card" key={topic.label} onClick={() => handleSend(topic.prompt)}><span className={`prompt-icon ${topic.tone}`}>{topic.icon}</span><span className="prompt-copy"><strong>{topic.label}</strong><span>{topic.prompt}</span></span><Icon name="arrow" size={16} /></button>)}</div><div className="topics-card"><div className="topics-card-top"><span className="topics-icon"><Icon name="chat" size={16} /></span><span className="topic-count">6 supported topics</span></div><strong>One assistant, practical answers.</strong><p>Start with one of the supported topics or write your question in your own words.</p><div className="topic-tags">{supportedTopics.slice(0, 3).map((topic) => <span key={topic.label}>{topic.label}</span>)}</div></div></aside>
          </div>

          <footer className="page-footer"><span>Finora Assist <span className="footer-dot">•</span> Banking AI Assistant</span><span>For guidance only. Review official terms before acting.</span></footer>
        </section>
      </main>
    </div>
  );
}

export default App;
