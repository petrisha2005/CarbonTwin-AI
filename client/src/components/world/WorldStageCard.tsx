import { Card } from "../Card";

export function WorldStageCard({ world }: { world: any }) {
  return (
    <Card>
      <h3 className="text-xl font-black">World Stage</h3>
      <p className="mt-2 text-neon-green">{world?.stage?.name}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {world?.stage?.elements?.map((item: string) => <span key={item} className="rounded-lg bg-white/10 px-3 py-2 text-sm text-slate-200">{item}</span>)}
      </div>
    </Card>
  );
}
