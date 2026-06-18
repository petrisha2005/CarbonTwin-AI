import type { CategoryBudget } from "../../services/budgetService";
import { Card } from "../Card";
import { CategoryBudgetCard } from "./CategoryBudgetCard";

export function CategoryBudgetUsage({ items, hasLogs }: { items: CategoryBudget[]; hasLogs: boolean }) {
  return (
    <Card>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-xl font-black">Category-wise Budget Usage</h3>
          <p className="mt-1 text-sm text-slate-400">Category budgets are auto-suggested. You can adjust them anytime.</p>
        </div>
        {!hasLogs && <span className="rounded-lg bg-white/10 px-3 py-2 text-sm text-slate-300">Start completing Eco Quests to see category-wise budget usage.</span>}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => <CategoryBudgetCard key={item.key} item={item} />)}
      </div>
    </Card>
  );
}
