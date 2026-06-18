export function StepProgress({ steps, active }: { steps: string[]; active: number }) {
  return (
    <div>
      <div className="mb-3 flex justify-between text-xs text-slate-400">
        <span>Step {active + 1} of {steps.length}</span>
        <span>{steps[active]}</span>
      </div>
      <div className="flex gap-2">
        {steps.map((step, index) => (
          <div key={step} className={`h-2 flex-1 rounded-full ${index <= active ? "bg-neon-green shadow-glow" : "bg-white/10"}`} />
        ))}
      </div>
    </div>
  );
}
