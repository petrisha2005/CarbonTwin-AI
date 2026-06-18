export function safeJsonParse<T>(value: string): T | null {
  try {
    const cleaned = value
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const json = start >= 0 && end >= start ? cleaned.slice(start, end + 1) : cleaned;
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
