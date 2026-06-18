import { ArrowRight, BarChart3, Gift, Leaf } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CarbonTwinAvatar } from "../components/twin/CarbonTwinAvatar";
import { EvolutionTimeline } from "../components/twin/EvolutionTimeline";
import { PersonalityCard } from "../components/twin/PersonalityCard";
import { TreeGrowthCard } from "../components/twin/TreeGrowthCard";
import { TwinMessageCard } from "../components/twin/TwinMessageCard";
import { TwinStatsGrid } from "../components/twin/TwinStatsGrid";
import type { EquippedItems } from "../lib/types";
import { getEquippedItems } from "../services/shopService";
import { getTwinProfile, type TwinProfile } from "../services/twinService";

export function TwinPage() {
  const [profile, setProfile] = useState<TwinProfile | null>(null);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTwinProfile()
      .then(setProfile)
      .catch((err: any) => setError(err.message ?? "Could not load CarbonTwin"))
      .finally(() => setLoading(false));
    getEquippedItems().then((data) => setEquippedItems(data.equippedItems ?? {})).catch(() => undefined);
  }, []);

  if (loading) return <p className="text-slate-300">Awakening your CarbonTwin...</p>;

  if (error) {
    return (
      <Card>
        <h2 className="text-2xl font-black text-red-200">CarbonTwin could not load</h2>
        <p className="mt-2 text-slate-400">{error}</p>
      </Card>
    );
  }

  if (!profile) return null;

  const noLogs = profile.user.totalLoggedDays === 0;

  if (noLogs) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Card className="max-w-2xl text-center">
          <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-slate-500/10 text-5xl">🌱</div>
          <h1 className="mt-5 text-3xl font-black">Your CarbonTwin is waiting to awaken</h1>
          <p className="mt-3 text-slate-400">Complete your first Eco Quest to create your personal climate intelligence twin.</p>
          <Link to="/eco-quest" className="mt-6 inline-flex">
            <Button><Leaf size={18} /> Start Eco Quest</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-sm font-semibold text-neon-green">Take care of your CarbonTwin, and your CarbonTwin helps you take care of the planet.</p>
        <h1 className="mt-2 text-4xl font-black">Your CarbonTwin</h1>
        <p className="mt-2 text-slate-400">Your personal climate intelligence twin grows with every better choice you make.</p>
      </Card>

      <CarbonTwinAvatar
        mood={profile.twin.avatarMood}
        moodMessage={profile.twin.moodMessage}
        ecoTitle={profile.twin.ecoTitle}
        level={profile.user.level}
        xp={profile.user.xp}
        xpProgressPercent={profile.twin.xpProgressPercent}
        leafCoins={profile.user.leafCoins}
        streak={profile.user.currentStreak}
        equippedItems={equippedItems}
      />

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <TreeGrowthCard
          stage={profile.twin.treeStage}
          description={profile.twin.treeStageDescription}
          nextStage={profile.twin.nextTreeStage}
          nextGoal={profile.twin.nextEvolutionGoal}
          progress={profile.twin.xpProgressPercent}
        />
        <PersonalityCard
          type={profile.twin.personalityType}
          description={profile.twin.personalityDescription}
          category={profile.twin.mainImpactCategory}
        />
      </div>

      <EvolutionTimeline stages={profile.twin.evolutionStages} current={profile.twin.evolutionStage} nextGoal={profile.twin.nextEvolutionGoal} />

      <TwinStatsGrid stats={profile.stats} user={profile.user} />

      <TwinMessageCard message={profile.twin.twinMessage} />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
        <Card>
          <h3 className="text-xl font-black">Weekly status</h3>
          <p className="mt-2 text-neon-green">{profile.twin.weeklyStatus.replace("_", " ")}</p>
          <p className="mt-3 text-slate-300">{profile.twin.weeklyStatusMessage}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Info label="Best low-carbon day" value={profile.stats.bestLowCarbonDay ?? "No data yet"} />
            <Info label="Highest impact category" value={profile.stats.highestImpactCategory} />
          </div>
        </Card>
        <Card>
          <h3 className="text-xl font-black">Recent Eco Quests</h3>
          <div className="mt-4 space-y-3">
            {profile.recentLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-lg bg-white/[0.05] p-3 text-sm">
                <span>{log.date}</span>
                <span className="font-bold text-neon-green">{log.netCO2} kg net</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-black">Next best moves</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/eco-quest"><Button><Leaf size={18} /> Complete Today's Eco Quest</Button></Link>
          <Link to="/dashboard"><Button variant="secondary"><BarChart3 size={18} /> View Dashboard</Button></Link>
          <Link to="/carbon-wrapped"><Button variant="secondary"><Gift size={18} /> Open Carbon Wrapped</Button></Link>
          <Link to="/ai-coach"><Button variant="ghost">Open AI Coach <ArrowRight size={18} /></Button></Link>
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-white/[0.05] p-4"><p className="label">{label}</p><p className="mt-2 font-bold">{value}</p></div>;
}
