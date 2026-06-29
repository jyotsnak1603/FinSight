import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error(
    "[FinSight] GOOGLE_API_KEY environment variable is not set. " +
    "Add it to your .env.local file."
  );
}

// 1. Primary Model: Smartest, but highly rate-limited (20/day)
const primaryLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.2,
  apiKey: process.env.GOOGLE_API_KEY,
  maxRetries: 0, // Fail instantly if rate limited
});

// 2. First Fallback: Very smart, huge quota (1,500/day)
const fallbackLlm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0.2,
  apiKey: process.env.GOOGLE_API_KEY,
  maxRetries: 1, 
});

// Export a robust custom wrapper that guarantees the fallback cascade
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
          // Artificial 8-second delay to prevent hitting Groq's strict 12,000 Tokens/Minute limit
          await new Promise(resolve => setTimeout(resolve, 8000));
          
          const ultimateLlm = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.3-70b-versatile", // Using 70B for highly accurate JSON now that TPM is solved
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