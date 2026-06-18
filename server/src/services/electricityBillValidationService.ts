const strongKeywords = [
  "electricity bill", "electric bill", "energy bill", "power bill", "electricity supply", "energy charges",
  "meter reading", "meter number", "units consumed", "consumed units", "kwh", "sanctioned load",
  "billing demand", "current reading", "previous reading", "energy consumed", "net consumption",
  "present reading", "arrears", "fixed charges", "energy charges", "wheeling charges"
];

const providers = [
  "bescom", "mescom", "gescom", "hescom", "chamundeshwari", "cescom", "tneb", "kseb", "mseb",
  "mahavitaran", "adani electricity", "tata power", "bses", "torrent power", "uppcl", "pspcl",
  "wbseb", "electricity board", "discom", "msedcl", "mseb", "mahadiscom", "best undertaking",
  "tsspdcl", "tsnpdcl", "apspdcl", "apeastern", "dhbvn", "uhbvn", "jvvnl", "avvnl", "jdvvnl"
];

const amountKeywords = ["bill amount", "total amount", "net amount", "amount payable", "due amount", "payable amount", "current bill", "total payable"];
const consumerKeywords = ["consumer number", "consumer no", "account id", "customer id", "rr number", "connection id", "service number", "installation number", "ca number", "contract account"];
const meterKeywords = ["meter reading", "meter number", "current reading", "previous reading", "present reading", "sanctioned load"];

function matches(list: string[], text: string) {
  return list.filter((keyword) => text.includes(keyword));
}

export function validateElectricityBill(extractedText: string) {
  const text = extractedText.toLowerCase();
  const matchedKeywords = [
    ...matches(strongKeywords, text),
    ...matches(providers, text),
    ...matches(amountKeywords, text),
    ...matches(consumerKeywords, text)
  ];
  const hasStrong = matches(strongKeywords, text).length > 0;
  const hasProvider = matches(providers, text).length > 0;
  const hasUnits = /(\d+(?:\.\d+)?)\s*(kwh|kwhr|units|unit)\b|units?\s*consumed|consumed\s*units?|energy\s*consumed|net\s*consumption/i.test(extractedText);
  const hasMeter = matches(meterKeywords, text).length > 0;
  const hasAmount = matches(amountKeywords, text).length > 0;
  const hasConsumer = matches(consumerKeywords, text).length > 0;

  let score = 0;
  if (hasStrong) score += 3;
  if (hasProvider) score += 3;
  if (hasUnits) score += 2;
  if (hasMeter) score += 2;
  if (hasAmount) score += 1;
  if (hasConsumer) score += 1;
  const required = hasUnits || hasMeter || hasProvider || hasAmount;

  return {
    isElectricityBill: score >= 4 && required,
    confidence: Math.min(1, Math.round((score / 12) * 100) / 100),
    score,
    matchedKeywords: [...new Set(matchedKeywords)],
    reason: required ? "Document score is too low." : "Missing units, meter reading, or provider evidence."
  };
}

export function detectProvider(extractedText: string) {
  const text = extractedText.toLowerCase();
  const provider = providers.find((item) => text.includes(item));
  if (!provider) return null;
  return provider.split(" ").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function detectElectricityProvider(extractedText: string) {
  const direct = detectProvider(extractedText);
  if (direct) return direct;
  const text = extractedText.toLowerCase();
  if (text.includes("wilson garden") || text.includes("rr no") || text.includes("aee (ele")) return "BESCOM";
  return null;
}
