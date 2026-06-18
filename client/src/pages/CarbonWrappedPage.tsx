import { Share2, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { api } from "../lib/api";

type Wrapped = {
  totalCO2ThisWeek: number;
  totalCO2SavedThisWeek: number;
  bestLowCarbonDay: string | null;
  highestImpactCategory: string;
  missionsCompleted: number;
  xpEarned: number;
  leafCoinsEarned: number;
  streakProgress: number;
  personalityEvolution: string;
  beatCommunityPercent: number;
  equivalents: { phoneCharges: number; petrolKm: number; treeDays: number };
};

export function CarbonWrappedPage() {
  const [wrapped, setWrapped] = useState<Wrapped | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shared, setShared] = useState(false);
  useEffect(() => {
    api<Wrapped>("/carbon-wrapped/week")
      .then(setWrapped)
      .catch((err: any) => setError(err.message ?? "Could not load Carbon Wrapped"))
      .finally(() => setLoading(false));
  }, []);

  async function shareWrapped() {
    if (!wrapped) return;
    const text = `My CarbonTwin week: ${wrapped.totalCO2SavedThisWeek} kg CO2 saved, ${wrapped.missionsCompleted} Eco Quest day(s), and ${wrapped.leafCoinsEarned} LeafCoins earned.`;
    await navigator.clipboard?.writeText(text).catch(() => undefined);
    setShared(true);
  }

  if (loading) return <p className="text-slate-300">Loading your Carbon Wrapped...</p>;

  if (error) {
    return (
      <Card>
        <h2 className="text-2xl font-black text-red-200">Carbon Wrapped could not load</h2>
        <p className="mt-2 text-slate-400">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <p className="text-sm font-semibold text-neon-green">Weekly Carbon Wrapped</p>
        <h2 className="mt-2 text-4xl font-black">Your week, wrapped in tiny wins.</h2>
        <p className="mt-3 text-slate-300">No guilt. Just the choices that moved your CarbonTwin forward.</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="CO2 this week" value={`${wrapped?.totalCO2ThisWeek ?? 0} kg`} />
        <Metric label="CO2 saved" value={`${wrapped?.totalCO2SavedThisWeek ?? 0} kg`} />
        <Metric label="Eco quests" value={wrapped?.missionsCompleted ?? 0} />
        <Metric label="XP earned" value={wrapped?.xpEarned ?? 0} />
        <Metric label="LeafCoins" value={wrapped?.leafCoinsEarned ?? 0} />
        <Metric label="Streak progress" value={`${wrapped?.streakProgress ?? 0} days`} />
      </div>
      <Card>
        <h3 className="flex items-center gap-2 text-2xl font-black"><Sparkles className="text-neon-green" /> Your recap</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Line text={`This week, you saved ${wrapped?.totalCO2SavedThisWeek ?? 0} kg CO2.`} />
          <Line text={`Your best day was ${wrapped?.bestLowCarbonDay ?? "waiting to be unlocked"}.`} />
          <Line text={`Your biggest improvement came from ${wrapped?.highestImpactCategory ?? "balanced choices"}.`} />
          <Line text={`You beat ${wrapped?.beatCommunityPercent ?? 50}% of users in your community.`} />
          <Line text={`Your saving equals charging a phone ${wrapped?.equivalents.phoneCharges ?? 0} times.`} />
          <Line text={`Personality evolution: ${wrapped?.personalityEvolution ?? "Eco Explorer"}.`} />
        </div>
      </Card>
      <Card className="text-center">
        <Trophy className="mx-auto text-amber-300" size={42} />
        <h3 className="mt-3 text-2xl font-black">Share my Carbon Wrapped</h3>
        <p className="mt-2 text-slate-400">Tiny action, real impact.</p>
        <Button className="mt-5" onClick={shareWrapped}><Share2 size={18} /> {shared ? "Summary copied" : "Share my Carbon Wrapped"}</Button>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <Card><p className="label">{label}</p><p className="mt-2 text-2xl font-black text-neon-green">{value}</p></Card>;
}

function Line({ text }: { text: string }) {
  return <div className="rounded-lg bg-white/[0.05] p-4 text-sm text-slate-200">{text}</div>;
}
