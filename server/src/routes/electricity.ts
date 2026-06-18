import { unlink } from "node:fs/promises";
import express from "express";
import multer from "multer";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { ElectricityBillRecord } from "../models/ElectricityBillRecord.js";
import { extractElectricityBillFields } from "../services/electricityBillExtractionService.js";
import { validateElectricityBill } from "../services/electricityBillValidationService.js";
import { extractPaymentDetails } from "../services/electricityPaymentExtractionService.js";
import { validateElectricityPaymentProof } from "../services/electricityPaymentValidationService.js";
import { extractTextFromImage } from "../services/ocrService.js";
import { extractTextFromPdf } from "../services/pdfTextService.js";
import { isMongoEnabled } from "../services/store.js";

export const electricityRouter = express.Router();
electricityRouter.use(requireAuth);

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

const upload = multer({
  dest: "/tmp/carbontwin-bills",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error("Only electricity bill images or PDFs are supported."));
    }
    callback(null, true);
  }
});

async function textFromFile(file: Express.Multer.File) {
  if (file.mimetype === "application/pdf") {
    const pdf = await extractTextFromPdf(file.path);
    if (pdf.failed) return { failed: true, code: "OCR_FAILED", message: pdf.message };
    return { text: pdf.text, confidence: pdf.confidence };
  }
  return extractTextFromImage(file.path);
}

electricityRouter.post("/extract-bill", (req: AuthedRequest, res) => {
  upload.single("bill")(req, res, async (error) => {
    const file = req.file;
    try {
      if (error) {
        const message = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
          ? "Bill file is too large. Please upload a file under 5MB."
          : "Only electricity bill images or PDFs are supported.";
        return res.status(400).json({ success: false, code: "INVALID_FILE", message });
      }
      if (!file) {
        return res.status(400).json({ success: false, code: "MISSING_FILE", message: "Please upload a bill file using the field name bill." });
      }

      const extracted = await textFromFile(file);
      if ("failed" in extracted) {
        return res.status(400).json({ success: false, code: extracted.code, message: extracted.message });
      }
      const text = String(extracted.text ?? "").trim();
      if (text.length < 20) {
        return res.status(400).json({ success: false, code: "OCR_FAILED", message: "Could not read the bill clearly. Please upload a clearer image or enter units manually." });
      }

      const validation = validateElectricityBill(text);
      if (!validation.isElectricityBill) {
        return res.status(400).json({
          success: false,
          code: "INVALID_ELECTRICITY_BILL",
          message: "Please upload a valid electricity bill. The uploaded document does not look like an electricity bill."
        });
      }

      const data = extractElectricityBillFields(text, extracted.confidence);
      const record = isMongoEnabled() ? await ElectricityBillRecord.create({
        userId: req.user!.id,
        fileName: file.originalname,
        fileMimeType: file.mimetype,
        unitsConsumed: data.unitsConsumed,
        billAmount: data.billAmount,
        provider: data.provider,
        billingMonth: data.billingMonth,
        consumerNumber: data.consumerNumber,
        billDate: data.billDate,
        dueDate: data.dueDate,
        currency: data.currency,
        confidence: data.confidence,
        confirmedByUser: false,
        extractedTextPreview: data.extractedText.slice(0, 500),
        extractedFields: data.extractedFields
      }) : null;

      return res.json({ success: true, data: { ...data, recordId: record ? String(record._id) : null } });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ success: false, code: "OCR_FAILED", message: "Could not read the bill clearly. Please upload a clearer image or enter units manually." });
    } finally {
      if (file?.path) await unlink(file.path).catch(() => undefined);
    }
  });
});

electricityRouter.post("/extract-payment", (req: AuthedRequest, res) => {
  upload.single("paymentScreenshot")(req, res, async (error) => {
    const file = req.file;
    try {
      if (error) {
        const message = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
          ? "Payment screenshot is too large. Please upload a file under 5MB."
          : "Only JPG, PNG, WEBP, or PDF payment screenshots are supported.";
        return res.status(400).json({ success: false, code: "INVALID_FILE", message });
      }
      if (!file) {
        return res.status(400).json({ success: false, code: "MISSING_FILE", message: "Please upload a payment screenshot using the field name paymentScreenshot." });
      }

      const extracted = await textFromFile(file);
      if ("failed" in extracted) {
        return res.status(400).json({ success: false, code: extracted.code, message: "Could not read this file clearly. Please upload a clear electricity payment screenshot." });
      }

      const text = String(extracted.text ?? "").trim();
      if (text.length < 10) {
        return res.status(400).json({ success: false, code: "OCR_FAILED", message: "Could not read this file clearly. Please upload a clear electricity payment screenshot." });
      }

      const validation = validateElectricityPaymentProof(text);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          code: "INVALID_ELECTRICITY_PAYMENT",
          message: "Please upload a valid electricity payment screenshot from UPI, PhonePe, GPay, Paytm, bank app, or electricity provider."
        });
      }
      const householdMembers = req.body?.householdMembers ? Number(req.body.householdMembers) : undefined;
      const data = extractPaymentDetails(text, householdMembers, { confidence: validation.matchedKeywords.provider.length ? "medium" : "low" });
      if (!data) {
        return res.status(400).json({
          success: false,
          code: "INVALID_ELECTRICITY_PAYMENT",
          message: "Please upload a valid electricity payment screenshot from UPI, PhonePe, GPay, Paytm, bank app, or electricity provider."
        });
      }

      return res.json({ success: true, data });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ success: false, code: "OCR_FAILED", message: "Could not read the payment screenshot clearly. Please upload a clearer image or enter units manually." });
    } finally {
      if (file?.path) await unlink(file.path).catch(() => undefined);
    }
  });
});
