import clsx from "clsx";

export function ToggleCard({ checked, label, description, onChange }: { checked: boolean; label: string; description?: string; onChange: (checked: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={clsx("rounded-lg border p-4 text-left transition", checked ? "border-neon-green bg-neon-green/15" : "border-white/10 bg-white/[0.04] hover:bg-white/10")}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-white">{label}</span>
        <span className={`h-6 w-11 rounded-full p-1 transition ${checked ? "bg-neon-green" : "bg-white/20"}`}>
          <span className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`} />
        </span>
      </div>
      {description && <p className="mt-2 text-sm text-slate-400">{description}</p>}
    </button>
  );
}
