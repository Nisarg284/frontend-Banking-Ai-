import axios from "axios";

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL;

// Debugging: print what Vite exposes in the browser console (only in dev builds this will be useful)
try {
  // Use console.debug so it's less noisy; open browser devtools to inspect
  console.debug("import.meta.env:", import.meta.env);
  console.debug("VITE_BACKEND_URL:", rawBackendUrl);
} catch {
  // import.meta may not be available in some contexts; ignore silently
}

if (!rawBackendUrl) {
  console.warn(
    "VITE_BACKEND_URL is not set. Make sure you have a .env file at the project root with VITE_BACKEND_URL=... and restart the dev server. Falling back to http://localhost:8080"
  );
}

const API_BASE_URL = rawBackendUrl
  ? String(rawBackendUrl).replace(/\/+$/, "") // remove trailing slashes
  : "http://localhost:8081";

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