import { extractPaymentAmount } from "./electricityPaymentExtractionService.js";

const electricityKeywords = [
  "electricity",
  "electric bill",
  "electricity bill",
  "power bill",
  "energy bill",
  "bill payment",
  "electricity board",
  "power supply",
  "biller",
  "consumer number",
  "account number"
];

const providerKeywords = [
  "bescom",
  "mescom",
  "gescom",
  "hescom",
  "cesc",
  "tneb",
  "kseb",
  "mahavitaran",
  "mseb",
  "tata power",
  "adani electricity",
  "bses",
  "uppcl",
  "pspcl",
  "torrent power",
  "electricity board",
  "discom"
];

const paymentKeywords = [
  "payment successful",
  "paid",
  "amount paid",
  "bill paid",
  "transaction successful",
  "upi",
  "transaction id",
  "debited",
  "autopay",
  "mandate",
  "paid to",
  "payment completed"
];

const consumerKeywords = ["consumer number", "account number", "biller", "biller id"];

function matches(text: string, keywords: string[]) {
  return keywords.filter((keyword) => text.includes(keyword));
}

export function validateElectricityPaymentProof(extractedText: string) {
  const text = extractedText.toLowerCase();
  const amountPaid = extractPaymentAmount(extractedText);
  const electricityMatches = matches(text, electricityKeywords);
  const providerMatches = matches(text, providerKeywords);
  const paymentMatches = matches(text, paymentKeywords);
  const consumerMatches = matches(text, consumerKeywords);
  let score = 0;
  if (electricityMatches.length) score += 3;
  if (providerMatches.length) score += 3;
  if (paymentMatches.length) score += 2;
  if (amountPaid) score += 2;
  if (consumerMatches.length) score += 1;

  const isValid = score >= 6 && Boolean(amountPaid) && (electricityMatches.length > 0 || providerMatches.length > 0) && paymentMatches.length > 0;
  return {
    isValid,
    score,
    amountPaid,
    matchedKeywords: {
      electricity: electricityMatches,
      provider: providerMatches,
      payment: paymentMatches,
      consumer: consumerMatches
    }
  };
}
