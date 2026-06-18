import { Card } from "../Card";

export function BudgetSummaryCards({ summary }: { summary: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Metric label="Monthly Carbon Budget" value={`${summary.monthlyBudget} kg`} />
      <Metric label="Used Carbon" value={`${summary.usedCarbon} kg`} />
      <Metric label="Remaining Carbon" value={`${summary.remainingCarbon} kg`} tone={summary.remainingCarbon < 0 ? "bad" : "good"} />
      <Metric label="Budget Used" value={`${summary.usedPercent}%`} tone={summary.usedPercent > 100 ? "bad" : summary.usedPercent >= 75 ? "warn" : "good"} />
    </div>
  );
}

function Metric({ label, value, tone = "normal" }: { label: string; value: string; tone?: "normal" | "good" | "warn" | "bad" }) {
  return <Card><p className="label">{label}</p><p className={`mt-2 text-3xl font-black ${tone === "bad" ? "text-red-300" : tone === "warn" ? "text-amber-200" : tone === "good" ? "text-neon-green" : ""}`}>{value}</p></Card>;
}
