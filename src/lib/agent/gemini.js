import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error(
    "[FinSight] GOOGLE_API_KEY environment variable is not set. " +
    "Add it to your .env.local file."
  );
}

// All models set maxRetries: 0 — fail fast, never wait on exponential backoff
const gemini25 = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.2,
  apiKey: process.env.GOOGLE_API_KEY,
  maxRetries: 0,
});

const gemini15 = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0.2,
  apiKey: process.env.GOOGLE_API_KEY,
  maxRetries: 0, // Was 1 — exponential backoff was eating 10-20s per node
});

const groq8b = process.env.GROQ_API_KEY
  ? new ChatGroq({ apiKey: process.env.GROQ_API_KEY, model: "llama-3.1-8b-instant", temperature: 0.2, maxRetries: 0 })
  : null;

// Standard router: Gemini 2.5 → Gemini 1.5 → Groq 8b (fast, high TPM)
export const llm = {
  invoke: async (prompt) => {
    let lastError;
    try { return await gemini25.invoke(prompt); } catch (e) { lastError = e; console.warn("[LLM] Gemini 2.5 failed:", e.message); }
    try { return await gemini15.invoke(prompt); } catch (e) { lastError = e; console.warn("[LLM] Gemini 1.5 failed:", e.message); }
    if (groq8b) {
      try { return await groq8b.invoke(prompt); } catch (e) { lastError = e; console.warn("[LLM] Groq failed:", e.message); }
    }
    throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`);
  }
};