import { Award, Coins, Leaf, X, Zap } from "lucide-react";
import { Button } from "../Button";

export function RewardModal({ reward, onClose }: { reward: { xp: number; leafCoins: number; co2Saved: number; badges?: string[] } | null; onClose: () => void }) {
  if (!reward) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-neon-green/40 bg-[#0b1712] p-6 shadow-glow">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-neon-green">Mission Complete!</p>
            <h2 className="mt-1 text-2xl font-black">Your CarbonTwin gained energy.</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-300 hover:bg-white/10"><X size={18} /></button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric icon={Zap} value={`+${reward.xp}`} label="XP" />
          <Metric icon={Coins} value={`+${reward.leafCoins}`} label="LeafCoins" />
          <Metric icon={Leaf} value={`${reward.co2Saved} kg`} label="CO2 saved" />
        </div>
        {reward.badges?.length ? <p className="mt-4 flex items-center gap-2 text-neon-green"><Award size={18} /> Badge Unlocked: {reward.badges.join(", ")}</p> : null}
        <Button className="mt-5 w-full" onClick={onClose}>Keep Going</Button>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, value, label }: { icon: typeof Zap; value: string; label: string }) {
  return <div className="rounded-lg bg-white/[0.06] p-3 text-center"><Icon className="mx-auto text-neon-green" size={18} /><p className="mt-2 font-black">{value}</p><p className="text-xs text-slate-400">{label}</p></div>;
}
