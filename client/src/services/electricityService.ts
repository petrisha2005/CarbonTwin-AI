import { api } from "../lib/api";

export type BillExtraction = {
  recordId?: string | null;
  isElectricityBill: boolean;
  extractedText: string;
  provider: string | null;
  consumerNumber: string | null;
  unitsConsumed: number | null;
  billAmount: number | null;
  billingMonth: string | null;
  billDate: string | null;
  dueDate: string | null;
  currency: string;
  confidence: number;
  needsManualConfirmation: boolean;
  message: string;
  extractedFields: Record<string, { value: unknown; confidence: number }>;
};

export type PaymentExtraction = {
  provider: string | null;
  amountPaid: number;
  paymentDate?: string | null;
  transactionId?: string | null;
  consumerNumber?: string | null;
  accountNumber?: string | null;
  billerId?: string | null;
  estimatedUnits: number;
  estimatedCO2: number;
  ratePerUnit: number;
  personalCO2: number | null;
  householdMembers?: number;
  confidence: "medium" | "low";
  sourceType: "payment_screenshot";
  confirmedByUser: boolean;
  needsConfirmation: boolean;
  message: string;
  note: string;
  extractedTextPreview: string;
};

export async function extractElectricityBill(file: File) {
  const formData = new FormData();
  formData.append("bill", file);
  const data = await api<{ success: boolean; data: BillExtraction }>("/electricity/extract-bill", { method: "POST", body: formData });
  return data.data;
}

export async function extractElectricityPayment(file: File, householdMembers?: number) {
  const formData = new FormData();
  formData.append("paymentScreenshot", file);
  if (householdMembers) formData.append("householdMembers", String(householdMembers));
  const data = await api<{ success: boolean; data: PaymentExtraction }>("/electricity/extract-payment", { method: "POST", body: formData });
  return data.data;
}
