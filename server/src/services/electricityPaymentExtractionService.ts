const providerKeywords = [
  "BESCOM",
  "MESCOM",
  "GESCOM",
  "HESCOM",
  "CESC",
  "TANGEDCO",
  "Maharashtra State Electricity",
  "Mahavitaran",
  "MSEB",
  "Adani Electricity",
  "Tata Power",
  "BSES",
  "Torrent Power",
  "UPPCL",
  "PSPCL",
  "KSEB",
  "Electricity Board",
  "Electricity Department"
];

function amountFrom(value: string | undefined) {
  if (!value) return null;
  const amount = Number(value.replace(/,/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function extractPaymentAmount(text: string) {
  const labelPatterns = [
    /amount\s*paid[:\s₹rs.]*(?:rs\.?|inr|₹)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi,
    /paid[:\s₹rs.]*(?:rs\.?|inr|₹)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi,
    /debited[:\s₹rs.]*(?:rs\.?|inr|₹)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi,
    /bill\s*amount[:\s₹rs.]*(?:rs\.?|inr|₹)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi,
    /₹\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi,
    /rs\.?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi,
    /inr\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi,
    /(?:rs\.?|inr|₹)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)\s*(?:paid|debited|bill)?/gi
  ];
  for (const pattern of labelPatterns) {
    const matches = [...text.matchAll(pattern)]
      .map((match) => amountFrom(match[1]))
      .filter((amount): amount is number => amount !== null);
    if (matches.length > 0) return matches[0];
  }

  const currencyMatches = [...text.matchAll(/(?:rs\.?|inr|₹)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi)]
    .map((match) => amountFrom(match[1]))
    .filter((amount): amount is number => amount !== null);
  return currencyMatches[0] ?? null;
}

function extractProvider(text: string) {
  const lower = text.toLowerCase();
  const provider = providerKeywords.find((keyword) => lower.includes(keyword.toLowerCase()));
  if (provider) return provider;
  const providerMatch = text.match(/(?:paid\s+to|merchant|biller|provider)\s*:?\s*([A-Za-z][A-Za-z0-9 .&-]{2,60})/i);
  return providerMatch?.[1]?.trim() ?? null;
}

function extractPaymentDate(text: string) {
  const match = text.match(/\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4})\b/i);
  return match?.[1] ?? null;
}

function extractTransactionId(text: string) {
  const match = text.match(/(?:transaction\s*id|txn\s*id|upi\s*ref\s*no|reference\s*number)\s*[:#-]?\s*([A-Za-z0-9-]{6,40})/i);
  return match?.[1] ?? null;
}

function extractConsumerInfo(text: string) {
  const consumerNumber = text.match(/consumer\s*(?:number|no)?\s*[:#-]?\s*([A-Za-z0-9-]{4,30})/i)?.[1] ?? null;
  const accountNumber = text.match(/account\s*(?:number|no)?\s*[:#-]?\s*([A-Za-z0-9-]{4,30})/i)?.[1] ?? null;
  const billerId = text.match(/biller\s*(?:id)?\s*[:#-]?\s*([A-Za-z0-9-]{3,40})/i)?.[1] ?? null;
  return { consumerNumber, accountNumber, billerId };
}

export function extractPaymentDetails(text: string, householdMembers?: number, options: { confidence?: "medium" | "low" } = {}) {
  const amountPaid = extractPaymentAmount(text);
  if (!amountPaid) return null;
  const estimatedUnits = Math.round((amountPaid / 7) * 10) / 10;
  const estimatedCO2 = Math.round(estimatedUnits * 0.82 * 100) / 100;
  const members = householdMembers && householdMembers > 0 ? householdMembers : undefined;
  const provider = extractProvider(text);
  const consumerInfo = extractConsumerInfo(text);
  return {
    isElectricityPayment: true,
    provider,
    amountPaid,
    paymentDate: extractPaymentDate(text),
    transactionId: extractTransactionId(text),
    ...consumerInfo,
    estimatedUnits,
    estimatedCO2,
    ratePerUnit: 7,
    personalCO2: members ? Math.round((estimatedCO2 / members) * 100) / 100 : null,
    householdMembers: members,
    confidence: options.confidence ?? (provider ? "medium" : "low"),
    sourceType: "payment_screenshot" as const,
    confirmedByUser: false,
    needsConfirmation: true,
    message: "Electricity payment detected. Please confirm the estimated details.",
    note: "Estimated from payment amount because screenshot does not show exact kWh units.",
    extractedTextPreview: text.slice(0, 500)
  };
}
