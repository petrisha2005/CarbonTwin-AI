import { useState } from "react";
import { Copy, Plus, X } from "lucide-react";
import { Button } from "../Button";
import { CustomSelect } from "../ui/CustomSelect";

export function CreateBattleModal({ open, busy, result, onClose, onCreate }: { open: boolean; busy?: boolean; result?: any; onClose: () => void; onCreate: (body: any) => void }) {
  const [form, setForm] = useState({ title: "", description: "", battleType: "", goalType: "", duration: "", endDate: "", maxParticipants: 5, collegeName: "", department: "" });
  const [error, setError] = useState("");
  if (!open) return null;
  const code = result?.data?.battleCode;
  function submit() {
    if (!form.title.trim()) return setError("Please enter a battle title.");
    if (!form.battleType) return setError("Please choose a battle type.");
    if (!form.goalType) return setError("Please choose a battle goal.");
    if (!form.duration) return setError("Please choose a duration.");
    if (form.duration === "custom" && !form.endDate) return setError("Please choose an end date.");
    setError("");
    onCreate(form);
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4">
      <div className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="label">Create Battle</p>
            <h2 className="mt-1 text-2xl font-black">{code ? "Battle Created!" : "Create New Battle"}</h2>
          </div>
          <Button variant="ghost" onClick={onClose} aria-label="Close"><X size={18} /></Button>
        </div>
        {code ? (
          <div className="mt-5 space-y-4">
            <p className="text-slate-300">Share this code with friends:</p>
            <div className="rounded-lg border border-neon-green/30 bg-neon-green/10 p-5 text-center text-3xl font-black text-neon-green">{code}</div>
            <Button onClick={() => navigator.clipboard?.writeText(code)}><Copy size={16} /> Copy Code</Button>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Battle title" value={form.title} onChange={(title) => setForm({ ...form, title })} />
            <CustomSelect label="Battle type" value={form.battleType} placeholder="Choose battle type" options={["one_v_one", "group", "campus"]} onChange={(battleType) => setForm({ ...form, battleType })} />
            <label className="sm:col-span-2"><span className="label">Description</span><textarea className="field mt-1 min-h-24 resize-none" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
            <CustomSelect label="Goal type" value={form.goalType} placeholder="Choose battle goal" options={["most_co2_saved", "most_eco_quests", "most_missions_completed", "highest_eco_score"]} onChange={(goalType) => setForm({ ...form, goalType })} />
            <CustomSelect label="Duration" value={form.duration} placeholder="Choose duration" options={["1_day", "3_days", "7_days", "custom"]} onChange={(duration) => setForm({ ...form, duration })} />
            {form.duration === "custom" && <Field label="End date" type="date" value={form.endDate} onChange={(endDate) => setForm({ ...form, endDate })} />}
            <Field label="Max participants" type="number" value={String(form.maxParticipants)} onChange={(value) => setForm({ ...form, maxParticipants: Number(value) })} />
            {form.battleType === "campus" && <Field label="College name" value={form.collegeName} onChange={(collegeName) => setForm({ ...form, collegeName })} />}
            {form.battleType === "campus" && <Field label="Department" value={form.department} onChange={(department) => setForm({ ...form, department })} />}
            {error && <p className="rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-sm text-amber-100 sm:col-span-2">{error}</p>}
            <Button disabled={busy || !form.title.trim() || !form.battleType || !form.goalType || !form.duration} onClick={submit} className="sm:col-span-2"><Plus size={16} /> Create Battle</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; type?: string; onChange: (value: string) => void }) {
  return <label><span className="label">{label}</span><input className="field mt-1" type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
