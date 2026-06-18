export function StepperInput({ label, value, min = 0, max = 99, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (value: number) => void }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="label">{label}</p>
      <div className="mt-3 flex items-center justify-between">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-xl hover:bg-neon-green hover:text-carbon-950">-</button>
        <span className="text-2xl font-black">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-xl hover:bg-neon-green hover:text-carbon-950">+</button>
      </div>
    </div>
  );
}
