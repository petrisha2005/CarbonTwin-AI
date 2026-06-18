import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { SetupProgress } from "../components/onboarding/SetupProgress";
import { OptionCard } from "../components/ui/OptionCard";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { User } from "../lib/types";
import { completeGoalSetup } from "../services/onboardingService";

const goals = [
  ["tracking_habit", "Build daily tracking habit"],
  ["reduce_10", "Reduce monthly footprint by 10%"],
  ["save_electricity", "Save electricity"],
  ["travel_smarter", "Travel smarter"],
  ["reduce_delivery", "Reduce food delivery"],
  ["less_plastic", "Less plastic lifestyle"],
  ["monthly_budget", "Stay under monthly carbon budget"],
  ["campus_league", "Join Campus Carbon League"],
  ["custom", "Custom goal"]
];

export function GoalSetupPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");
  const [custom, setCustom] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected) return setError("Please select your goal first.");
    if (selected === "custom" && !custom.trim()) return setError("Please enter your custom goal.");
    setSaving(true);
    setError("");
    try {
      const label = selected === "custom" ? custom.trim() : goals.find(([id]) => id === selected)?.[1] ?? "";
      const response = await api<{ user?: User; data?: { user?: User } }>("/profile", {
        method: "PATCH",
        body: JSON.stringify({ climateGoal: selected, goals: { carbonGoalType: selected, primaryGoalLabel: label } })
      });
      setUser(response.data?.user ?? response.user ?? null);
      await completeGoalSetup();
      navigate("/budget", { replace: true });
    } catch (err: any) {
      setError(err.message ?? "Could not save goal.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SetupProgress step="Step 4 of 7: Goal" percent={57} />
      <Card>
        <h1 className="text-3xl font-black">Based on your baseline, choose where to improve first.</h1>
        <p className="mt-2 text-slate-400">{recommendGoal(user?.baselineFootprint) || "Complete your calculator first so CarbonTwin can recommend the best starting goal."}</p>
      </Card>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          {goals.map(([id, title]) => (
            <OptionCard key={id} selected={selected === id} title={title} description={id === "tracking_habit" ? "Recommended if you have no data yet." : ""} onClick={() => setSelected(id)} />
          ))}
        </div>
        {selected === "custom" && <input className="field" value={custom} onChange={(event) => setCustom(event.target.value)} placeholder="Describe your custom goal" />}
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
        <Button disabled={saving || !selected}>{saving ? "Saving..." : "Continue to Budget"}</Button>
      </form>
    </div>
  );
}

function recommendGoal(baseline?: User["baselineFootprint"]) {
  if (!baseline?.totalCO2) return "";
  const entries = [
    ["transport", baseline.transportCO2, "Travel Smarter"],
    ["electricity", baseline.electricityCO2, "Save Electricity"],
    ["food", baseline.foodCO2, "Reduce Food Delivery / Lower-Carbon Meals"],
    ["shoppingWaste", baseline.shoppingWasteCO2, "Less Plastic / No Unnecessary Shopping"]
  ] as const;
  const top = [...entries].sort((a, b) => b[1] - a[1])[0];
  return `Recommended from your baseline: ${top[2]}.`;
}
