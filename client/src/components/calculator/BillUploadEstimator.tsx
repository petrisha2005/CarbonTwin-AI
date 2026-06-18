import { useState } from "react";
import { Button } from "../Button";
import { FileUploadCard } from "../ui/FileUploadCard";
import { extractElectricityBill, type BillExtraction } from "../../services/electricityService";

export function BillUploadEstimator({ update }: { update: (name: string, value: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BillExtraction | null>(null);
  const [units, setUnits] = useState(120);
  const [amount, setAmount] = useState(0);
  const [provider, setProvider] = useState("");
  const [consumerNumber, setConsumerNumber] = useState("");
  const [billingMonth, setBillingMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);

  async function extract() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await extractElectricityBill(file);
      setResult(data);
      setUnits(data.unitsConsumed ?? units);
      setAmount(data.billAmount ?? amount);
      setProvider(data.provider ?? "");
      setConsumerNumber(data.consumerNumber ?? "");
      setBillingMonth(data.billingMonth ?? "");
    } catch (err: any) {
      setError({
        title: err.code === "INVALID_ELECTRICITY_BILL" ? "Invalid bill uploaded" : "Could not read bill clearly",
        message: err.message ?? "Please upload a clearer photo/screenshot or enter your electricity units manually."
      });
    } finally {
      setLoading(false);
    }
  }

  function useValues() {
    const monthlyUnits = Math.max(0, units);
    update("monthlyElectricityKwh", monthlyUnits);
    update("electricityEstimationMethod", "bill_upload");
    update("electricityData", { monthlyUnits, billAmount: amount, billingMonth, consumerNumber, provider, extractedFromBill: true, extractionMethod: "OCR" });
  }

  return (
    <div className="space-y-4">
      <FileUploadCard file={file} onFile={setFile} />
      <Button type="button" variant="secondary" disabled={!file || loading} onClick={extract}>{loading ? "Reading your electricity bill..." : "Extract Bill Data"}</Button>
      {loading && <p className="rounded-lg bg-neon-green/10 p-3 text-sm text-neon-green">Checking if this is a valid electricity bill and extracting units...</p>}
      {error && (
        <div className="rounded-lg border border-red-300/30 bg-red-950/30 p-4">
          <h3 className="font-bold text-red-100">{error.title}</h3>
          <p className="mt-2 text-sm text-red-100/80">{error.message}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => { setFile(null); setResult(null); setError(null); }}>Upload Again</Button>
            <Button type="button" onClick={() => { setError(null); }}>Enter Units Manually</Button>
          </div>
        </div>
      )}
      {result && (
        <div className="rounded-lg border border-neon-green/30 bg-neon-green/10 p-4">
          <p className="font-bold">Electricity bill detected</p>
          <p className="mt-1 text-sm text-slate-300">We found these details. Please confirm or correct them.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label><span className="label">Provider</span><input className="field mt-1" value={provider} onChange={(event) => setProvider(event.target.value)} /></label>
            <label><span className="label">Consumer number</span><input className="field mt-1" value={consumerNumber} onChange={(event) => setConsumerNumber(event.target.value)} /></label>
            <label><span className="label">Units consumed</span><input className="field mt-1" type="number" value={units} onChange={(event) => setUnits(Number(event.target.value))} /></label>
            <label><span className="label">Bill amount</span><input className="field mt-1" type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></label>
            <label><span className="label">Billing month</span><input className="field mt-1" value={billingMonth} onChange={(event) => setBillingMonth(event.target.value)} /></label>
          </div>
          <p className="mt-3 text-xs text-slate-400">{result.message}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={useValues}>Use These Values</Button>
            <Button type="button" variant="secondary" onClick={() => { setFile(null); setResult(null); }}>Upload Another Bill</Button>
          </div>
        </div>
      )}
    </div>
  );
}
