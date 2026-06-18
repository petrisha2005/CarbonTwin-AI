import { detectElectricityProvider, validateElectricityBill } from "./electricityBillValidationService.js";
import { firstNumber, firstString, normalizeDate } from "../utils/billRegexUtils.js";

export function extractElectricityBillFields(extractedText: string, ocrConfidence = 0.7) {
  const validation = validateElectricityBill(extractedText);
  const normalizedText = extractedText
    .replace(/\bUnils\b/gi, "Units")
    .replace(/\bConsimed\b/gi, "Consumed")
    .replace(/\bAcc\s+ld\b/gi, "Acc Id")
    .replace(/\bAmounl\b/gi, "Amount")
    .replace(/\bRale\b/gi, "Rate")
    .replace(/\bNol\s+Payable\b/gi, "Net Payable")
    .replace(/\bTolal\b/gi, "Total");
  const units = firstNumber(
    [
      /units\s*consumed[:\s-]*(\d+(?:\.\d+)?)/i,
      /units?\s*[:\s-]*(\d+(?:\.\d+)?)/i,
      /consumed\s*units[:\s-]*(\d+(?:\.\d+)?)/i,
      /current\s*consumption[:\s-]*(\d+(?:\.\d+)?)/i,
      /energy\s*consumption[:\s-]*(\d+(?:\.\d+)?)/i,
      /energy\s*consumed[:\s-]*(\d+(?:\.\d+)?)/i,
      /net\s*consumption[:\s-]*(\d+(?:\.\d+)?)/i,
      /consumption[:\s-]*(\d+(?:\.\d+)?)(?:\s*(?:kwh|units))?/i,
      /(?:fppca|surcharge)[\s\S]{0,90}?(\d{2,5}(?:\.\d+)?)\s+0[.\s]*\d{2}/i,
      /(?:energy\s*charges|enargy\s*charges)[\s\S]{0,90}?(\d{2,5}(?:\.\d+)?)\s+5[.\s]*8/i,
      /(\d+(?:\.\d+)?)\s*(?:kwh|kwhr|units|unit)\b/i
    ],
    normalizedText
  );
  const amount = firstNumber(
    [
      /bill\s*amount[:\s₹rs.-]*(\d+(?:\.\d+)?)/i,
      /bill\s*amount\s*(?:\([^)]*\))?[^\d]{0,20}(\d+(?:\.\d+)?)/i,
      /bill\s*amount[\s\S]{0,30}?(\d+(?:\.\d+)?)/i,
      /total\s*amount[:\s₹rs.-]*(\d+(?:\.\d+)?)/i,
      /amount\s*payable[:\s₹rs.-]*(\d+(?:\.\d+)?)/i,
      /net\s*amount[:\s₹rs.-]*(\d+(?:\.\d+)?)/i,
      /due\s*amount[:\s₹rs.-]*(\d+(?:\.\d+)?)/i,
      /current\s*bill[:\s₹rs.-]*(\d+(?:\.\d+)?)/i,
      /cur[.\s]*demand\s*payable[:\s₹rs.-]*(\d+(?:\.\d+)?)/i,
      /net\s*payable[\s\S]{0,60}?(\d+(?:\.\d+)?)/i,
      /total\s*payable[:\s₹rs.-]*(\d+(?:\.\d+)?)/i
    ],
    normalizedText
  );
  const consumer = firstString(
    [
      /consumer\s*(?:number|no|id)[:\s-]*([a-z0-9/-]+)/i,
      /ca\s*(?:number|no)[:\s-]*([a-z0-9/-]+)/i,
      /contract\s*account[:\s-]*([a-z0-9/-]+)/i,
      /\b(?:account|acc)\s*(?:id|ld|no|number)?[^\d]{0,20}(\d{6,})/i,
      /account\s*(?:id|number|no)[:\s-]*([a-z0-9/-]+)/i,
      /customer\s*(?:id|number|no)[:\s-]*([a-z0-9/-]+)/i,
      /rr\s*(?:number|no)[:\s-]*([a-z0-9/-]+)/i,
      /service\s*(?:number|no)[:\s-]*([a-z0-9/-]+)/i,
      /installation\s*(?:number|no)[:\s-]*([a-z0-9/-]+)/i
    ],
    normalizedText
  );
  const billingMonth = firstString(
    [
      /billing\s*month[:\s-]*([A-Za-z]+\s+\d{4})/i,
      /bill\s*month[:\s-]*([A-Za-z]{3,9}[-\s]\d{4})/i,
      /month[:\s-]*(\d{1,2}\/\d{4})/i,
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/i
    ],
    normalizedText
  );
  const billDate = firstString([/bill\s*date[:\s-]*(\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i], normalizedText);
  const dueDate = firstString([/(?:payment\s*)?due\s*date[\s\S]{0,80}?(\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i, /last\s*date[:\s-]*(\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i], normalizedText);

  const message = units.value == null
    ? "Electricity bill detected, but units could not be extracted. Please enter units manually."
    : "Electricity bill detected. Please confirm the extracted values.";

  return {
    isElectricityBill: validation.isElectricityBill,
    confidence: Math.max(validation.confidence, Math.min(0.95, ocrConfidence)),
    extractedText,
    provider: detectElectricityProvider(extractedText),
    consumerNumber: consumer.value,
    billingMonth: billingMonth.value,
    billDate: normalizeDate(billDate.value),
    dueDate: normalizeDate(dueDate.value),
    unitsConsumed: units.value,
    billAmount: amount.value,
    currency: "INR",
    extractedFields: {
      unitsConsumed: { value: units.value, confidence: units.confidence },
      billAmount: { value: amount.value, confidence: amount.confidence },
      consumerNumber: { value: consumer.value, confidence: consumer.confidence }
    },
    needsManualConfirmation: true,
    message,
    validation
  };
}
