import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import { BossFightCard } from "../components/world/BossFightCard";
import { CarbonTwinWorld } from "../components/world/CarbonTwinWorld";
import { WorldImpactSummary } from "../components/world/WorldImpactSummary";
import { WorldStageCard } from "../components/world/WorldStageCard";
import { claimBossReward, getWorld } from "../services/gameService";

export function WorldPage() {
  const [world, setWorld] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setWorld(await getWorld());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function claimReward() {
    const result = await claimBossReward();
    setMessage(result.message ?? "Reward claimed");
    await load();
  }

  if (loading) return <Card><p className="text-slate-300">Loading CarbonTwin World...</p></Card>;

  return (
    <div className="space-y-6">
      <CarbonTwinWorld world={world} />
      {message && <Card><p className="text-neon-green">{message}</p></Card>}
      <WorldImpactSummary world={world} />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <WorldStageCard world={world} />
        <BossFightCard boss={world?.boss} onClaim={claimReward} />
      </div>
    </div>
  );
}
