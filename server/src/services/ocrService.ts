export async function extractTextFromImage(filePath: string) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    const result = await worker.recognize(filePath);
    return {
      text: result.data.text ?? "",
      confidence: Math.max(0, Math.min(1, (result.data.confidence ?? 0) / 100))
    };
  } finally {
    await worker.terminate();
  }
}
