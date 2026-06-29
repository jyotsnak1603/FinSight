import { tavily } from "@tavily/core";

if (!process.env.TAVILY_API_KEY) {
  throw new Error(
    "[FinSight] TAVILY_API_KEY environment variable is not set. " +
    "Add it to your .env.local file."
  );
}

const client = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export async function searchWeb(query) {
  const result = await client.search(query, {
    maxResults: 5,
  });

  return result.results;
}