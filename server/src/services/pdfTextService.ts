import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

export async function extractTextFromPdf(filePath: string) {
  const buffer = await readFile(filePath);
  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();
  await parser.destroy();
  const text = data.text ?? "";
  if (text.trim().length < 50) {
    return {
      text,
      confidence: 0,
      failed: true,
      message: "This PDF could not be read. Please upload a clear screenshot/photo of the bill."
    };
  }
  return { text, confidence: 0.85, failed: false };
}
