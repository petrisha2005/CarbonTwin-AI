import { Card } from "../Card";

export function WorldImpactSummary({ world }: { world: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Metric label="Level" value={world?.stats?.level ?? 1} />
      <Metric label="Streak" value={`${world?.stats?.streak ?? 0} days`} />
      <Metric label="CO2 saved" value={`${world?.stats?.totalCO2Saved ?? 0} kg`} />
      <Metric label="LeafCoins" value={world?.stats?.leafCoins ?? 0} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <Card><p className="label">{label}</p><p className="mt-2 text-2xl font-black text-neon-green">{value}</p></Card>;
}
