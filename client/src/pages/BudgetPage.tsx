import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { BudgetAlerts } from "../components/budget/BudgetAlerts";
import { BudgetGoalCard } from "../components/budget/BudgetGoalCard";
import { BudgetSuggestions } from "../components/budget/BudgetSuggestions";
import { BudgetSummaryCards } from "../components/budget/BudgetSummaryCards";
import { BudgetUsageChart } from "../components/budget/BudgetUsageChart";
import { CategoryBudgetEditor } from "../components/budget/CategoryBudgetEditor";
import { CategoryBudgetUsage } from "../components/budget/CategoryBudgetUsage";
import { getBudgetSummary, saveBudget, updateCategorySplit, type BudgetSummary } from "../services/budgetService";
import { getPostLoginRedirect, type OnboardingStatus } from "../services/onboardingService";

export function BudgetPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setSummary(await getBudgetSummary());
    } catch (err: any) {
      setError(err.message ?? "Could not load budget usage. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveMonthlyBudget(monthlyBudget: number) {
    setSaving(true);
    setMessage("");
    try {
      const result = await saveBudget({ monthlyBudget });
      setMessage(result.message ?? "Budget saved.");
      await load();
      if (result.onboarding) navigate(getPostLoginRedirect(result.onboarding as OnboardingStatus), { replace: true });
    } catch (err: any) {
      setError(err.message ?? "Could not save budget.");
    } finally {
      setSaving(false);
    }
  }

  async function saveSplit(split: Record<string, number>) {
    setSaving(true);
    setMessage("");
    try {
      const result = await updateCategorySplit(split);
      setMessage(result.message ?? "Category split saved.");
      await load();
    } catch (err: any) {
      setError(err.message ?? "Could not save category split.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Card><p className="text-slate-300">Loading budget planner...</p></Card>;

  if (error && !summary) {
    return (
      <Card>
        <h2 className="text-2xl font-black text-red-200">Could not load budget usage</h2>
        <p className="mt-2 text-slate-400">Please try again.</p>
      </Card>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <Card className="border-neon-green/25 bg-neon-green/10">
        <p className="label text-neon-green">Step 5 of 7</p>
        <h1 className="mt-2 text-2xl font-black">Your budget is suggested from your baseline footprint.</h1>
        <p className="mt-2 text-slate-300">CarbonTwin starts with a 10% reduction target and splits category budgets using your baseline proportions.</p>
      </Card>
      <BudgetGoalCard monthlyBudget={summary.monthlyBudget} message={summary.message} saving={saving} onSave={saveMonthlyBudget} />
      {message && <Card><p className="text-neon-green">{message}</p></Card>}
      {error && <Card><p className="text-amber-200">{error}</p></Card>}
      <BudgetSummaryCards summary={summary} />
      <CategoryBudgetUsage items={summary.categoryUsage} hasLogs={summary.hasLogs} />
      <BudgetUsageChart items={summary.categoryUsage} />
      <CategoryBudgetEditor monthlyBudget={summary.monthlyBudget} split={summary.budget.categoryBudgets} saving={saving} onSave={saveSplit} />
      <div className="grid gap-5 xl:grid-cols-2">
        <BudgetAlerts alerts={summary.alerts} />
        <BudgetSuggestions suggestions={summary.suggestions} />
      </div>
    </div>
  );
}
