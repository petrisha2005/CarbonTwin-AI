import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { BattleCard } from "../components/battles/BattleCard";
import { BattleHeroCard } from "../components/battles/BattleHeroCard";
import { BattleTabs } from "../components/battles/BattleTabs";
import { CreateBattleModal } from "../components/battles/CreateBattleModal";
import { JoinBattleCard } from "../components/battles/JoinBattleCard";
import { createBattle, getMyBattles, joinBattle } from "../services/battleService";

export function BattlesPage() {
  const [groups, setGroups] = useState<any>({ activeBattles: [], upcomingBattles: [], completedBattles: [], battles: [] });
  const [tab, setTab] = useState<"active" | "upcoming" | "completed">("active");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [created, setCreated] = useState<any>(null);

  async function load() {
    setLoading(true);
    setGroups(await getMyBattles());
    setLoading(false);
  }

  useEffect(() => {
    load().catch((error: any) => {
      setMessage(error.message ?? "Could not load battles.");
      setLoading(false);
    });
  }, []);

  async function run(fn: () => Promise<any>, after?: (result: any) => void) {
    setBusy(true);
    setMessage("");
    try {
      const result = await fn();
      setMessage(result.message ?? "Battle updated.");
      after?.(result);
      await load();
    } catch (error: any) {
      setMessage(error.message ?? "Battle action failed.");
    } finally {
      setBusy(false);
    }
  }

  const visible = tab === "active" ? groups.activeBattles : tab === "upcoming" ? groups.upcomingBattles : groups.completedBattles;
  const stats = useMemo(() => {
    const battles = groups.battles ?? [];
    const wins = battles.filter((battle: any) => battle.status === "completed" && battle.leaderboard?.[0]?.rank === 1).length;
    return {
      active: groups.activeBattles?.length ?? 0,
      wins,
      co2Saved: Math.round(battles.reduce((total: number, battle: any) => total + (battle.participants ?? []).reduce((sum: number, p: any) => sum + Number(p.co2Saved ?? 0), 0), 0) * 10) / 10,
      points: battles.reduce((total: number, battle: any) => total + (battle.participants ?? []).reduce((sum: number, p: any) => sum + Number(p.score ?? 0), 0), 0)
    };
  }, [groups]);

  if (loading) return <Card><p className="text-slate-300">Loading Eco Battles...</p></Card>;

  return (
    <div className="space-y-6">
      <BattleHeroCard stats={stats} />
      {message && <Card><p className={message.toLowerCase().includes("could") || message.toLowerCase().includes("required") || message.toLowerCase().includes("already") ? "text-amber-200" : "text-neon-green"}>{message}</p></Card>}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <p className="label">Create Battle</p>
          <h2 className="mt-1 text-2xl font-black">Start a friendly challenge</h2>
          <p className="mt-2 text-slate-400">Choose a goal, get a code, and invite friends to compete through real Eco Quests and Missions.</p>
          <Button className="mt-5" onClick={() => { setCreated(null); setModalOpen(true); }}>Create New Battle</Button>
        </Card>
        <JoinBattleCard busy={busy} onJoin={(code) => run(() => joinBattle(code))} />
      </div>
      <div className="space-y-4">
        <BattleTabs active={tab} onChange={setTab} />
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((battle: any) => <BattleCard key={battle.id} battle={battle} />)}
          {!visible.length && <Card><p className="text-slate-400">Create your first Eco Battle or join one with a code.</p></Card>}
        </div>
      </div>
      <CreateBattleModal open={modalOpen} busy={busy} result={created} onClose={() => setModalOpen(false)} onCreate={(body) => run(() => createBattle(body), setCreated)} />
    </div>
  );
}
