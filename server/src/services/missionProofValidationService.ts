import type { Express } from "express";
import { validateElectricityBill } from "./electricityBillValidationService.js";
import { validateImageProofWithGemini } from "./geminiVisionProofService.js";
import { missionVerificationService } from "./missionVerificationService.js";
import { extractProofText } from "./proofOcrService.js";

const transportKeywords = ["bus", "metro", "train", "railway", "ticket", "fare", "passenger", "journey", "station", "platform", "transit", "bmtc", "ksrtc", "namma metro", "irctc"];
const unrelatedKeywords = ["resume", "curriculum vitae", "marks card", "assignment", "invoice for clothes", "amazon", "flipkart"];
const electricityKeywords = ["electricity bill", "kwh", "units consumed", "meter reading", "energy charges", "bill amount", "bescom", "tneb", "kseb", "power"];
const vegKeywords = ["veg", "vegetarian", "vegan", "paneer", "dal", "salad", "idli", "dosa", "rice", "vegetables", "plant based", "tofu", "mushroom"];
const nonVegKeywords = ["chicken", "mutton", "beef", "fish", "egg", "prawn", "meat"];
const plasticKeywords = ["reusable", "bottle", "bag", "steel bottle", "water bottle", "plastic free"];

function includesAny(text: string, keywords: string[]) {
  return keywords.filter((keyword) => text.includes(keyword));
}

function preview(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, 500);
}

export function expectedProofForMission(mission: any) {
  const group = missionGroup(mission);
  if (group === "plant_meal") return "Upload a clear meal photo, vegetarian/vegan food receipt, or log plant-based meal in Eco Quest.";
  if (group === "public_transport") return "Upload bus/metro/train ticket or verify with Eco Quest transport data.";
  if (group === "electricity") return "Upload electricity bill, appliance proof, or verify through Eco Quest electricity data.";
  if (group === "no_shopping") return "This mission is verified through Eco Quest shopping data. File upload is not required.";
  if (group === "plastic") return "Upload reusable bottle/bag photo or select avoided plastic in Eco Quest.";
  return mission.proofInstructions || "Upload proof that clearly matches this mission, or verify with Eco Quest if available.";
}

function result(verificationStatus: "verified" | "pending" | "needs_review" | "rejected", trustScore: number, validationMessage: string, extras: any = {}) {
  return {
    verificationStatus,
    trustScore,
    matchedEvidence: extras.matchedEvidence ?? [],
    rejectionReason: extras.rejectionReason ?? "",
    expectedProof: extras.expectedProof ?? "",
    extractedText: extras.extractedText ?? "",
    extractedTextPreview: preview(extras.extractedText ?? ""),
    validationMessage
  };
}

function missionGroup(mission: any) {
  const id = mission.missionId;
  if (["public-transport-choice", "three-public-transport-days"].includes(id)) return "public_transport";
  if (id === "walk-one-short-trip") return "walk";
  if (["switch-off-unused-appliances", "reduce-ac-by-1-hour", "low-energy-week"].includes(id)) return "electricity";
  if (["plant-based-meal", "three-plant-based-meals"].includes(id)) return "plant_meal";
  if (id === "avoid-food-delivery") return "food_delivery";
  if (["no-online-shopping-today", "no-shopping-week"].includes(id)) return "no_shopping";
  if (id === "avoid-plastic-bottle") return "plastic";
  return mission.category;
}

async function ecoQuestResult(userId: string, mission: any) {
  const verification = mission.type === "weekly"
    ? await missionVerificationService.verifyWeeklyEcoQuest(userId, mission.missionId, mission.targetCount)
    : await missionVerificationService.verifyMissionWithEcoQuest(userId, mission.missionId);
  return verification.verified
    ? result("verified", verification.trustScore, verification.reason, { matchedEvidence: verification.matchedFields })
    : null;
}

async function visionFallback(file: Express.Multer.File, mission: any, fallbackTrust = 55) {
  if (file.mimetype === "application/pdf") return null;
  try {
    const vision = await validateImageProofWithGemini(file.path, file.mimetype, mission);
    if (vision.matchesMission && vision.confidence >= 75) return result("verified", 80, vision.reason || "Image proof matches this mission.", { matchedEvidence: vision.detectedItems });
    if (vision.confidence >= 50) return result("needs_review", 55, vision.reason || "Proof uploaded but could not be confidently verified.", { matchedEvidence: vision.detectedItems });
    return result("rejected", 20, "This proof does not appear to match the selected mission.", { rejectionReason: vision.reason || "Image did not match mission." });
  } catch {
    return result("needs_review", fallbackTrust, "Proof uploaded but could not be confidently verified.");
  }
}

