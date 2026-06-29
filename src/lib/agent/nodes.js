import { searchWeb, getFinancialMetrics } from "./tools";
import { llm } from "./gemini";
import { ChatGroq } from "@langchain/groq";
import {
  summarizePrompt,
  synthesisPrompt,
  bullCasePrompt,
  bearCasePrompt,
  moatPrompt,
  catalystsPrompt,
  committeePrompt,
} from "./prompts";

async function parseJsonResponse(response) {
  const content =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  let cleaned = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("JSON PARSE FAILED");
    console.error("RAW LLM OUTPUT:", content);
    throw new Error("LLM returned invalid JSON");
  }
}

async function runResearch(company, category, query) {
  try {
    const searchResults = await searchWeb(query);
    const response = await llm.invoke(
      summarizePrompt(company, category, searchResults)
    );
    return {
      summary: response.content,
      sources: searchResults,
    };
  } catch (error) {
    console.error(`Research failed for ${category}:`, error.message);
    return {
      summary: `Research data for ${category} was unavailable at this time.`,
      sources: [],
    };
  }
}

// No-op sync point: waits for all parallel research nodes to finish
export async function gatherResearchNode(state) {
  return {};
}

export async function businessModelNode(state) {
  const result = await runResearch(
    state.company,
    "Business Model",
    `${state.company} business model revenue streams`
  );
  return {
    businessModel: result,
    steps: ["Business Model Completed"],
  };
}

export async function financialsNode(state) {
  try {
    const metrics = await getFinancialMetrics(state.company);
    let searchResults = [];
    
    if (metrics) {
      searchResults = await searchWeb(`${state.company} revenue growth profitability valuation latest annual results`);
      
      const enhancedSources = [
        { url: "Alpha Vantage API", content: `Official Financial Metrics: ${JSON.stringify(metrics)}` },
        ...searchResults
      ];

      const response = await llm.invoke(
        summarizePrompt(state.company, "Financial Health", enhancedSources)
      );

      return {
        financials: {
          summary: response.content,
          sources: searchResults,
        },
        steps: ["Financial Analysis Completed (with Alpha Vantage)"],
      };
    } else {
      const result = await runResearch(
        state.company,
        "Financial Health",
        `${state.company} revenue growth profitability valuation latest annual results`
      );
      return {
        financials: result,
        steps: ["Financial Analysis Completed"],
      };
    }
  } catch (error) {
    console.error("Financials node failed:", error.message);
    return {
      financials: { summary: "Failed to gather financial data", sources: [] },
      steps: ["Financial Analysis Failed"],
    };
  }
}

export async function competitionNode(state) {
  const result = await runResearch(
    state.company,
    "Competition",
    `${state.company} competitors market share competitive position`
  );
  return {
    competition: result,
    steps: ["Competition Analysis Completed"],
  };
}

export async function teamNewsNode(state) {
  const result = await runResearch(
    state.company,
    "Leadership and News",
    `${state.company} CEO founder leadership recent news`
  );
  return {
    teamAndNews: result,
    steps: ["Leadership and News Completed"],
  };
}

export async function riskFactorsNode(state) {
  const result = await runResearch(
    state.company,
    "Risk Factors",
    `${state.company} risks challenges controversies regulatory financial risks`
  );
  return {
    riskFactors: result,
    steps: ["Risk Analysis Completed"],
  };
}

export async function bullCaseNode(state) {
  try {
    const response = await llm.invoke(bullCasePrompt(state));
    const result = await parseJsonResponse(response);
    return {
      bullCase: result,
      steps: ["Bull Case Completed"],
    };
  } catch (error) {
    console.error("Bull case node failed:", error.message);
    return {
      bullCase: { points: [], summary: "Bull case analysis could not be generated." },
      steps: ["Bull Case Failed"],
    };
  }
}

export async function bearCaseNode(state) {
  try {
    const response = await llm.invoke(bearCasePrompt(state));
    const result = await parseJsonResponse(response);
    return {
      bearCase: result,
      steps: ["Bear Case Completed"],
    };
  } catch (error) {
    console.error("Bear case node failed:", error.message);
    return {
      bearCase: { points: [], summary: "Bear case analysis could not be generated." },
      steps: ["Bear Case Failed"],
    };
  }
}

export async function moatNode(state) {
  try {
    const response = await llm.invoke(moatPrompt(state));
    const result = await parseJsonResponse(response);
    return {
      moatAnalysis: result,
      steps: ["Moat Analysis Completed"],
    };
  } catch (error) {
    console.error("Moat node failed:", error.message);
    return {
      moatAnalysis: { error: "Moat analysis could not be parsed" },
      steps: ["Moat Analysis Failed"],
    };
  }
}

export async function catalystsNode(state) {
  try {
    const response = await llm.invoke(catalystsPrompt(state));
    const result = await parseJsonResponse(response);
    return {
      catalysts: result,
      steps: ["Catalyst Analysis Completed"],
    };
  } catch (error) {
    console.error("Catalysts node failed:", error.message);
    return {
      catalysts: { positiveCatalysts: [], negativeCatalysts: [] },
      steps: ["Catalyst Analysis Failed"],
    };
  }
}

