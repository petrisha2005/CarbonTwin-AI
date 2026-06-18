import { CheckCircle2 } from "lucide-react";
import clsx from "clsx";

type Props = {
  selected?: boolean;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  impact?: string;
  onClick: () => void;
};

export function OptionCard({ selected, icon, title, description, impact, onClick }: Props) {
  return (
    <button
      type="button"
      aria-pressed={Boolean(selected)}
      onClick={onClick}
      className={clsx(
        "group relative rounded-lg border p-4 text-left transition hover:border-neon-green/60 hover:bg-neon-green/10 focus:outline-none focus:ring-2 focus:ring-neon-green/70 focus:ring-offset-2 focus:ring-offset-carbon-950",
        selected ? "border-neon-green bg-neon-green/15 shadow-glow" : "border-white/10 bg-white/[0.04]"
      )}
    >
      {selected && <CheckCircle2 className="absolute right-3 top-3 text-neon-green" size={18} />}
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-3 font-bold text-white">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      {impact && <p className="mt-3 rounded-md bg-white/10 px-2 py-1 text-xs text-neon-green">{impact}</p>}
    </button>
  );
}
