import type { Express } from "express";
import { extractTextFromImage } from "./ocrService.js";
import { extractTextFromPdf } from "./pdfTextService.js";

export async function extractProofText(file: Express.Multer.File) {
  if (file.mimetype === "application/pdf") {
    const result = await extractTextFromPdf(file.path);
    return { text: result.text ?? "", confidence: result.confidence ?? 0 };
  }
  const result = await extractTextFromImage(file.path);
  return { text: result.text ?? "", confidence: result.confidence ?? 0 };
}
