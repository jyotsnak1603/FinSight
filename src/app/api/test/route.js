import { searchWeb } from "@/lib/agent/tools";
import { llm } from "@/lib/agent/gemini";

export async function GET() {
  try {
    const searchResults = await searchWeb(
      "Tesla business model revenue streams"
    );

    const response = await llm.invoke(
      `Summarize Tesla's business model in 3 bullet points using this data: ${JSON.stringify(
        searchResults
      )}`
    );

    return Response.json({
      success: true,
      tavilyResults: searchResults,
      geminiResponse: response.content,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}