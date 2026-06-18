import type { ShopCategory } from "../../lib/types";

const filters: Array<{ key: ShopCategory | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "avatar_aura", label: "Aura" },
  { key: "outfit", label: "Outfit" },
  { key: "pet", label: "Pets" },
  { key: "tree_style", label: "Trees" },
  { key: "profile_frame", label: "Frames" },
  { key: "background", label: "Backgrounds" }
];

export function ShopFilters({ active, onChange }: { active: ShopCategory | "all"; onChange: (value: ShopCategory | "all") => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onChange(filter.key)}
          className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
            active === filter.key ? "border-neon-green bg-neon-green text-carbon-950" : "border-white/10 bg-white/[0.05] text-slate-200 hover:bg-white/10"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
