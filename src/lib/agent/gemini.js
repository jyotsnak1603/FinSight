import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error(
    "[FinSight] GOOGLE_API_KEY environment variable is not set. " +
    "Add it to your .env.local file."
  );
}

// Primary Model
const primaryLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.2,
  apiKey: process.env.GOOGLE_API_KEY,
  maxRetries: 0,
});

// First Fallback
const fallbackLlm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0.2,
  apiKey: process.env.GOOGLE_API_KEY,
  maxRetries: 1, 
});

// Custom LLM Router with built-in fallbacks
export const llm = {
  invoke: async (prompt) => {
    try {
      return await primaryLlm.invoke(prompt);
    } catch (error1) {
      console.log("[FinSight Fallback] 2.5-flash failed (likely rate limit). Switching to 1.5-flash...");
      try {
        return await fallbackLlm.invoke(prompt);
      } catch (error2) {
        console.log("[FinSight Fallback] 1.5-flash failed. Switching to Groq Llama-3...");
        if (process.env.GROQ_API_KEY) {
          // Delay to manage API rate limits (kept short to fit Vercel 60s limit)
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const ultimateLlm = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.1-8b-instant", // 20,000 TPM — 3x more headroom than 70B (6K TPM)
            temperature: 0.2,
            maxRetries: 2,
          });
          return await ultimateLlm.invoke(prompt);
        }
        throw error2;
      }
    }
  }
};