export async function validateMissionProof({
  mission,
  userId,
  file,
  proofMethod,
  optionalNote
}: {
  mission: any;
  userMission: any;
  userId: string;
  file?: Express.Multer.File;
  proofMethod: string;
  optionalNote?: string;
}) {
  if (proofMethod === "eco_quest_match") {
    const matched = await ecoQuestResult(userId, mission);
    return matched ?? result("rejected", 0, "We could not verify this from today's Eco Quest. Please update Eco Quest or upload clearer proof.", { rejectionReason: "No matching Eco Quest evidence.", expectedProof: expectedProofForMission(mission) });
  }

  if (proofMethod === "self_check") {
    if (!mission.allowSelfCheckFallback && mission.verificationType !== "self_check") return result("rejected", 0, "Self-check is not accepted for this mission.", { rejectionReason: "Self-check not allowed.", expectedProof: expectedProofForMission(mission) });
    return result("pending", 40, "Self-check recorded. This may qualify for partial rewards only.", { matchedEvidence: optionalNote ? [optionalNote] : [] });
  }

  const group = missionGroup(mission);
  if (["food_delivery", "no_shopping"].includes(group)) {
    return result("rejected", 0, group === "food_delivery" ? "This mission is verified through Eco Quest data. Please complete today's Eco Quest." : "This mission is verified through your Eco Quest shopping data.", { rejectionReason: "File proof is not accepted for this mission.", expectedProof: expectedProofForMission(mission) });
  }
  if (!file) return result("rejected", 0, "Please upload a proof file.", { rejectionReason: "Missing file.", expectedProof: expectedProofForMission(mission) });

  const { text } = await extractProofText(file).catch(() => ({ text: "", confidence: 0 }));
  const lower = text.toLowerCase();
  const unrelated = includesAny(lower, unrelatedKeywords);
  if (unrelated.length) return result("rejected", 10, "This proof does not appear to match the selected mission.", { extractedText: text, matchedEvidence: unrelated, rejectionReason: "Unrelated document keywords found.", expectedProof: expectedProofForMission(mission) });

  if (group === "public_transport") {
    const evidence = includesAny(lower, transportKeywords);
    if (evidence.length) return result("verified", 80, "Transport ticket/pass proof verified.", { extractedText: text, matchedEvidence: evidence });
    if (text.trim()) return result("rejected", 20, "This proof does not appear to be a bus, metro, or train ticket.", { extractedText: text, rejectionReason: "Missing transport ticket keywords.", expectedProof: expectedProofForMission(mission) });
    return result("needs_review", 50, "Proof uploaded but could not be confidently verified.");
  }

  if (group === "walk") {
    const matched = await ecoQuestResult(userId, mission);
    if (matched) return matched;
    return result("needs_review", 45, "We could not verify walking from today's Eco Quest. Please update Eco Quest or upload clearer proof.");
  }

  if (group === "electricity") {
    const evidence = includesAny(lower, electricityKeywords);
    const bill = validateElectricityBill(text);
    if (bill.isElectricityBill || evidence.length) return result("verified", 80, "Electricity proof verified.", { extractedText: text, matchedEvidence: [...new Set([...evidence, ...(bill.matchedKeywords ?? [])])] });
    if (text.trim()) return result("rejected", 20, "This proof does not look like electricity usage or an electricity bill.", { extractedText: text, rejectionReason: "Missing electricity bill evidence.", expectedProof: expectedProofForMission(mission) });
    return await visionFallback(file, mission, 50) ?? result("needs_review", 50, "Appliance proof photo needs review.");
  }

  if (group === "plant_meal") {
    const bad = includesAny(lower, nonVegKeywords);
    if (bad.length) return result("rejected", 15, "This food proof appears to include non-vegetarian items.", { extractedText: text, matchedEvidence: bad, rejectionReason: "Non-veg keywords found.", expectedProof: expectedProofForMission(mission) });
    const evidence = includesAny(lower, vegKeywords);
    if (evidence.length) return result("verified", 80, "Plant-based meal proof verified.", { extractedText: text, matchedEvidence: evidence });
    if (text.trim()) return result("needs_review", 55, "We uploaded your file, but it does not clearly show a plant-based meal. Try uploading a clear meal photo or verify with Eco Quest.", { extractedText: text, expectedProof: expectedProofForMission(mission) });
    return await visionFallback(file, mission, 55) ?? result("needs_review", 55, "Meal photo needs review.");
  }

  if (group === "plastic") {
    const evidence = includesAny(lower, plasticKeywords);
    if (evidence.length) return result("verified", 75, "Reusable item proof verified.", { extractedText: text, matchedEvidence: evidence });
    return await visionFallback(file, mission, 50) ?? result("needs_review", 50, "Reusable item photo needs review.");
  }

  return result("needs_review", 50, "Proof uploaded but this mission needs manual review.");
}
