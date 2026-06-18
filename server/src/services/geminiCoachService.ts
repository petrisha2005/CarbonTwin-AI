import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { safeJsonParse } from "../utils/safeJsonParse.js";
import type { CoachCategory, CoachPreferences, CoachRecommendation } from "./coachTypes.js";

type CoachAnalysis = Awaited<ReturnType<typeof import("./coachAnalysisService.js").buildCoachAnalysis>>;

const categories: CoachCategory[] = ["transport", "electricity", "food", "shoppingWaste"];

function isValidRecommendation(value: any): value is CoachRecommendation {
  return Boolean(
    value &&
      typeof value.coachMessage === "string" &&
      typeof value.summary === "string" &&
      categories.includes(value.highestImpactCategory) &&
      Array.isArray(value.weeklyPlan) &&
      Array.isArray(value.quickActions) &&
      value.habitSwap &&
      value.carbonReductionTarget &&
      typeof value.motivationalLine === "string"
  );
}

export async function generateGeminiCoachRecommendations(analysis: CoachAnalysis, preferences: CoachPreferences): Promise<CoachRecommendation> {
  if (!env.geminiApiKey) throw new Error("GEMINI_API_KEY is not configured");

  const modelName = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  const prompt = `You are the AI Eco Coach inside CarbonTwin AI.
Use only the provided real user data. Do not invent logs, rewards, or categories.
Return strict JSON only. No markdown.

Exact JSON shape:
{
  "coachMessage": "string",
  "summary": "string",
  "highestImpactCategory": "transport|electricity|food|shoppingWaste",
  "weeklyPlan": [{"day":"Monday","action":"string","category":"transport|electricity|food|shoppingWaste","estimatedCO2Saving":2.5,"difficulty":"easy|medium|challenge","reason":"string"}],
  "quickActions": [{"title":"string","category":"transport|electricity|food|shoppingWaste","estimatedCO2Saving":1.5,"difficulty":"easy|medium|challenge","timeRequired":"string","cost":"free|low_cost|paid","whyThisHelps":"string"}],
  "habitSwap": {"from":"string","to":"string","estimatedCO2Saving":2.5,"reason":"string"},
  "carbonReductionTarget": {"targetKg":5,"timeframe":"next 7 days","baselineKg":20},
  "motivationalLine": "string",
  "basedOnData": true,
  "source": "gemini"
}

Rules:
- weeklyPlan must have 7 days.
- Respect mood, difficultyPreference, and budgetPreference.
- If budgetPreference is free_only or mood is broke, do not suggest paid actions.
- Keep suggestions specific to the highest-impact real category.
- If latestLogHadNoTravel is true, mention the zero travel impact positively and do not suggest reducing travel for that day.

Preferences: ${JSON.stringify(preferences)}
Real analysis: ${JSON.stringify({
  user: analysis.user,
  latestLog: analysis.latestLog,
  last7Days: analysis.last7Days,
  currentMonthLogs: analysis.currentMonthLogs,
  categoryTotals: analysis.categoryTotals,
  highestImpactCategory: analysis.highestImpactCategory,
  latestLogHadNoTravel: analysis.latestLogHadNoTravel,
  zeroTravelMessage: analysis.zeroTravelMessage,
  averageDailyCO2: analysis.averageDailyCO2,
  weeklyCO2: analysis.weeklyCO2,
  weeklySaved: analysis.weeklySaved,
  loggingConsistency: analysis.loggingConsistency,
  strongestHabit: analysis.strongestHabit,
  improvementOpportunity: analysis.improvementOpportunity,
  twin: analysis.twin
})}`;

  const result = await model.generateContent(prompt);
  const parsed = safeJsonParse<CoachRecommendation>(result.response.text());
  if (!isValidRecommendation(parsed)) throw new Error("Gemini returned invalid coach JSON");
  return { ...parsed, basedOnData: true, source: "gemini" };
}
