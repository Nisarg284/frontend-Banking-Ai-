import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

export const askQuestion = async (question) => {
    const response = await axios.post(
        `${API_BASE_URL}/assistant/ask`,
        question,
        {
            headers: {
                "Content-Type": "text/plain"
            }
        }
    );

    return response.data;
};