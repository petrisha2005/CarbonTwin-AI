import { motion } from "framer-motion";
import { Coins, Flame, Trophy } from "lucide-react";
import type { EquippedItems } from "../../lib/types";
import { CarbonTwinAvatar as EquippedCarbonTwinAvatar } from "../avatar/CarbonTwinAvatar";

type Mood = "glowing" | "happy" | "calm" | "tired" | "polluted";

const moodClasses = {
  glowing: "border-neon-green/50 bg-neon-green/15 shadow-glow",
  happy: "border-green-300/40 bg-green-400/10",
  calm: "border-cyan-300/40 bg-cyan-400/10",
  tired: "border-slate-500/30 bg-slate-500/10 opacity-90",
  polluted: "border-amber-300/40 bg-amber-500/10"
};

export function CarbonTwinAvatar({
  mood,
  moodMessage,
  ecoTitle,
  level,
  xp,
  xpProgressPercent,
  leafCoins,
  streak,
  equippedItems
}: {
  mood: Mood;
  moodMessage: string;
  ecoTitle: string;
  level: number;
  xp: number;
  xpProgressPercent: number;
  leafCoins: number;
  streak: number;
  equippedItems?: EquippedItems;
}) {
  return (
    <div className={`relative overflow-hidden rounded-lg border p-6 ${moodClasses[mood]}`}>
      {mood === "polluted" && <motion.div animate={{ opacity: [0.18, 0.45, 0.18] }} transition={{ repeat: Infinity, duration: 2.2 }} className="absolute inset-x-12 top-8 h-20 rounded-full bg-amber-300/20 blur-2xl" />}
      <div className="relative grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
        <div>
          <EquippedCarbonTwinAvatar mood={mood} level={level} equippedItems={equippedItems} size="lg" message={mood} />
        </div>
        <div>
          <p className="text-sm font-semibold text-neon-green">{ecoTitle}</p>
          <h2 className="mt-1 text-4xl font-black">Level {level} CarbonTwin</h2>
          <p className="mt-3 max-w-2xl text-slate-300">{moodMessage}</p>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-neon-green" style={{ width: `${xpProgressPercent}%` }} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Mini icon={Trophy} label="XP" value={xp} />
            <Mini icon={Coins} label="LeafCoins" value={leafCoins} />
            <Mini icon={Flame} label="Streak" value={`${streak}d`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string | number }) {
  return <div className="rounded-lg bg-white/[0.06] p-3"><p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400"><Icon size={14} /> {label}</p><p className="mt-1 font-black">{value}</p></div>;
}
