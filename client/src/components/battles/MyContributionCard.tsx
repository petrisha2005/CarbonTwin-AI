import { Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../Button";
import { Card } from "../Card";

export function MyContributionCard({ participant, leader }: { participant?: any; leader?: any }) {
  const behind = Math.max(0, Number(leader?.score ?? 0) - Number(participant?.score ?? 0));
  return (
    <Card>
      <h2 className="flex items-center gap-2 text-xl font-black"><Target className="text-neon-green" /> My Contribution</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Mini label="Score" value={participant?.score ?? 0} />
        <Mini label="CO2 saved" value={`${participant?.co2Saved ?? 0} kg`} />
        <Mini label="Eco Quests" value={participant?.ecoQuestsCompleted ?? 0} />
        <Mini label="Missions" value={participant?.missionsCompleted ?? 0} />
      </div>
      <p className="mt-4 text-sm text-slate-300">{behind > 0 ? `You are ${behind} points behind Rank 1.` : "You are leading or tied. Keep the streak alive."}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/eco-quest"><Button>Complete Eco Quest</Button></Link>
        <Link to="/missions"><Button variant="secondary">Open Missions</Button></Link>
      </div>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-white/[0.05] p-3"><p className="label">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div>;
}
