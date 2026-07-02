import { StateGraph, START, END, Annotation } from "@langchain/langgraph";

import {
  businessModelNode,
  financialsNode,
  competitionNode,
  teamNewsNode,
  riskFactorsNode,
  gatherResearchNode,
  bullCaseNode,
  bearCaseNode,
  moatNode,
  catalystsNode,
  committeeNode,
  synthesisNode,
} from "./nodes";

const AgentState = Annotation.Root({
  company: Annotation(),

  businessModel: Annotation(),
  financials: Annotation(),
  competition: Annotation(),
  teamAndNews: Annotation(),
  riskFactors: Annotation(),

  moatAnalysis: Annotation(),
  catalysts: Annotation(),

  bullCase: Annotation(),
  bearCase: Annotation(),

  scores: Annotation(),
  verdict: Annotation(),
  confidence: Annotation(),
  finalSummary: Annotation(),

  committeeDecision: Annotation(),

  // Array-append reducer: each node returns steps: ["Step Name"]
  // and this reducer concatenates all of them safely across parallel branches.
  steps: Annotation({
    reducer: (x, y) => [
      ...(Array.isArray(x) ? x : []),
      ...(Array.isArray(y) ? y : y != null ? [y] : []),
    ],
    default: () => [],
  }),

  sources: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
});

const workflow = new StateGraph(AgentState)
  // Register all nodes
  .addNode("business_node", businessModelNode)
  .addNode("financials_node", financialsNode)
  .addNode("competition_node", competitionNode)
  .addNode("team_news_node", teamNewsNode)
  .addNode("risks_node", riskFactorsNode)
  .addNode("gather_research", gatherResearchNode)
  .addNode("moat_node", moatNode)
  .addNode("catalysts_node", catalystsNode)
  .addNode("bull_case_node", bullCaseNode)
  .addNode("bear_case_node", bearCaseNode)
  .addNode("synthesis_node", synthesisNode)
  .addNode("committee_node", committeeNode)

  // --- Phase 1: Sequential Research (avoid rate limits) ---
  .addEdge(START, "business_node")
  .addEdge("business_node", "financials_node")
  .addEdge("financials_node", "competition_node")
  .addEdge("competition_node", "team_news_node")
  .addEdge("team_news_node", "risks_node")
  .addEdge("risks_node", "gather_research")

  // --- Phase 2: Sequential Analysis (each depends on prior output) ---
  .addEdge("gather_research", "moat_node")
  .addEdge("moat_node", "catalysts_node")
  .addEdge("catalysts_node", "bull_case_node")
  .addEdge("bull_case_node", "bear_case_node")
  .addEdge("bear_case_node", "synthesis_node")

  // --- Final verdict ---
  .addEdge("synthesis_node", "committee_node")
  .addEdge("committee_node", END);

export const researchGraph = workflow.compile();

export async function runResearchAgent(company) {
  return await researchGraph.invoke({
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
  });
}