import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { SetupProgress } from "../components/onboarding/SetupProgress";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { User } from "../lib/types";
import { completeProfileSetup } from "../services/onboardingService";

export function ProfileSetupPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: user?.displayName || user?.name || "",
    city: user?.city || "",
    collegeName: user?.collegeName || "",
    department: user?.department || "",
    batch: user?.batch || ""
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.displayName.trim()) return setError("Please enter your display name.");
    if (!form.city.trim()) return setError("Please enter your city.");
    setSaving(true);
    setError("");
    try {
      const response = await api<{ user?: User; data?: { user?: User } }>("/profile", { method: "PATCH", body: JSON.stringify(form) });
      setUser(response.data?.user ?? response.user ?? null);
      await completeProfileSetup();
      navigate("/calculator", { replace: true });
    } catch (err: any) {
      setError(err.message ?? "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SetupProgress step="Step 2 of 7: Profile" percent={29} />
      <Card>
        <h1 className="text-3xl font-black">Tell us a little about you</h1>
        <p className="mt-2 text-slate-400">This helps personalize your dashboard, leaderboard, and campus challenges.</p>
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Display name" value={form.displayName} onChange={(displayName) => setForm({ ...form, displayName })} required />
          <Field label="City" value={form.city} onChange={(city) => setForm({ ...form, city })} required />
          <Field label="College name" value={form.collegeName} onChange={(collegeName) => setForm({ ...form, collegeName })} />
          <Field label="Department" value={form.department} onChange={(department) => setForm({ ...form, department })} />
          <Field label="Batch" value={form.batch} onChange={(batch) => setForm({ ...form, batch })} />
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200 sm:col-span-2">{error}</p>}
          <Button className="sm:col-span-2" disabled={saving}>{saving ? "Saving..." : "Continue"}</Button>
        </form>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, required }: { label: string; value: string; required?: boolean; onChange: (value: string) => void }) {
  return <label><span className="label">{label}{required ? " *" : ""}</span><input className="field mt-1" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
