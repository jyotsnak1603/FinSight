import { researchGraph } from "@/lib/agent/graph";
import { headers } from "next/headers";

// ---------------------------------------------------------------------------
// In-memory LRU cache (max 50 reports, keyed by normalized company name)
// ---------------------------------------------------------------------------
const MAX_CACHE_SIZE = 50;
const reportCache = new Map();

function cacheGet(key) {
  if (!reportCache.has(key)) return null;
  // Move to end (most-recently-used)
  const value = reportCache.get(key);
  reportCache.delete(key);
  reportCache.set(key, value);
  return value;
}

function cacheSet(key, value) {
  if (reportCache.size >= MAX_CACHE_SIZE) {
    // Evict oldest entry
    reportCache.delete(reportCache.keys().next().value);
  }
  reportCache.set(key, value);
}

// ---------------------------------------------------------------------------
// Rate limiter — 5 requests per 10 minutes per IP
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count++;
  return false;
}

// ---------------------------------------------------------------------------
// Node display names for progress events
// ---------------------------------------------------------------------------
const NODE_DISPLAY_NAMES = {
  business_node: "Business Model",
  financials_node: "Financial Analysis",
  competition_node: "Competition Analysis",
  team_news_node: "Leadership & News",
  risks_node: "Risk Analysis",
  moat_node: "Moat Analysis",
  catalysts_node: "Catalyst Analysis",
  bull_case_node: "Bull Case",
  bear_case_node: "Bear Case",
  synthesis_node: "Investment Scoring",
  committee_node: "Investment Committee",
};

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------
export async function POST(req) {
  // --- Input validation ---
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const raw = body?.company;
  if (!raw || typeof raw !== "string") {
    return Response.json({ error: "Company name is required." }, { status: 400 });
  }

  // Sanitize: strip control chars, limit length
  const company = raw.replace(/[\x00-\x1f\x7f]/g, "").trim().slice(0, 100);
  if (!company) {
    return Response.json({ error: "Invalid company name." }, { status: 400 });
  }

  // --- Rate limiting ---
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return Response.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429 }
    );
  }

  const cacheKey = company.toLowerCase();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (payload) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
        );
      };

      try {
        // --- Cache hit: emit complete immediately ---
        const cached = cacheGet(cacheKey);
        if (cached) {
          emit({ event: "complete", data: cached, cached: true });
          controller.close();
          return;
        }

        // --- Run the graph with streaming ---
        const graphStream = await researchGraph.stream(
          {
            company,
            businessModel: null,
            financials: null,
            competition: null,
            teamAndNews: null,
            riskFactors: null,
            moatAnalysis: null,
            catalysts: null,
            bullCase: null,
            bearCase: null,
            scores: null,
            verdict: null,
            confidence: null,
            finalSummary: null,
            committeeDecision: null,
            steps: [],
            sources: [],
          },
          { streamMode: "updates" }
        );

        // Accumulate final state from per-node updates
        let finalData = {
          company,
          steps: [],
          sources: [],
        };

        for await (const chunk of graphStream) {
          // chunk = { "node_name": { ...node_return } }
          const entries = Object.entries(chunk);
          for (const [nodeName, update] of entries) {
            // Skip internal sync node
            if (nodeName === "gather_research") continue;

            // Merge update into accumulated state
            const { steps: newSteps, sources: newSources, ...rest } = update;
            Object.assign(finalData, rest);
            if (Array.isArray(newSteps)) {
              finalData.steps = [...finalData.steps, ...newSteps];
            }
            if (newSources !== undefined) {
              finalData.sources = newSources;
            }

            // Emit progress event to frontend
            const displayName = NODE_DISPLAY_NAMES[nodeName];
            if (displayName) {
              emit({ event: "node_complete", node: displayName });
            }
          }
        }

        // --- Cache and emit final result ---
        cacheSet(cacheKey, finalData);
        emit({ event: "complete", data: finalData, cached: false });
        controller.close();
      } catch (error) {
        // Log full error server-side, send generic message to client
        console.error("[FinSight] Research pipeline error:", error);
        emit({
          event: "error",
          message: "Research pipeline failed. Please try again.",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}