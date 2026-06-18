export function SliderInput({ label, value, min, max, step = 1, unit, chips = [], onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; chips?: number[]; onChange: (value: number) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="label">{label}</label>
        <input className="field w-28 py-1.5 text-right" type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      </div>
      <input className="w-full accent-neon-green" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button key={chip} type="button" onClick={() => onChange(chip)} className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-slate-200 hover:border-neon-green hover:text-neon-green">
            {chip}{unit}
          </button>
        ))}
      </div>
    </div>
  );
}
