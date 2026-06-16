import {useEffect, useRef} from "react";



function ChatMessage({ message }) {

    return (
        <div
            className={
                message.sender === "user"
                    ? "message user-message"
                    : "message bot-message"
            }
        >
                {message.text}
        </div>
    );
}

export default ChatMessage;