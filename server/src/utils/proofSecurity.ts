const PREVIEW_LIMIT = 500;

export function safePreview(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, PREVIEW_LIMIT);
}

export function sanitizeProofForResponse(proof: any) {
  if (!proof) return proof;
  const { extractedText: _extractedText, ...safeProof } = proof;
  return {
    ...safeProof,
    extractedTextPreview: safePreview(safeProof.extractedTextPreview)
  };
}
