import { Lightbulb } from "lucide-react";
import { Card } from "../Card";

export function BudgetSuggestions({ suggestions }: { suggestions: string[] }) {
  return (
    <Card>
      <h3 className="flex items-center gap-2 text-xl font-black"><Lightbulb className="text-neon-green" /> Suggestions</h3>
      <div className="mt-4 space-y-2">
        {suggestions.length ? suggestions.map((suggestion) => (
          <p key={suggestion} className="rounded-lg bg-white/[0.05] px-3 py-2 text-sm text-slate-200">{suggestion}</p>
        )) : <p className="text-sm text-slate-400">Keep logging Eco Quests to unlock sharper category suggestions.</p>}
      </div>
    </Card>
  );
}
