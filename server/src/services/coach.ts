import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { carbonPersonality } from "../utils/carbon.js";

type CoachContext = {
  latestLog: any;
  user: any;
};

function fallbackRecommendations(context: CoachContext) {
  const profile = carbonPersonality(context.latestLog);
  const category = profile.mainProblem;
  const actions = [
    {
      title: profile.weeklyAction,
      impact: "High",
      difficulty: "Easy",
      estimatedSaving: "2-5 kg CO2/week",
      why: profile.strategy
    },
    {
      title: "Set a two-day low-carbon streak",
      impact: "Medium",
      difficulty: "Easy",
      estimatedSaving: "3 kg CO2/week",
      why: "Small repeated wins are easier to maintain than one large lifestyle change."
    },
    {
      title: "Track one category daily",
      impact: "Medium",
      difficulty: "Easy",
      estimatedSaving: "1-3 kg CO2/week",
      why: `Your current focus area is ${category}, so visibility will help you reduce wasteful habits.`
    },
    {
      title: "Try one no-buy or no-delivery day",
      impact: "Medium",
      difficulty: "Medium",
      estimatedSaving: "1-4 kg CO2/week",
      why: "Avoiding extra delivery trips and packaging trims avoidable emissions."
    },
    {
      title: "Move your monthly carbon budget down by 5%",
      impact: "High",
      difficulty: "Medium",
      estimatedSaving: "5-12 kg CO2/month",
      why: "A smaller budget creates a practical target without relying on guilt or drastic changes."
    }
  ];

  return {
    source: "fallback",
    weeklyPlan: `This week, focus on ${category}. Keep the plan light: one transport, energy, food, or shopping habit at a time.`,
    highestImpactChange: profile.strategy,
    lowCostTips: ["Carry a reusable bottle or bag", "Switch off idle appliances", "Batch errands into fewer trips"],
    encouragement: "Your CarbonTwin improves through small, repeatable decisions. Start where change feels easiest.",
    actions
  };
}

export async function generateCoachPlan(context: CoachContext) {
  if (!env.geminiApiKey || !context.latestLog) return fallbackRecommendations(context);

  try {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Act as a friendly sustainability coach. Based on this user's carbon footprint data, generate practical, personalized, low-cost actions to reduce emissions. Avoid guilt-based language. Focus on small realistic habits.

Return strict JSON with keys weeklyPlan, highestImpactChange, lowCostTips array, encouragement, actions array. Each action needs title, impact, difficulty, estimatedSaving, why.

User data: ${JSON.stringify(context)}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return { source: "gemini", ...JSON.parse(text) };
  } catch (error) {
    console.warn("Gemini unavailable, using fallback recommendations.", error);
    return fallbackRecommendations(context);
  }
}
