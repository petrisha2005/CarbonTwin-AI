import { Flame } from "lucide-react";
import { Button } from "../Button";
import { Card } from "../Card";

export function BossFightCard({ boss, onClaim }: { boss: any; onClaim: () => void }) {
  const hpPercent = boss?.maxHP ? Math.round((boss.currentHP / boss.maxHP) * 100) : 100;
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-red-200">Weekly Boss Fight</p>
          <h3 className="mt-1 text-2xl font-black">{boss?.monsterName ?? "Carbon Monster"}</h3>
          <p className="mt-2 text-sm text-slate-400">Tiny actions weaken the Carbon Monster.</p>
        </div>
        <Flame className="text-red-300" size={34} />
      </div>
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm"><span>HP</span><span>{boss?.currentHP ?? 100}/{boss?.maxHP ?? 100}</span></div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-red-300" style={{ width: `${hpPercent}%` }} /></div>
      </div>
      {boss?.defeated && <p className="mt-4 rounded-lg bg-neon-green/10 p-3 text-neon-green">Boss defeated! Your CarbonTwin World is cleaner this week.</p>}
      {boss?.defeated && !boss?.rewardsClaimed && <Button className="mt-4" onClick={onClaim}>Claim 100 XP + 50 LeafCoins</Button>}
      <div className="mt-5 space-y-2">
        {(boss?.actions ?? []).slice(0, 4).map((action: any, index: number) => (
          <div key={`${action.title}-${index}`} className="flex justify-between rounded-lg bg-white/[0.05] p-3 text-sm"><span>{action.title}</span><span className="text-red-200">-{action.damage} HP</span></div>
        ))}
      </div>
    </Card>
  );
}
