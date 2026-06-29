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

if (!process.env.ALPHA_VANTAGE_API_KEY) {
  console.warn("[FinSight] ALPHA_VANTAGE_API_KEY is not set. Financial metrics will fallback to web search.");
}

export async function getFinancialMetrics(ticker) {
  if (!process.env.ALPHA_VANTAGE_API_KEY) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    // Alpha Vantage returns an empty object or an error message if invalid/rate-limited
    if (Object.keys(data).length === 0 || data.Information || data["Error Message"]) {
      return null;
    }
    
    return {
      Description: data.Description,
      Sector: data.Sector,
      Industry: data.Industry,
      MarketCap: data.MarketCapitalization,
      PE_Ratio: data.PERatio,
      PEG_Ratio: data.PEGRatio,
      EBITDA: data.EBITDA,
      DividendYield: data.DividendYield,
      ProfitMargin: data.ProfitMargin,
      ReturnOnEquityTTM: data.ReturnOnEquityTTM,
      RevenueTTM: data.RevenueTTM,
      GrossProfitTTM: data.GrossProfitTTM,
      QuarterlyEarningsGrowthYOY: data.QuarterlyEarningsGrowthYOY,
      QuarterlyRevenueGrowthYOY: data.QuarterlyRevenueGrowthYOY,
      AnalystTargetPrice: data.AnalystTargetPrice,
      FiftyTwoWeekHigh: data["52WeekHigh"],
      FiftyTwoWeekLow: data["52WeekLow"],
    };
  } catch (e) {
    console.error("[FinSight] Alpha Vantage error:", e);
    return null;
  }
}