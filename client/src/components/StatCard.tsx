import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

export function StatCard({ title, value, note, icon: Icon }: { title: string; value: string; note: string; icon: LucideIcon }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          <p className="mt-1 text-sm text-slate-400">{note}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-neon-green/12 text-neon-green">
          <Icon size={22} />
        </span>
      </div>
    </Card>
  );
}
