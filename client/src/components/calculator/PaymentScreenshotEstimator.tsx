import { useState } from "react";
import { ApiError } from "../../lib/api";
import { Button } from "../Button";
import { FileUploadCard } from "../ui/FileUploadCard";
import { StepperInput } from "../ui/StepperInput";
import { extractElectricityPayment, type PaymentExtraction } from "../../services/electricityService";

const note = "Payment screenshots usually do not show exact units/kWh, so this estimate is based on the amount paid.";

export function PaymentScreenshotEstimator({ update, onSwitchManual }: { update: (name: string, value: any) => void; onSwitchManual: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<PaymentExtraction | null>(null);
  const [provider, setProvider] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [amount, setAmount] = useState(0);
  const [units, setUnits] = useState(0);
  const [members, setMembers] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function extract() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const data = await extractElectricityPayment(file, members);
      setResult(data);
      setProvider(data.provider ?? "");
      setPaymentDate(data.paymentDate ?? "");
      setAmount(data.amountPaid);
      setUnits(data.estimatedUnits);
      setMembers(data.householdMembers ?? members);
    } catch (err: any) {
      setResult(null);
      if (err instanceof ApiError && err.code === "INVALID_ELECTRICITY_PAYMENT") {
        setError("INVALID_ELECTRICITY_PAYMENT");
      } else {
        setError(err.message ?? "Could not read this file clearly. Please upload a clear electricity payment screenshot.");
      }
    } finally {
      setLoading(false);
    }
  }

  function useEstimate() {
    const estimatedUnits = Math.max(0, units);
    const estimatedCO2 = Math.round(estimatedUnits * 0.82 * 100) / 100;
    update("monthlyElectricityKwh", estimatedUnits);
    update("electricityEstimationMethod", "payment_screenshot");
    update("electricityData", {
      amountPaid: amount,
      provider,
      paymentDate,
      estimatedUnits,
      estimatedCO2,
      personalCO2: Math.round((estimatedCO2 / Math.max(1, members)) * 100) / 100,
      householdMembers: members,
      confidence: result?.confidence ?? "medium",
      sourceType: "payment_screenshot",
      confirmedByUser: true,
      note
    });
  }

  function changeAmount(value: number) {
    setAmount(value);
    setUnits(Math.round((Math.max(0, value) / 7) * 10) / 10);
  }

  const co2 = Math.round(Math.max(0, units) * 0.82 * 100) / 100;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-black">Upload Electricity Payment Screenshot</h3>
        <p className="mt-1 text-sm text-slate-400">Upload a screenshot from GPay, PhonePe, Paytm, bank app, UPI, autopay, or electricity provider payment confirmation.</p>
      </div>
      <FileUploadCard
        file={file}
        onFile={(next) => { setFile(next); setResult(null); setError(""); }}
        title="Upload Electricity Payment Screenshot"
        helper="JPG, PNG, WEBP, PDF, or a clear electricity payment confirmation."
        accept="image/png,image/jpeg,image/webp,application/pdf"
      />
      <Button type="button" variant="secondary" disabled={!file || loading} onClick={extract}>{loading ? "Reading screenshot..." : "Extract Payment Details"}</Button>
      {loading && (
        <div className="rounded-lg bg-neon-green/10 p-3 text-sm text-neon-green">
          <p>Reading screenshot...</p>
          <p>Checking if this is an electricity payment...</p>
          <p>Extracting amount and provider...</p>
          <p>Estimating electricity usage...</p>
        </div>
      )}
      {error === "INVALID_ELECTRICITY_PAYMENT" ? (
        <div className="rounded-lg border border-red-300/30 bg-red-950/30 p-4">
          <h3 className="font-bold text-red-100">Invalid payment proof</h3>
          <p className="mt-2 text-sm text-red-100/85">This file does not look like an electricity bill payment screenshot. Please upload a valid electricity payment proof.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => { setFile(null); setError(""); }}>Upload Again</Button>
            <Button type="button" onClick={onSwitchManual}>Use Enter Units Instead</Button>
          </div>
        </div>
      ) : error ? <p className="rounded-lg border border-red-300/30 bg-red-950/30 p-3 text-sm text-red-100">{error}</p> : null}
      {result && (
        <div className="rounded-lg border border-neon-green/30 bg-neon-green/10 p-4">
          <p className="font-bold">Electricity payment detected</p>
          <p className="mt-1 text-sm text-slate-300">This is an estimate because payment screenshots usually do not show units/kWh.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label><span className="label">Provider</span><input className="field mt-1" value={provider} onChange={(event) => setProvider(event.target.value)} /></label>
            <label><span className="label">Amount paid</span><input className="field mt-1" type="number" min={0} value={amount} onChange={(event) => changeAmount(Number(event.target.value))} /></label>
            <label><span className="label">Payment date</span><input className="field mt-1" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} /></label>
            <label><span className="label">Estimated units</span><input className="field mt-1" type="number" min={0} value={units} onChange={(event) => setUnits(Number(event.target.value))} /></label>
            <div>
              <StepperInput label="Household members" value={members} min={1} max={10} onChange={setMembers} />
            </div>
            <ReadOnly label="Estimated CO2" value={`${co2} kg`} />
            <ReadOnly label="Confidence" value={result.confidence} />
            {result.transactionId && <ReadOnly label="Transaction ID" value={result.transactionId} />}
          </div>
          <p className="mt-3 text-xs text-slate-400">{note}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={useEstimate}>Use This Estimate</Button>
            <Button type="button" variant="secondary" onClick={() => { setFile(null); setResult(null); setError(""); }}>Upload Another Screenshot</Button>
            <Button type="button" variant="ghost" onClick={onSwitchManual}>Use Enter Units Instead</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-white/[0.06] px-3 py-2"><p className="label">{label}</p><p className="mt-1 font-bold text-white">{value}</p></div>;
}
