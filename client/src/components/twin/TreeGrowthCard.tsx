import { Sprout } from "lucide-react";
import { Card } from "../Card";

const treeIcons: Record<string, string> = {
  Seed: "🌱",
  Sprout: "🌿",
  "Small Plant": "🪴",
  "Young Tree": "🌳",
  "Big Tree": "🌲",
  "Forest Guardian Tree": "🌳✨"
};

export function TreeGrowthCard({ stage, description, nextStage, nextGoal, progress }: { stage: string; description: string; nextStage: string; nextGoal: string; progress: number }) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className="grid h-20 w-20 place-items-center rounded-lg bg-neon-green/15 text-5xl">{treeIcons[stage] ?? "🌱"}</div>
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-neon-green"><Sprout size={16} /> CarbonTwin Tree</p>
          <h3 className="text-2xl font-black">{stage}</h3>
        </div>
      </div>
      <p className="mt-4 text-slate-300">{description}</p>
      <div className="mt-5 h-3 rounded-full bg-white/10"><div className="h-3 rounded-full bg-neon-green" style={{ width: `${progress}%` }} /></div>
      <p className="mt-3 text-sm text-slate-400">Next: {nextStage}. {nextGoal}</p>
    </Card>
  );
}
