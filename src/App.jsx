import { useEffect, useRef, useState } from "react";
import "./App.css";
import { askQuestion } from "./services/api";

const starterPrompts = [
  { label: "KYC documents", prompt: "Which documents do I need for KYC?" },
  { label: "FD policies", prompt: "What are the current FD policy options?" },
  { label: "Loan eligibility", prompt: "How do I check my loan eligibility?" },
  { label: "Calculate EMI", prompt: "Calculate EMI for a ₹5,00,000 loan at 8.5% for 5 years" },
];

const initialMessage = {
  id: "welcome",
  sender: "bot",
  text: "Hi, I’m your Banking AI Assistant. Ask me about KYC documents, FD policies, loans, eligibility, EMI calculations, or policy comparisons.",
  time: "Just now",
};

function Icon({ name, size = 18 }) {
  const paths = {
    spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" /></>,
    moon: <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    send: <><path d="m21 3-7.2 18-3.7-7.1L3 10.2 21 3Z" /><path d="M10.1 13.9 21 3" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.6 8.6 0 0 1-3.2-.6L4 20l1.5-3.8A7.3 7.3 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" strokeLinecap="round" /></>,
  };
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function App() {
  const [messages, setMessages] = useState([initialMessage]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
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
      const errorText = error.code === "BACKEND_HTTP_ERROR"
        ? `The assistant server returned HTTP ${error.status}. The frontend is connected, but the backend needs attention.`
        : error.code === "BACKEND_TIMEOUT"
          ? "The assistant is taking too long to respond. Please try again shortly."
          : "The frontend could not reach the assistant. Please check the backend service and try again.";
      setMessages((previous) => [...previous, { id: `error-${Date.now()}`, sender: "bot", text: errorText, time: "Just now", error: true }]);
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
      <main className="chat-page">
        <section className="chat-intro"><p className="eyebrow">BANKING AI ASSISTANT</p><h1>How can I help?</h1><p>Ask about policies, documents, eligibility, or EMI calculations.</p></section>

        <section className="chat-card" aria-label="Banking AI Assistant chat">
          <div className="chat-card-header"><div className="assistant-title"><span className="assistant-icon"><Icon name="spark" size={16} /></span><div><h2>Banking AI Assistant</h2><p>Ask in your own words</p></div></div><div className="card-actions"><button className="icon-button" onClick={() => setIsDarkMode((value) => !value)} aria-label="Toggle color theme"><Icon name={isDarkMode ? "sun" : "moon"} size={17} /></button><button className="new-chat" onClick={resetConversation}><Icon name="plus" size={14} /><span>New chat</span></button></div></div>
          <div className="chat-stream" aria-live="polite">
            {messages.map((message) => <div className={`message-row ${message.sender === "user" ? "user-row" : ""}`} key={message.id}>{message.sender === "bot" && <span className="message-icon"><Icon name="spark" size={12} /></span>}<div className={`message-bubble ${message.sender === "user" ? "user-bubble" : "bot-bubble"} ${message.error ? "error-bubble" : ""}`}><p>{message.text}</p><time>{message.time}</time></div></div>)}
            {loading && <div className="message-row"><span className="message-icon"><Icon name="spark" size={12} /></span><div className="message-bubble bot-bubble typing-bubble"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /><span className="typing-label">Thinking...</span></div></div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="composer-area"><div className="composer"><textarea value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); handleSend(); } }} placeholder="Type your question..." rows="1" aria-label="Ask your banking question" /><button className="send-button" onClick={() => handleSend()} disabled={!question.trim() || loading} aria-label="Send question"><Icon name="send" size={16} /></button></div><div className="composer-hint"><span>Press <kbd>Enter</kbd> to send</span><span>{messages.filter((message) => message.sender === "user").length} asked</span></div></div>
        </section>

        <section className="starter-section" aria-labelledby="starter-heading"><div className="starter-heading"><h2 id="starter-heading">Try asking</h2><span>Common topics</span></div><div className="starter-list">{starterPrompts.map((topic) => <button className="starter-pill" key={topic.label} onClick={() => handleSend(topic.prompt)}><span>{topic.label}</span><Icon name="arrow" size={14} /></button>)}</div></section>
        <footer className="page-footer"><span>Finora <i>•</i> Banking AI Assistant</span><span>Review official terms before acting.</span></footer>
      </main>
    </div>
  );
}

export default App;
