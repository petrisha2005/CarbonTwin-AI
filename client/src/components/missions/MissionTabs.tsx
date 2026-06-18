export type MissionTab = "all" | "daily" | "weekly" | "special" | "transport" | "electricity" | "food" | "shopping_waste" | "habit" | "completed";

export function MissionTabs({ active, onChange }: { active: MissionTab; onChange: (tab: MissionTab) => void }) {
  const tabs: Array<[MissionTab, string]> = [
    ["all", "All"],
    ["daily", "Daily"],
    ["weekly", "Weekly"],
    ["special", "Special"],
    ["transport", "Transport"],
    ["electricity", "Electricity"],
    ["food", "Food"],
    ["shopping_waste", "Shopping/Waste"],
    ["habit", "Habit"],
    ["completed", "Completed"]
  ];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map(([tab, label]) => (
        <button key={tab} onClick={() => onChange(tab)} className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${active === tab ? "bg-neon-green text-carbon-950 shadow-glow" : "border border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/10"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}
