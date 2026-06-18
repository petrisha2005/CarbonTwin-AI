import { Swords, Trophy } from "lucide-react";
import { Card } from "../Card";

export function BattleHeroCard({ stats }: { stats: { active: number; wins: number; co2Saved: number; points: number } }) {
  return (
    <Card>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-neon-green"><Swords size={16} /> Compete with friends. Save carbon together.</p>
          <h1 className="mt-1 text-3xl font-black">Eco Battles</h1>
          <p className="mt-2 text-slate-400">Challenge friends and compete through real sustainable actions.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-4 xl:min-w-[620px]">
          <Mini label="Active" value={stats.active} />
          <Mini label="Wins" value={stats.wins} />
          <Mini label="CO2 saved" value={`${stats.co2Saved} kg`} />
          <Mini label="Battle points" value={stats.points} />
        </div>
      </div>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg border border-neon-green/20 bg-neon-green/10 px-3 py-3"><p className="label">{label}</p><p className="mt-1 flex items-center gap-2 text-xl font-black"><Trophy size={16} className="text-neon-green" /> {value}</p></div>;
}
