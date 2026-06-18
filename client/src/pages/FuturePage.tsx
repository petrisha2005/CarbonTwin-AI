import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../components/Card";
import { treesNeeded } from "../lib/carbon";
import { carbonEquivalents } from "../lib/gamification";
import { useSummary } from "../lib/useSummary";

export function FuturePage() {
  const { summary } = useSummary();
  const log = summary?.latestLog;
  const [cuts, setCuts] = useState({ travel: 0, electricity: 0, food: 0, shopping: 0 });
  const ecoTotal = useMemo(() => {
    if (!log) return 0;
    return Math.round(
      log.transportCO2 * (1 - cuts.travel / 100) +
      log.electricityCO2 * (1 - cuts.electricity / 100) +
      log.foodCO2 * (1 - cuts.food / 100) +
      log.shoppingCO2 * (1 - cuts.shopping / 100)
    );
  }, [log, cuts]);
  const current = log?.totalCO2 ?? 0;
  const savedMonthly = Math.max(0, current - ecoTotal);
  const hasScenario = Object.values(cuts).some((value) => value > 0);

  if (!log) {
    return (
      <Card>
        <h1 className="text-2xl font-black">Future Simulation</h1>
        <p className="mt-2 text-slate-400">Complete your first calculator scan or Eco Quest to simulate future carbon reductions.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <FutureCard title="Current Me" monthly={current} score={summary?.score ?? 0} />
        <FutureCard title="Eco Me" monthly={ecoTotal} score={hasScenario ? Math.min(100, (summary?.score ?? 0) + 15) : (summary?.score ?? 0)} />
      </div>
      <Card>
        <h2 className="text-xl font-bold">What if?</h2>
        <p className="mt-2 text-sm text-slate-400">Move one or more sliders to create your own future scenario. Nothing is assumed by default.</p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {Object.entries(cuts).map(([key, value]) => (
            <label key={key}>
              <div className="mb-2 flex justify-between text-sm"><span className="capitalize">{key} reduction</span><span>{value}%</span></div>
              <input className="w-full accent-neon-green" type="range" min="0" max="60" value={value} onChange={(event) => setCuts((currentCuts) => ({ ...currentCuts, [key]: Number(event.target.value) }))} />
            </label>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="mb-4 text-xl font-bold">Future Comparison</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={[{ name: "Monthly saved", kg: savedMonthly }, { name: "Yearly saved", kg: savedMonthly * 12 }, { name: "5-year saved", kg: savedMonthly * 60 }]}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="kg" fill="#06B6D4" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function FutureCard({ title, monthly, score }: { title: string; monthly: number; score: number }) {
  const yearly = monthly * 12;
  const equivalents = carbonEquivalents(yearly);
  return (
    <Card>
      <h3 className="text-2xl font-black">{title}</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label="Projected yearly CO2" value={`${Math.round(yearly)} kg`} />
        <Metric label="Projected 5-year CO2" value={`${Math.round(monthly * 60)} kg`} />
        <Metric label="Impact category" value={score >= 80 ? "Low impact" : score >= 60 ? "Moderate impact" : "High impact"} />
        <Metric label="Trees needed/year" value={`${treesNeeded(yearly)} trees`} />
        <Metric label="Petrol equivalent" value={`${Math.round(yearly / 2.3)} liters`} />
        <Metric label="Phone charges equivalent" value={`${equivalents.phoneCharges} charges`} />
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-white/[0.06] p-4"><p className="label">{label}</p><p className="mt-2 text-lg font-bold">{value}</p></div>;
}
