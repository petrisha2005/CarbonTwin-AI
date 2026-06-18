export function firstNumber(patterns: RegExp[], text: string) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return { value: Number(match[1]), confidence: pattern.source.includes("[:\\s") ? 0.9 : 0.65 };
  }
  return { value: null, confidence: 0 };
}

export function firstString(patterns: RegExp[], text: string, group = 1) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[group]) return { value: String(match[group]).trim(), confidence: 0.82 };
  }
  return { value: null, confidence: 0 };
}

export function normalizeDate(value: string | null) {
  if (!value) return null;
  const cleaned = value.trim();
  const iso = cleaned.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  const dmy = cleaned.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  const parsed = new Date(cleaned);
  return Number.isNaN(+parsed) ? cleaned : parsed.toISOString().slice(0, 10);
}
