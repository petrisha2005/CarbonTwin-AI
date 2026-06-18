import { FormEvent, useEffect, useState } from "react";
import { Button } from "../Button";
import { Card } from "../Card";
import { OptionCard } from "../ui/OptionCard";

const presets = [
  { key: "beginner", title: "Beginner Budget", value: 160, description: "160 kg CO2/month" },
  { key: "balanced", title: "Balanced Budget", value: 120, description: "120 kg CO2/month" },
  { key: "challenge", title: "Challenge Budget", value: 90, description: "90 kg CO2/month" },
  { key: "custom", title: "Custom Budget", value: 0, description: "Enter your own monthly limit." }
];

export function BudgetGoalCard({ monthlyBudget, message, saving, onSave }: { monthlyBudget: number; message?: string; saving?: boolean; onSave: (value: number) => void }) {
  const [value, setValue] = useState(monthlyBudget);
  const [selectedStyle, setSelectedStyle] = useState("");
  useEffect(() => setValue(monthlyBudget), [monthlyBudget]);
  function submit(event: FormEvent) {
    event.preventDefault();
    onSave(value);
  }
  return (
    <Card>
      <p className="text-sm font-semibold text-neon-green">Carbon Budget Planner</p>
      <h2 className="mt-1 text-2xl font-black">What budget style do you want?</h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">Choose a realistic monthly budget in kg CO2. You can adjust it anytime.</p>
      {message && <p className="mt-3 rounded-lg bg-neon-green/10 px-3 py-2 text-sm text-neon-green">{message}</p>}
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {presets.map((preset) => (
          <OptionCard
            key={preset.key}
            selected={selectedStyle === preset.key}
            title={preset.title}
            description={preset.description}
            onClick={() => {
              setSelectedStyle(preset.key);
              if (preset.key !== "custom") setValue(preset.value);
            }}
          />
        ))}
      </div>
      <form onSubmit={submit} className="mt-5 flex flex-col gap-3 sm:max-w-xl sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="label">Monthly carbon budget</span>
          <input className="field mt-1" type="number" value={value} onChange={(event) => setValue(Number(event.target.value))} min={1} max={5000} />
        </label>
        <Button disabled={saving}>{saving ? "Saving..." : "Save Budget"}</Button>
      </form>
    </Card>
  );
}
