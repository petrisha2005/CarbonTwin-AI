import type { LeaderboardType } from "../../services/leaderboardService";

const tabs: Array<{ id: LeaderboardType; label: string }> = [
  { id: "global", label: "Global" },
  { id: "city", label: "City" },
  { id: "college", label: "College" },
  { id: "department", label: "Department" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" }
];

export function LeaderboardTabs({ active, onChange }: { active: LeaderboardType; onChange: (tab: LeaderboardType) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            active === tab.id ? "bg-neon-green text-carbon-950 shadow-glow" : "border border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/10"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
