const trim = (text, max = 800) => (text || "No data available.").slice(0, max);

export const summarizePrompt = (company, category, searchResults) => `You are an expert investment researcher.

Company: ${company}

Research Category:
${category}

Search Results:
${JSON.stringify(searchResults)}

Provide a concise, evidence-based analysis in 2-3 paragraphs.
Mention important facts, risks, and signals. Avoid hype.
If the Search Results are empty or irrelevant, simply state that no meaningful data could be found for this company in this category.
`;

export const bullCasePrompt = (state) => `
You are an investment analyst building the bull case for ${state.company}.

Use the research below:

BUSINESS MODEL: ${trim(state.businessModel?.summary)}
FINANCIAL HEALTH: ${trim(state.financials?.summary)}
COMPETITION: ${trim(state.competition?.summary)}
LEADERSHIP & NEWS: ${trim(state.teamAndNews?.summary)}
RISKS: ${trim(state.riskFactors?.summary)}

Return ONLY valid JSON:

{
  "points": [
    {
      "title": "",
      "reason": ""
    }
  ],
  "summary": ""
}

Give 3-5 strong bull-case points.
`;

export const bearCasePrompt = (state) => `
You are an investment analyst building the bear case for ${state.company}.

Use the research below:

BUSINESS MODEL: ${trim(state.businessModel?.summary)}
FINANCIAL HEALTH: ${trim(state.financials?.summary)}
COMPETITION: ${trim(state.competition?.summary)}
LEADERSHIP & NEWS: ${trim(state.teamAndNews?.summary)}
RISKS: ${trim(state.riskFactors?.summary)}

Return ONLY valid JSON:

{
  "points": [
    {
      "title": "",
      "reason": ""
    }
  ],
  "summary": ""
}

Give 3-5 serious bear-case points.
`;

export const synthesisPrompt = (state) => `
You are a senior investment analyst.

Analyze the following research about ${state.company}.

BUSINESS MODEL: ${trim(state.businessModel?.summary)}
FINANCIAL HEALTH: ${trim(state.financials?.summary)}
COMPETITION: ${trim(state.competition?.summary)}
LEADERSHIP & NEWS: ${trim(state.teamAndNews?.summary)}
RISKS: ${trim(state.riskFactors?.summary)}
BULL CASE: ${trim(JSON.stringify(state.bullCase))}
BEAR CASE: ${trim(JSON.stringify(state.bearCase))}

Score the company on:
1. Market Opportunity (1-10)
2. Competitive Moat (1-10)
3. Financial Health (1-10)
4. Team & Execution (1-10)
5. Risk Profile (1-10)

Choose ONLY ONE verdict: INVEST, WATCHLIST, or PASS.
- INVEST = strong upside with acceptable risk
- WATCHLIST = promising but needs monitoring  
- PASS = risk too high or weak investment case

For confidence: Use a number between 55 and 95. NEVER use 0. Base it on data quality and strength of evidence.

Return ONLY valid JSON:

{
  "scores": {
    "marketOpportunity": { "score": 0, "reason": "" },
    "competitiveMoat": { "score": 0, "reason": "" },
    "financialHealth": { "score": 0, "reason": "" },
    "teamExecution": { "score": 0, "reason": "" },
    "riskProfile": { "score": 0, "reason": "" }
  },
  "verdict": "INVEST | WATCHLIST | PASS",
  "confidence": 0,
  "summary": ""
}
`;

export const moatPrompt = (state) => `
You are a venture capital analyst.

Analyze the competitive moat of ${state.company}.

BUSINESS MODEL: ${trim(state.businessModel?.summary)}
FINANCIAL HEALTH: ${trim(state.financials?.summary)}
COMPETITION: ${trim(state.competition?.summary)}
LEADERSHIP & NEWS: ${trim(state.teamAndNews?.summary)}
RISKS: ${trim(state.riskFactors?.summary)}

Return ONLY valid JSON:

{
  "brand": { "score": 0, "reason": "" },
  "technology": { "score": 0, "reason": "" },
  "networkEffects": { "score": 0, "reason": "" },
  "switchingCosts": { "score": 0, "reason": "" },
  "overallMoat": { "score": 0, "reason": "" }
}
`;

export const catalystsPrompt = (state) => `
You are an investment analyst.

Identify future catalysts for ${state.company}.

BUSINESS MODEL: ${trim(state.businessModel?.summary)}
FINANCIAL HEALTH: ${trim(state.financials?.summary)}
COMPETITION: ${trim(state.competition?.summary)}
LEADERSHIP & NEWS: ${trim(state.teamAndNews?.summary)}
RISKS: ${trim(state.riskFactors?.summary)}

Return ONLY valid JSON:

{
  "positiveCatalysts": [
    { "title": "", "impact": "" }
  ],
  "negativeCatalysts": [
    { "title": "", "impact": "" }
  ]
}
`;

export const committeePrompt = (state) => `
You are an investment committee acting as a Devil's Advocate.

The synthesis analyst produced this verdict: ${state.verdict} (confidence: ${state.confidence}%)

Your role is to critically challenge this verdict. Look specifically for evidence the synthesis analyst may be WRONG:
- If verdict is INVEST: search hard for overlooked risks, red flags, or overvalued assumptions that could make this a WATCHLIST or PASS.
- If verdict is WATCHLIST: look for strong evidence in either direction that should force a decisive call.
- If verdict is PASS: look for underappreciated upside or hidden value that may have been dismissed.

Only OVERRIDE the synthesis verdict if you find STRONG contradicting evidence. Confirmation without new insight is not sufficient grounds for override.

Research Summary:
${state.finalSummary}

Bull Case:
${JSON.stringify(state.bullCase)}

Bear Case:
${JSON.stringify(state.bearCase)}

Moat Analysis:
${JSON.stringify(state.moatAnalysis)}

Catalysts:
${JSON.stringify(state.catalysts)}

Choose ONLY ONE final verdict:
INVEST
WATCHLIST
PASS

Return ONLY valid JSON:

{
  "committeeVerdict": "",
  "committeeReasoning": "",
  "overrideSynthesis": false,
  "overrideReason": ""
}
`;