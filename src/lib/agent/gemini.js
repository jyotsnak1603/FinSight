import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error(
    "[AlphaForge] GOOGLE_API_KEY environment variable is not set. " +
    "Add it to your .env.local file."
  );
}

export const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.2,
  apiKey: process.env.GOOGLE_API_KEY,
});