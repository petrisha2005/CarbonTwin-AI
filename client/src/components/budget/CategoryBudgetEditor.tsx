import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "../Button";
import { Card } from "../Card";

export function CategoryBudgetEditor({ monthlyBudget, split, saving, onSave }: { monthlyBudget: number; split: Record<string, number>; saving?: boolean; onSave: (split: Record<string, number>) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(split);
  useEffect(() => setForm(split), [split]);
  const total = useMemo(() => Math.round(Object.values(form).reduce((sum, value) => sum + Number(value || 0), 0) * 10) / 10, [form]);
  const mismatch = Math.abs(total - monthlyBudget) > 0.5;
  return (
    <Card>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-black">Category Budget Editor</h3>
          <p className="mt-1 text-sm text-slate-400">Adjust how your monthly target is split across lifestyle categories.</p>
        </div>
        <Button variant="secondary" onClick={() => setOpen(!open)}><SlidersHorizontal size={16} /> Adjust Category Budgets</Button>
      </div>
      {open && (
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <Field label="Transport budget" value={form.transport} onChange={(transport) => setForm({ ...form, transport })} />
          <Field label="Electricity budget" value={form.electricity} onChange={(electricity) => setForm({ ...form, electricity })} />
          <Field label="Food budget" value={form.food} onChange={(food) => setForm({ ...form, food })} />
          <Field label="Shopping & Waste budget" value={form.shoppingWaste} onChange={(shoppingWaste) => setForm({ ...form, shoppingWaste })} />
          <div className="md:col-span-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className={mismatch ? "text-amber-200" : "text-neon-green"}>Total: {total} / {monthlyBudget} kg</p>
            <Button disabled={saving || mismatch} onClick={() => onSave(form)}>Save Category Split</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label><span className="label">{label}</span><input className="field mt-1" type="number" min={0} step={0.1} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}
