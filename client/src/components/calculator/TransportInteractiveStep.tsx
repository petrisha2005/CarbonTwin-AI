import { Bike, Bus, Car, Footprints, TrainFront, Zap } from "lucide-react";
import { OptionCard } from "../ui/OptionCard";
import { SliderInput } from "../ui/SliderInput";
import { StepperInput } from "../ui/StepperInput";

const modes = [
  ["no_travel", "No travel", <Footprints />, "No travel today"],
  ["walking", "Walking", <Footprints />, "Zero impact"],
  ["bicycle", "Bicycle", <Bike />, "Zero impact"],
  ["bus", "Bus", <Bus />, "Low impact"],
  ["metro", "Metro", <TrainFront />, "Low impact"],
  ["train", "Train", <TrainFront />, "Low impact"],
  ["two_wheeler_petrol", "Two-wheeler", <Bike />, "Medium impact"],
  ["car_petrol", "Petrol Car", <Car />, "High impact"],
  ["car_diesel", "Diesel Car", <Car />, "High impact"],
  ["ev", "EV", <Zap />, "Low impact"]
];

export function TransportInteractiveStep({ form, update }: { form: Record<string, any>; update: (name: string, value: any) => void }) {
  const low = ["walking", "bicycle", "bus", "metro", "train", "ev"].includes(String(form.transportMode));
  const noTravel = form.transportMode === "no_travel";
  function selectMode(value: string) {
    if (value === "no_travel") {
      update("transportMode", "no_travel");
      update("dailyDistanceKm", 0);
      update("weeklyTravelDays", 0);
      return;
    }
    update("transportMode", value);
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">How did you travel today?</h2>
        <p className="mt-2 text-slate-400">{noTravel ? "No travel is a valid answer. We will count transport as 0 kg." : low ? "Nice choice! This travel mode keeps your footprint low." : "No guilt. Try combining trips or switching one short ride this week."}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modes.map(([value, title, icon, impact]) => <OptionCard key={String(value)} selected={value === "no_travel" ? noTravel : form.transportMode === value} icon={icon} title={String(title)} impact={String(impact)} onClick={() => selectMode(String(value))} />)}
      </div>
      <SliderInput label="How far did you travel?" value={Number(form.dailyDistanceKm || 0)} min={0} max={100} unit=" km" chips={[2, 5, 10, 20, 50]} onChange={(value) => update("dailyDistanceKm", value)} />
      <StepperInput label="Weekly travel days" value={Number(form.weeklyTravelDays || 0)} min={0} max={7} onChange={(value) => update("weeklyTravelDays", value)} />
    </div>
  );
}
