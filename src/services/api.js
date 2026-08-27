import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || "https://banking-ai-assistant-zeuk.onrender.com").replace(/\/+$/, "");

export const askQuestion = async (question) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/assistant/ask`, question, {
      headers: { "Content-Type": "text/plain" },
      timeout: 60000,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const backendError = new Error(`The Banking AI Assistant returned HTTP ${error.response.status}.`);
      backendError.code = "BACKEND_HTTP_ERROR";
      backendError.status = error.response.status;
      throw backendError;
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      const timeoutError = new Error("The Banking AI Assistant took too long to respond.");
      timeoutError.code = "BACKEND_TIMEOUT";
      throw timeoutError;
    }

    const networkError = new Error("The frontend could not reach the Banking AI Assistant.");
    networkError.code = "NETWORK_ERROR";
    throw networkError;
  }
};
