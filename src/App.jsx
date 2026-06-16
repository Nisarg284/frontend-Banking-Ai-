import { useState, useEffect, useRef } from "react";
import "./App.css";

import ChatInput from "./components/ChatInput";
import ChatMessage from "./components/ChatMessage";
import FeaturePanel from "./components/FeaturePanel";

import { askQuestion } from "./services/api";

function App() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: `🏦 Welcome to Banking AI Assistant

I can help you with:

• KYC Documents
• FD Policies
• Loan Policies
• Loan Eligibility
• EMI Calculations
• Policy Comparisons`
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef(null);

  // Local Storage se pehle ka theme load karne ke liye
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
    }
  }, []);

  // Jab bhi isDarkMode change ho, Body par class lagao aur save karo
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  const handleSend = async (question) => {
    const userMessage = { sender: "user", text: question };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const answer = await askQuestion(question);
      const botMessage = { sender: "bot", text: answer };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { sender: "bot", text: "Unable to connect to Banking Assistant." };
      setMessages(prev => [...prev, errorMessage]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="app-layout">
        <FeaturePanel onQuickQuestion={handleSend} />

        <div className="chat-section">

          <div className="chat-header">
            <div className="header-content">
              <h1>🏦 Banking AI Assistant</h1>
              <p className="tech-stack">
                Spring Boot • LangChain4j • RAG • Tool Calling
              </p>
            </div>
            <button
                className="theme-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                title="Toggle Dark Mode"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>

          <div className="chat-container">
            {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
            ))}

            {loading && (
                <div className="typing-indicator">
                  Banking Assistant is typing...
                </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          <ChatInput onSend={handleSend} />
        </div>
      </div>
  );
}

export default App;