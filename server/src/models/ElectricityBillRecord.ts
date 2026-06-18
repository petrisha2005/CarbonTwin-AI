import mongoose, { Schema } from "mongoose";

const electricityBillRecordSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    fileName: { type: String, default: "" },
    fileMimeType: { type: String, default: "" },
    unitsConsumed: { type: Number, default: null },
    billAmount: { type: Number, default: null },
    provider: { type: String, default: null },
    billingMonth: { type: String, default: null },
    consumerNumber: { type: String, default: null },
    billDate: { type: String, default: null },
    dueDate: { type: String, default: null },
    currency: { type: String, default: "INR" },
    confidence: { type: Number, default: 0 },
    confirmedByUser: { type: Boolean, default: false },
    usedInLogId: { type: String, default: null },
    extractedTextPreview: { type: String, default: "" },
    extractedFields: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

electricityBillRecordSchema.index({ userId: 1, createdAt: -1 });

export const ElectricityBillRecord = mongoose.model("ElectricityBillRecord", electricityBillRecordSchema);
