import { Car, ShoppingBag, Utensils, Zap } from "lucide-react";
import type { CategoryBudget } from "../../services/budgetService";

const icons = { transport: Car, electricity: Zap, food: Utensils, shoppingWaste: ShoppingBag };
const bar = { safe: "bg-neon-green", close: "bg-amber-300", over: "bg-red-400" };

export function CategoryBudgetCard({ item }: { item: CategoryBudget }) {
  const Icon = icons[item.key];
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="flex items-center gap-2 font-black"><Icon className="text-neon-green" size={18} /> {item.label}</h4>
          <p className="mt-2 text-sm text-slate-300">Used: {item.used} kg / {item.budget} kg</p>
          <p className="mt-1 text-sm text-slate-400">Remaining: {item.remaining} kg</p>
        </div>
        <span className={`rounded-lg px-2 py-1 text-xs font-bold uppercase ${item.status === "over" ? "bg-red-400/15 text-red-200" : item.status === "close" ? "bg-amber-300/15 text-amber-200" : "bg-neon-green/15 text-neon-green"}`}>{item.status}</span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${bar[item.status]}`} style={{ width: `${Math.min(100, item.usedPercent)}%` }} />
      </div>
      <p className="mt-2 text-right text-xs text-slate-400">{item.usedPercent}%</p>
    </div>
  );
}
