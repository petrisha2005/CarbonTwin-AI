import { Crown } from "lucide-react";
import { Card } from "../Card";

export function BattleResultCard({ battle }: { battle: any }) {
  if (battle.status !== "completed") return null;
  const winner = battle.leaderboard?.find((row: any) => row.userId === battle.winnerId) ?? battle.leaderboard?.[0];
  return (
    <Card className="border border-amber-300/35 bg-amber-300/10">
      <h2 className="flex items-center gap-2 text-2xl font-black text-amber-100"><Crown /> Battle completed. Rewards unlocked.</h2>
      <p className="mt-2 text-slate-200">Winner: <span className="font-black text-amber-100">{winner?.displayName ?? "Eco Player"}</span></p>
      <p className="mt-1 text-sm text-slate-300">Winner received 150 XP and 75 LeafCoins. Participants received 50 XP and 20 LeafCoins.</p>
    </Card>
  );
}
