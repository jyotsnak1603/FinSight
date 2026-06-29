import { runResearchAgent } from "./src/lib/agent/graph.js";

async function test() {
  console.log("Running research for 'spotify'...");
  const result = await runResearchAgent("spotify");
  console.log("Result:", JSON.stringify(result, null, 2));
}

test().catch(console.error);
