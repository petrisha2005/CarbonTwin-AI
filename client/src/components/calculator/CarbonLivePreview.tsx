import { motion } from "framer-motion";
import { Car, Leaf, PlugZap, ShoppingBag, Utensils } from "lucide-react";
import { Card } from "../Card";

const factors: Record<string, number> = { walking: 0, bicycle: 0, metro: 0.04, train: 0.04, bus: 0.08, two_wheeler_petrol: 0.08, car_petrol: 0.19, car_diesel: 0.17, ev: 0.05 };

export function previewCarbon(form: Record<string, any>) {
  const transportCO2 = Number(form.dailyDistanceKm ?? 0) * Number(form.weeklyTravelDays ?? 0) * 4.33 * (factors[String(form.transportMode)] ?? 0);
  const electricityCO2 = Number(form.monthlyElectricityKwh ?? 0) * 0.82 + Number(form.acHoursPerDay ?? 0) * 1.2 * 30 * 0.82 + Number(form.fanHoursPerDay ?? 0) * 0.075 * 30 * 0.82;
  const dietBase: Record<string, number> = { vegan: 45, vegetarian: 60, mixed: 90, non_vegetarian: 120 };
  const foodCO2 = (dietBase[String(form.dietType)] ?? 0) + Number(form.foodDeliveryPerWeek ?? 0) * 4 * 1.2 + ({ low: 5, medium: 12, high: 22 }[String(form.packagedFoodLevel)] ?? 0);
  const shoppingCO2 = Math.max(0, Number(form.onlineOrdersPerMonth ?? 0) * 1.8 + Number(form.clothingPurchasesPerMonth ?? 0) * 8 + ({ low: 4, medium: 10, high: 18 }[String(form.plasticUsageLevel)] ?? 0) - ({ never: 0, sometimes: 5, often: 12 }[String(form.recyclingHabit)] ?? 0));
  const totalCO2 = transportCO2 + electricityCO2 + foodCO2 + shoppingCO2;
  return {
    transportCO2: Math.round(transportCO2 * 10) / 10,
    electricityCO2: Math.round(electricityCO2 * 10) / 10,
    foodCO2: Math.round(foodCO2 * 10) / 10,
    shoppingCO2: Math.round(shoppingCO2 * 10) / 10,
    totalCO2: Math.round(totalCO2 * 10) / 10,
    petrolKm: Math.round(totalCO2 / 0.192)
  };
}

export function CarbonLivePreview({ form }: { form: Record<string, any> }) {
  const data = previewCarbon(form);
  return (
    <Card className="sticky top-24">
      <p className="text-xs font-semibold uppercase tracking-wide text-neon-green">Live carbon preview</p>
      <motion.p key={data.totalCO2} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-4xl font-black text-white">
        {data.totalCO2} kg
      </motion.p>
      <p className="mt-1 text-sm text-slate-400">Monthly estimate. CO2 values are estimates to help you understand patterns.</p>
      <div className="mt-5 space-y-3">
        <Row icon={Car} label="Transport" value={data.transportCO2} />
        <Row icon={PlugZap} label="Electricity" value={data.electricityCO2} />
        <Row icon={Utensils} label="Food" value={data.foodCO2} />
        <Row icon={ShoppingBag} label="Shopping/Waste" value={data.shoppingCO2} />
      </div>
      <div className="mt-5 rounded-lg bg-neon-green/10 p-3 text-sm text-neon-green">
        Today's pattern equals roughly {data.petrolKm} km in a petrol car.
      </div>
    </Card>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Leaf; label: string; value: number }) {
  return <div className="flex items-center justify-between rounded-lg bg-white/[0.05] p-3 text-sm"><span className="flex items-center gap-2 text-slate-300"><Icon size={16} className="text-neon-green" /> {label}</span><span className="font-bold">{value} kg</span></div>;
}
