import { Copy, LogOut, ShieldX } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { BattleActivityFeed } from "../components/battles/BattleActivityFeed";
import { BattleLeaderboard } from "../components/battles/BattleLeaderboard";
import { BattleResultCard } from "../components/battles/BattleResultCard";
import { MyContributionCard } from "../components/battles/MyContributionCard";
import { useAuth } from "../context/AuthContext";
import { cancelBattle, finalizeBattle, getBattleActivity, getBattleById, getBattleLeaderboard, leaveBattle } from "../services/battleService";

export function BattleDetailPage() {
  const { battleId = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [battle, setBattle] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [detail, board, feed] = await Promise.all([getBattleById(battleId), getBattleLeaderboard(battleId), getBattleActivity(battleId)]);
    setBattle(detail.battle);
    setLeaderboard(board.leaderboard ?? []);
    setActivities(feed.activities ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load().catch((error: any) => {
      setMessage(error.message ?? "Could not load battle.");
      setLoading(false);
    });
  }, [battleId]);

  async function run(fn: () => Promise<any>, goBack = false) {
    try {
      const result = await fn();
      setMessage(result.message ?? "Battle updated.");
      if (goBack) navigate("/battles");
      else await load();
    } catch (error: any) {
      setMessage(error.message ?? "Battle action failed.");
    }
  }

  if (loading) return <Card><p className="text-slate-300">Loading battle...</p></Card>;
  if (!battle) return <Card><p className="text-amber-200">{message || "Battle not found."}</p></Card>;
  const me = leaderboard.find((row) => row.userId === user?.id);
  const leader = leaderboard[0];

  return (
    <div className="space-y-6">
      {message && <Card><p className="text-neon-green">{message}</p></Card>}
      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="label">{battle.status}</p>
            <h1 className="mt-1 text-3xl font-black">{battle.title}</h1>
            <p className="mt-2 text-slate-400">{battle.description || "No guilt. Just friendly progress."}</p>
            <p className="mt-4 inline-flex rounded-lg border border-neon-green/30 bg-neon-green/10 px-3 py-2 font-black text-neon-green">{battle.battleCode}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigator.clipboard?.writeText(battle.battleCode)}><Copy size={16} /> Copy Code</Button>
            {battle.status !== "completed" && <Button variant="secondary" onClick={() => run(() => finalizeBattle(battle.id))}>Finalize</Button>}
            {battle.creatorId === user?.id ? <Button variant="ghost" onClick={() => run(() => cancelBattle(battle.id), true)}><ShieldX size={16} /> Cancel</Button> : <Button variant="ghost" onClick={() => run(() => leaveBattle(battle.id), true)}><LogOut size={16} /> Leave</Button>}
          </div>
        </div>
      </Card>
      <BattleResultCard battle={{ ...battle, leaderboard }} />
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <Card>
            <p className="label">Goal</p>
            <h2 className="mt-1 text-2xl font-black">{goalText(battle.goalType)}</h2>
            <p className="mt-2 text-slate-400">Complete an Eco Quest or claim Mission rewards to climb the leaderboard.</p>
          </Card>
          <BattleLeaderboard leaderboard={leaderboard} currentUserId={user?.id} />
        </div>
        <div className="space-y-5">
          <MyContributionCard participant={me} leader={leader} />
          <BattleActivityFeed activities={activities} />
        </div>
      </div>
      <Card>
        <div className="flex flex-wrap gap-3">
          <Link to="/eco-quest"><Button>Complete Eco Quest</Button></Link>
          <Link to="/missions"><Button variant="secondary">Open Missions</Button></Link>
          <Link to="/battles"><Button variant="ghost">Back to Battles</Button></Link>
        </div>
      </Card>
    </div>
  );
}

function goalText(goalType: string) {
  const labels: Record<string, string> = {
    most_co2_saved: "Goal: Save the most CO2 before the battle ends.",
    most_eco_quests: "Goal: Complete the most Eco Quests.",
    most_missions_completed: "Goal: Complete the most Missions.",
    highest_eco_score: "Goal: Earn the highest Eco Score from all actions."
  };
  return labels[goalType] ?? labels.highest_eco_score;
}
