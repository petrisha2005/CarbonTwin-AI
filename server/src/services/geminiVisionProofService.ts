import { readFile } from "node:fs/promises";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { safeJsonParse } from "../utils/safeJsonParse.js";

export async function validateImageProofWithGemini(imagePath: string, mimeType: string, missionContext: any) {
  if (!env.geminiApiKey) throw new Error("GEMINI_API_KEY is not configured");
  const modelName = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  const image = await readFile(imagePath);
  const prompt = `You are verifying proof for an eco mission.

Mission: ${missionContext.title}
Category: ${missionContext.category}
Required proof: ${missionContext.proofInstructions || missionContext.description}

Analyze the uploaded image and decide whether it reasonably supports the mission.
Return only JSON:
{"matchesMission":true,"confidence":0,"reason":"","detectedItems":[]}

Rules:
- Be strict but fair.
- Do not verify unrelated images.
- If unclear, confidence below 60.`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: image.toString("base64"), mimeType } }
  ]);
  const parsed = safeJsonParse<any>(result.response.text());
  if (!parsed || typeof parsed.matchesMission !== "boolean") throw new Error("Invalid Gemini proof response");
  return {
    matchesMission: parsed.matchesMission,
    confidence: Number(parsed.confidence ?? 0),
    reason: String(parsed.reason ?? ""),
    detectedItems: Array.isArray(parsed.detectedItems) ? parsed.detectedItems.map(String) : []
  };
}
