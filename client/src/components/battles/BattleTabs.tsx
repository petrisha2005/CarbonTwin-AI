export function BattleTabs({ active, onChange }: { active: "active" | "upcoming" | "completed"; onChange: (tab: "active" | "upcoming" | "completed") => void }) {
  const tabs = [
    ["active", "Active"],
    ["upcoming", "Upcoming"],
    ["completed", "Completed"]
  ] as const;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map(([key, label]) => (
        <button key={key} onClick={() => onChange(key)} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${active === key ? "border-neon-green bg-neon-green text-carbon-950" : "border-white/10 bg-white/[0.05] text-slate-200"}`}>{label}</button>
      ))}
    </div>
  );
}
