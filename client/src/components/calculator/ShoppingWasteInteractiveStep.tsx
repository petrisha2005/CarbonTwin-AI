import { OptionCard } from "../ui/OptionCard";
import { StepperInput } from "../ui/StepperInput";
import { ToggleCard } from "../ui/ToggleCard";

export function ShoppingWasteInteractiveStep({ form, update }: { form: Record<string, any>; update: (name: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Did you shop today?</h2>
        <p className="mt-2 text-slate-400">Common actions are one click. Approximate is enough.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <OptionCard selected={form.onlineOrdersPerMonth !== "" && form.clothingPurchasesPerMonth !== "" && Number(form.onlineOrdersPerMonth) === 0 && Number(form.clothingPurchasesPerMonth) === 0} title="No shopping" impact="Best choice" onClick={() => { update("onlineOrdersPerMonth", 0); update("clothingPurchasesPerMonth", 0); }} />
        <OptionCard selected={form.onlineOrdersPerMonth !== "" && Number(form.onlineOrdersPerMonth) > 0 && Number(form.onlineOrdersPerMonth) <= 5} title="Small online order" impact="Medium impact" onClick={() => { update("onlineOrdersPerMonth", 3); update("clothingPurchasesPerMonth", 0); }} />
        <OptionCard selected={form.clothingPurchasesPerMonth !== "" && Number(form.clothingPurchasesPerMonth) > 0} title="Clothes/fashion" impact="High impact" onClick={() => { update("onlineOrdersPerMonth", 0); update("clothingPurchasesPerMonth", 1); }} />
        <OptionCard selected={form.onlineOrdersPerMonth !== "" && Number(form.onlineOrdersPerMonth) > 5} title="Electronics/large item" impact="High impact" onClick={() => { update("onlineOrdersPerMonth", 6); update("clothingPurchasesPerMonth", 0); }} />
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <h3 className="font-bold text-white">How much single-use plastic did you use?</h3>
        <p className="mt-1 text-sm text-slate-400">Choose low if you did not use much plastic. If you did not shop or eat packaged food, low is a valid answer.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["low", "medium", "high"].map((level) => <OptionCard key={level} selected={form.plasticUsageLevel === level} title={`${level} plastic`} onClick={() => update("plasticUsageLevel", level)} />)}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <ToggleCard checked={form.recyclingHabit === "often"} label="Recycled or reused something today?" onChange={(checked) => update("recyclingHabit", checked ? "often" : "never")} />
        <StepperInput label="Online orders per month" value={Number(form.onlineOrdersPerMonth || 0)} min={0} max={30} onChange={(value) => { update("onlineOrdersPerMonth", value); if (form.clothingPurchasesPerMonth === "") update("clothingPurchasesPerMonth", 0); }} />
      </div>
    </div>
  );
}
