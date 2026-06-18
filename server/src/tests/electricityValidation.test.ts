import assert from "node:assert/strict";
import test from "node:test";
import { validateElectricityBill } from "../services/electricityBillValidationService.js";
import { extractPaymentAmount, extractPaymentDetails } from "../services/electricityPaymentExtractionService.js";
import { validateElectricityPaymentProof } from "../services/electricityPaymentValidationService.js";

test("valid electricity bill text is accepted", () => {
  const result = validateElectricityBill(
    "BESCOM electricity bill Consumer Number 12345 Meter Reading 400 Units Consumed 120 kWh Bill Amount Rs 840 Energy Charges"
  );

  assert.equal(result.isElectricityBill, true);
  assert.ok(result.score >= 4);
});

test("valid electricity payment screenshot text is accepted", () => {
  const result = validateElectricityPaymentProof(
    "Payment successful Amount Paid Rs. 840 UPI Transaction ID TXN987654 BESCOM electricity bill Consumer Number 12345"
  );

  assert.equal(result.isValid, true);
  assert.equal(result.amountPaid, 840);
});

test("random PDF text is rejected as an electricity bill", () => {
  const result = validateElectricityBill("Resume portfolio education experience projects skills references");

  assert.equal(result.isElectricityBill, false);
});

test("food payment is rejected as electricity payment proof", () => {
  const result = validateElectricityPaymentProof("Payment successful Amount Paid Rs. 420 Swiggy food order UPI transaction");

  assert.equal(result.isValid, false);
});

test("random non-electricity UPI payment is rejected", () => {
  const result = validateElectricityPaymentProof("UPI payment successful Amount Paid INR 999 Transaction ID UPI123456 paid to Book Store");

  assert.equal(result.isValid, false);
});

test("amount extraction supports rupee, Rs, and INR patterns", () => {
  assert.equal(extractPaymentAmount("Amount Paid ₹840.50"), 840.5);
  assert.equal(extractPaymentAmount("Paid Rs. 700"), 700);
  assert.equal(extractPaymentAmount("Debited INR 1,250.75"), 1250.75);
});

test("amount-based electricity payment estimates units and personal CO2", () => {
  const details = extractPaymentDetails(
    "Paid to BESCOM electricity bill Amount Paid Rs. 700 Transaction ID TXN123456 Consumer Number 9999",
    2
  );

  assert.ok(details);
  assert.equal(details.estimatedUnits, 100);
  assert.equal(details.estimatedCO2, 82);
  assert.equal(details.personalCO2, 41);
});
