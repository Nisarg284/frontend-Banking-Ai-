import { useState } from "react";

function ChatInput({ onSend }) {

    const [question, setQuestion] = useState("");

    const handleSend = () => {

        if (!question.trim()) {
            return;
        }

        onSend(question);

        setQuestion("");
    };

    return (
        <div className="input-container">

            <input
                type="text"
                placeholder="Ask your banking question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSend();
                    }
                }}
            />

            <button onClick={handleSend}>
                Send
            </button>

        </div>
    );
}

export default ChatInput;