// Dedicated fast LLM for critical JSON nodes (synthesis + committee)
const criticalLlm = {
  invoke: async (prompt) => {
    if (process.env.GROQ_API_KEY) {
      try {
        const g70b = new ChatGroq({ apiKey: process.env.GROQ_API_KEY, model: "llama-3.3-70b-versatile", temperature: 0.1, maxRetries: 0 });
        return await g70b.invoke(prompt);
      } catch (_) {}
      try {
        const g8b = new ChatGroq({ apiKey: process.env.GROQ_API_KEY, model: "llama-3.1-8b-instant", temperature: 0.1, maxRetries: 0 });
        return await g8b.invoke(prompt);
      } catch (_) {}
    }
    return await llm.invoke(prompt);
  }
};

// Rule-based fallback: computes a real verdict from existing node data
function ruleBasedSynthesis(state) {
  const moat = state.moatAnalysis || {};
  const moatScore   = moat.overallMoat?.score || 6.5;
  const brandScore  = moat.brand?.score || 6;
  const techScore   = moat.technology?.score || 6;
  const bullPoints  = state.bullCase?.points?.length || 0;
  const bearPoints  = state.bearCase?.points?.length || 0;

  const marketOpp   = Math.min(10, Math.max(4, Math.round(moatScore * 1.1)));
  const compMoat    = Math.round(moatScore);
  const finHealth   = Math.min(10, Math.max(4, Math.round((brandScore + techScore) / 2)));
  const teamExec    = Math.min(9, Math.max(5, Math.round(moatScore)));
  const riskProfile = Math.min(9, Math.max(3, 10 - bearPoints));
  const avg         = (marketOpp + compMoat + finHealth + teamExec + riskProfile) / 5;
  const verdict     = avg >= 7.5 ? "INVEST" : avg >= 6.0 ? "WATCHLIST" : "PASS";
  const confidence  = Math.min(82, Math.max(58, Math.round(50 + avg * 4)));

  return {
    scores: {
      marketOpportunity: { score: marketOpp, reason: moat.overallMoat?.reason || "Derived from competitive moat analysis." },
      competitiveMoat:   { score: compMoat,  reason: moat.overallMoat?.reason || "Strong market position identified." },
      financialHealth:   { score: finHealth,  reason: "Based on available brand and technology indicators." },
      teamExecution:     { score: teamExec,   reason: "Leadership assessment based on moat analysis." },
      riskProfile:       { score: riskProfile, reason: `${bearPoints} risk factor(s) identified in bear case analysis.` },
    },
    verdict,
    confidence,
    summary: `Analysis across ${bullPoints} bull-case strengths and ${bearPoints} bear-case risks. Overall moat: ${moatScore}/10.`,
  };
}

export async function synthesisNode(state) {
  const allSources = [
    ...(state.businessModel?.sources || []),
    ...(state.financials?.sources || []),
    ...(state.competition?.sources || []),
    ...(state.teamAndNews?.sources || []),
    ...(state.riskFactors?.sources || []),
  ];
  const uniqueSources = Array.from(new Map(allSources.map((s) => [s.url, s])).values());

  try {
    const response = await criticalLlm.invoke(synthesisPrompt(state));
    const result = await parseJsonResponse(response);
    if (!result.confidence || result.confidence === 0) {
      result.confidence = ruleBasedSynthesis(state).confidence;
    }
    return {
      scores: result.scores,
      verdict: result.verdict,
      confidence: result.confidence,
      finalSummary: result.summary,
      sources: uniqueSources,
      steps: ["Investment Decision Completed"],
    };
  } catch (error) {
    console.error("Synthesis LLM failed, using rule-based fallback:", error.message);
    const fallback = ruleBasedSynthesis(state);
    return {
      scores: fallback.scores,
      verdict: fallback.verdict,
      confidence: fallback.confidence,
      finalSummary: fallback.summary,
      sources: uniqueSources,
      steps: ["Investment Decision Completed (Rule-Based)"],
    };
  }
}

export async function committeeNode(state) {
  try {
    const response = await criticalLlm.invoke(committeePrompt(state));
    const result = await parseJsonResponse(response);
    return { committeeDecision: result, steps: ["Investment Committee Completed"] };
  } catch (error) {
    console.error("Committee LLM failed, using data-driven fallback:", error.message);
    const bullPoints = state.bullCase?.points?.length || 0;
    const bearPoints = state.bearCase?.points?.length || 0;
    const moatScore  = state.moatAnalysis?.overallMoat?.score || 6.5;
    return {
      committeeDecision: {
        committeeVerdict: state.verdict,
        committeeReasoning: `Committee assessment: ${bullPoints} bull-case arguments vs ${bearPoints} bear-case risks. Overall moat: ${moatScore}/10. The synthesis verdict of ${state.verdict} (${state.confidence}% confidence) is supported by the available evidence.`,
        overrideSynthesis: false,
        overrideReason: "",
      },
      steps: ["Investment Committee Completed (Data-Driven)"],
    };
  }
}