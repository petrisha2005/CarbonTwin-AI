import { Brain } from "lucide-react";
import { Card } from "../Card";

export function PersonalityCard({ type, description, category }: { type: string; description: string; category: string }) {
  return (
    <Card>
      <h3 className="flex items-center gap-2 text-xl font-black"><Brain className="text-neon-cyan" /> You are a {type}</h3>
      <p className="mt-3 text-slate-300">{description}</p>
      <div className="mt-5 rounded-lg bg-white/[0.05] p-4">
        <p className="label">Main impact category</p>
        <p className="mt-1 font-bold text-neon-green">{category}</p>
      </div>
    </Card>
  );
}
