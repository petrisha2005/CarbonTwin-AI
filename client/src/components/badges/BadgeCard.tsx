import { Award, Lock } from "lucide-react";
import type { Badge } from "../../services/badgeService";

export function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div className={`rounded-lg border p-4 ${badge.unlocked ? "border-neon-green/40 bg-neon-green/10" : "border-white/10 bg-white/[0.04] opacity-75"}`}>
      <div className="flex items-start justify-between gap-3">
        <Award className={badge.unlocked ? "text-neon-green" : "text-slate-500"} />
        {!badge.unlocked && <Lock size={16} className="text-slate-500" />}
      </div>
      <h3 className="mt-3 font-bold">{badge.title}</h3>
      <p className="mt-1 text-sm text-slate-400">{badge.description}</p>
      <p className="mt-3 text-xs text-neon-cyan">Reward: {badge.xpBonus} XP, {badge.leafCoinBonus} LeafCoins</p>
    </div>
  );
}
