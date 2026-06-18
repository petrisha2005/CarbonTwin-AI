import { OptionCard } from "../ui/OptionCard";
import { StepperInput } from "../ui/StepperInput";

const diets = [
  ["vegan", "Vegan", "Lowest impact"],
  ["vegetarian", "Vegetarian", "Low impact"],
  ["mixed", "Mixed", "Medium impact"],
  ["non_vegetarian", "Non-vegetarian", "Higher impact"]
];

const packagedOptions = [
  ["low", "No packaged food/drinks", "Valid if you avoided packaged snacks or bottled drinks"],
  ["medium", "Some packaged food/drinks", "A few packaged items today"],
  ["high", "Lots of packaged food/drinks", "Multiple packaged snacks, drinks, or takeaways"]
];

export function FoodInteractiveStep({ form, update }: { form: Record<string, any>; update: (name: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">What best describes your food today?</h2>
        <p className="mt-2 text-slate-400">Food delivery adds packaging and delivery impact. No guilt, just track it.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {diets.map(([value, title, impact]) => <OptionCard key={value} selected={form.dietType === value} title={title} impact={impact} onClick={() => update("dietType", value)} />)}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <h3 className="font-bold text-white">How often did you order food?</h3>
          <p className="mt-1 text-sm text-slate-400">Zero is a valid answer if you did not order delivery.</p>
          <div className="mt-4">
            <StepperInput label="Food deliveries per week" value={Number(form.foodDeliveryPerWeek)} min={0} max={21} onChange={(value) => update("foodDeliveryPerWeek", value)} />
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <h3 className="font-bold text-white">Did you consume packaged food or bottled drinks today?</h3>
          <p className="mt-1 text-sm text-slate-400">Choose no packaged food/drinks if nothing packaged was consumed.</p>
          <div className="mt-4 grid gap-3">
            {packagedOptions.map(([value, title, impact]) => <OptionCard key={value} selected={form.packagedFoodLevel === value} title={title} impact={impact} onClick={() => update("packagedFoodLevel", value)} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
