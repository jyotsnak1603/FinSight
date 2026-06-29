import { searchWeb, getFinancialMetrics } from "./tools";
import { llm } from "./gemini";
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
    await new Promise(r => setTimeout(r, 3000)); // stagger to avoid TPM collision
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
    await new Promise(r => setTimeout(r, 3000)); // stagger to avoid TPM collision
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

export async function synthesisNode(state) {
  try {
    const response = await llm.invoke(synthesisPrompt(state));
    const result = await parseJsonResponse(response);

    const allSources = [
      ...(state.businessModel?.sources || []),
      ...(state.financials?.sources || []),
      ...(state.competition?.sources || []),
      ...(state.teamAndNews?.sources || []),
      ...(state.riskFactors?.sources || []),
    ];

    const uniqueSources = Array.from(
      new Map(allSources.map((source) => [source.url, source])).values()
    );

    return {
      scores: result.scores,
      verdict: result.verdict,
      confidence: result.confidence,
      finalSummary: result.summary,
      sources: uniqueSources,
      steps: ["Investment Decision Completed"],
    };
  } catch (error) {
    console.error("Synthesis node failed:", error.message);
    return {
      scores: null,
      verdict: "PASS",
      confidence: 0,
      finalSummary: "Synthesis failed. Unable to produce a complete investment decision.",
      sources: [],
      steps: ["Investment Decision Failed"],
    };
  }
}

export async function committeeNode(state) {
  try {
    const response = await llm.invoke(committeePrompt(state));
    const result = await parseJsonResponse(response);
    return {
      committeeDecision: result,
      steps: ["Investment Committee Completed"],
    };
  } catch (error) {
    console.error("Committee node failed:", error.message);
    return {
      committeeDecision: {
        committeeVerdict: state.verdict,
        committeeReasoning:
          "Committee review failed. Synthesis verdict was retained unchanged.",
        overrideSynthesis: false,
        overrideReason: "",
      },
      steps: ["Investment Committee Fallback Used"],
    };
  }
}