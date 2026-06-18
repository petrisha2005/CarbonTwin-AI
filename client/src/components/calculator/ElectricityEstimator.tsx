import { Camera, HelpCircle, Keyboard, PlugZap, ReceiptText } from "lucide-react";
import { useMemo, useState } from "react";
import { OptionCard } from "../ui/OptionCard";
import { SliderInput } from "../ui/SliderInput";
import { StepperInput } from "../ui/StepperInput";
import { BillUploadEstimator } from "./BillUploadEstimator";
import { PaymentScreenshotEstimator } from "./PaymentScreenshotEstimator";

const placeBase: Record<string, number> = { hostel: 1.5, small_home: 3, apartment: 5, large_house: 8 };
const acKwh: Record<string, number> = { none: 0, lt1: 0.8, h1_3: 2.5, h3_6: 5, gt6: 8 };
const fanKwh: Record<string, number> = { none: 0, low: 0.3, normal: 0.6, high: 1 };
const applianceKwh: Record<string, number> = { fridge: 1.2, washing_machine: 0.5, tv: 0.4, laptop: 0.3, water_heater: 2, iron: 0.5, microwave: 0.3, none: 0 };

const placeOptions = [
  ["hostel", "Hostel / PG"],
  ["small_home", "Small home"],
  ["apartment", "Apartment"],
  ["large_house", "Large house"]
];

const acOptions = [
  ["none", "No AC"],
  ["lt1", "Less than 1 hour"],
  ["h1_3", "1-3 hours"],
  ["h3_6", "3-6 hours"],
  ["gt6", "More than 6 hours"]
];

const fanOptions = [
  ["none", "No fan usage"],
  ["low", "Low fan usage"],
  ["normal", "Normal fan usage"],
  ["high", "High fan usage"]
];

const applianceOptions = [
  ["fridge", "Fridge"],
  ["washing_machine", "Washing machine"],
  ["tv", "TV"],
  ["laptop", "Laptop / PC"],
  ["water_heater", "Water heater"],
  ["iron", "Iron"],
  ["microwave", "Microwave"],
  ["none", "None"]
];

const usageOptions = [
  ["low", "Low overall usage"],
  ["normal", "Normal overall usage"],
  ["high", "High overall usage"]
];

type SmartState = {
  place: string;
  members: number;
  ac: string;
  fan: string;
  usage: string;
  appliances: string[];
};

export function ElectricityEstimator({ form, update }: { form: Record<string, any>; update: (name: string, value: any) => void }) {
  const saved = form.electricityData ?? {};
  const [mode, setMode] = useState(String(form.electricityEstimationMethod ?? ""));
  const [touched, setTouched] = useState(false);
  const [smart, setSmart] = useState<SmartState>({
    place: saved.placeType ?? "",
    members: Number(saved.peopleSharingElectricity ?? saved.householdMembers ?? 1),
    ac: saved.acUsage ?? saved.acUsageLevel ?? "",
    fan: saved.fanUsage ?? saved.fanUsageLevel ?? "",
    usage: saved.overallUsage ?? "",
    appliances: Array.isArray(saved.appliancesUsed) ? saved.appliancesUsed : []
  });

  const estimate = useMemo(() => calculateEstimate(smart), [smart]);
  const complete = isComplete(smart);

  function setMethod(value: string) {
    setMode(value);
    update("electricityEstimationMethod", value);
    if (value !== "smart_estimate") {
      update("electricityData", { ...(form.electricityData ?? {}), smartEstimateComplete: false });
    }
  }

  function updateSmart(next: Partial<SmartState>) {
    setTouched(true);
    setSmart((current) => {
      const merged = { ...current, ...next };
      const nextEstimate = calculateEstimate(merged);
      const nextComplete = isComplete(merged);
      update("electricityData", {
        ...(form.electricityData ?? {}),
        placeType: merged.place,
        peopleSharingElectricity: merged.members,
        acUsage: merged.ac,
        fanUsage: merged.fan,
        appliancesUsed: merged.appliances,
        overallUsage: merged.usage,
        estimatedDailyKwh: nextEstimate.dailyKwh,
        estimatedElectricityCO2: nextEstimate.co2,
        smartEstimateComplete: nextComplete,
        calculationMethod: "Smart estimate"
      });
      if (nextComplete) {
        update("monthlyElectricityKwh", Math.round(nextEstimate.dailyKwh * 30));
        update("acHoursPerDay", merged.ac === "none" ? 0 : merged.ac === "lt1" ? 0.5 : merged.ac === "h1_3" ? 2 : merged.ac === "h3_6" ? 4.5 : 7);
        update("fanHoursPerDay", merged.fan === "none" ? 0 : merged.fan === "low" ? 3 : merged.fan === "normal" ? 6 : 10);
        update("applianceUsageLevel", merged.usage === "high" ? "high" : merged.usage === "normal" ? "medium" : "low");
      }
      return merged;
    });
  }

  function toggleAppliance(value: string) {
    if (value === "none") {
      updateSmart({ appliances: ["none"] });
      return;
    }
    const current = smart.appliances.filter((item) => item !== "none");
    const appliances = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    updateSmart({ appliances });
  }

  const showValidation = touched || mode === "smart_estimate";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Electricity without technical confusion</h2>
        <p className="mt-2 text-slate-400">Don’t know exact units? No problem. We’ll estimate using simple lifestyle questions.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <OptionCard selected={mode === "bill_upload"} icon={<Camera />} title="Upload Bill" description="Best accuracy. Upload your electricity bill." onClick={() => setMethod("bill_upload")} />
        <OptionCard selected={mode === "payment_screenshot"} icon={<ReceiptText />} title="Upload Payment Screenshot" description="Paid through UPI, PhonePe, GPay, Paytm, bank, or autopay? Upload payment proof." onClick={() => setMethod("payment_screenshot")} />
        <OptionCard selected={mode === "manual_units"} icon={<Keyboard />} title="Enter Units" description="I know my monthly units/kWh." onClick={() => setMethod("manual_units")} />
        <OptionCard selected={mode === "smart_estimate"} icon={<HelpCircle />} title="Estimate for Me" description="I don't know my exact usage." onClick={() => setMethod("smart_estimate")} />
      </div>
      {!mode && <p className="rounded-lg border border-neon-green/20 bg-neon-green/10 px-3 py-2 text-sm text-slate-200">Choose one electricity input method to continue.</p>}
      {mode === "bill_upload" && <BillUploadEstimator update={update} />}
      {mode === "payment_screenshot" && <PaymentScreenshotEstimator update={update} onSwitchManual={() => setMethod("manual_units")} />}
      {mode === "manual_units" && (
        <div className="space-y-4">
          <QuestionBlock index={1} title="How many units did your bill show?" helper="You can find units on your electricity bill as Units Consumed or kWh.">
            <SliderInput label="Monthly units/kWh" value={Number(form.monthlyElectricityKwh)} min={0} max={1000} chips={[60, 120, 180, 300]} onChange={(value) => { update("monthlyElectricityKwh", value); update("electricityData", { monthlyUnits: value, dailyKwh: value / 30 }); }} />
          </QuestionBlock>
          <QuestionBlock index={2} title="How many people share this electricity usage?" helper="We divide the household usage among people sharing it.">
            <StepperInput label="People sharing electricity" value={Number(form.electricityData?.householdMembers ?? 1)} min={1} max={10} onChange={(value) => update("electricityData", { ...(form.electricityData ?? {}), householdMembers: value })} />
          </QuestionBlock>
        </div>
      )}
      {mode === "smart_estimate" && (
        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <QuestionBlock index={1} title="What type of place do you live in?" helper="This helps us estimate your base daily electricity usage." error={showValidation && !smart.place ? "Please choose one option." : ""}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {placeOptions.map(([value, title]) => <OptionCard key={value} selected={smart.place === value} title={title} onClick={() => updateSmart({ place: value })} />)}
              </div>
            </QuestionBlock>
            <QuestionBlock index={2} title="How many people share this electricity usage?" helper="We divide the estimated household usage among the people sharing it.">
              <StepperInput label="People sharing electricity" value={smart.members} min={1} max={10} onChange={(value) => updateSmart({ members: value })} />
            </QuestionBlock>
            <QuestionBlock index={3} title="Did you use AC today?" helper="Approximate is enough. Choose the closest option." error={showValidation && !smart.ac ? "Please choose one option." : ""}>
              <div className="grid gap-3 md:grid-cols-2">
                {acOptions.map(([value, title]) => <OptionCard key={value} selected={smart.ac === value} title={title} onClick={() => updateSmart({ ac: value })} />)}
              </div>
            </QuestionBlock>
            <QuestionBlock index={4} title="How much did you use fans today?" helper="Choose based on your overall fan usage for the day." error={showValidation && !smart.fan ? "Please choose one option." : ""}>
              <div className="grid gap-3 md:grid-cols-2">
                {fanOptions.map(([value, title]) => <OptionCard key={value} selected={smart.fan === value} title={title} onClick={() => updateSmart({ fan: value })} />)}
              </div>
            </QuestionBlock>
            <QuestionBlock index={5} title="Which appliances were used today?" helper="Select only the major appliances used today. Choose None if no major appliance was used." error={showValidation && smart.appliances.length === 0 ? "Please select at least one appliance or choose None." : ""}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {applianceOptions.map(([value, title]) => <OptionCard key={value} selected={smart.appliances.includes(value)} title={title} onClick={() => toggleAppliance(value)} />)}
              </div>
            </QuestionBlock>
            <QuestionBlock index={6} title="Overall, how was your electricity usage today?" helper="Your best guess is fine. This adjusts the final estimate." error={showValidation && !smart.usage ? "Please choose one option." : ""}>
              <div className="grid gap-3 md:grid-cols-3">
                {usageOptions.map(([value, title]) => <OptionCard key={value} selected={smart.usage === value} title={title} onClick={() => updateSmart({ usage: value })} />)}
              </div>
            </QuestionBlock>
            {!complete && <p className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">Please answer all electricity estimate questions to continue.</p>}
          </div>
          <EstimateSummary estimate={estimate} complete={complete} people={smart.members} />
        </div>
      )}
    </div>
  );
}

function calculateEstimate(smart: SmartState) {
  if (!isComplete(smart)) return { dailyKwh: 0, co2: 0, personalShare: 0 };
  const applianceTotal = smart.appliances.reduce((sum, item) => sum + (applianceKwh[item] ?? 0), 0);
  const adjustment = smart.usage === "low" ? 0.85 : smart.usage === "high" ? 1.2 : 1;
  const personalShare = (placeBase[smart.place] ?? 0) / Math.max(1, smart.members);
  const dailyKwh = ((placeBase[smart.place] ?? 0) / Math.max(1, smart.members) + (acKwh[smart.ac] ?? 0) + (fanKwh[smart.fan] ?? 0) + applianceTotal) * adjustment;
  return {
    dailyKwh: Math.round(dailyKwh * 100) / 100,
    co2: Math.round(dailyKwh * 0.82 * 100) / 100,
    personalShare: Math.round(personalShare * 100) / 100
  };
}

function isComplete(smart: SmartState) {
  return Boolean(smart.place && smart.members >= 1 && smart.ac && smart.fan && smart.appliances.length > 0 && smart.usage);
}

function QuestionBlock({ index, title, helper, error, children }: { index: number; title: string; helper: string; error?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
      <p className="label text-neon-green">Question {index} of 6</p>
      <h3 className="mt-2 text-lg font-black text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{helper}</p>
      <div className="mt-4">{children}</div>
      {error && <p className="mt-3 text-sm text-amber-200">{error}</p>}
    </section>
  );
}

function EstimateSummary({ estimate, complete, people }: { estimate: { dailyKwh: number; co2: number; personalShare: number }; complete: boolean; people: number }) {
  return (
    <aside className="h-fit rounded-lg border border-neon-green/25 bg-neon-green/10 p-5 xl:sticky xl:top-24">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-neon-green text-carbon-950">
          <PlugZap size={20} />
        </span>
        <div>
          <p className="label">Your electricity estimate</p>
          <h3 className="font-black">Smart estimate</h3>
        </div>
      </div>
      <div className="mt-5 space-y-3 text-sm">
        <SummaryRow label="Estimated daily kWh" value={complete ? `${estimate.dailyKwh} kWh` : "Waiting for answers"} />
        <SummaryRow label="Estimated electricity CO2" value={complete ? `${estimate.co2} kg` : "Waiting for answers"} />
        <SummaryRow label="Personal share" value={complete ? `${estimate.personalShare} kWh base / ${people} people` : `${people} person`} />
        <SummaryRow label="Calculation method" value="Smart estimate" />
      </div>
      <p className="mt-5 rounded-lg bg-white/10 p-3 text-xs leading-5 text-slate-300">These values are approximate and used for awareness. CarbonTwin uses estimates to help you understand patterns, not to create a perfect audit.</p>
    </aside>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.05] px-3 py-2"><span className="text-slate-300">{label}</span><span className="text-right font-bold text-white">{value}</span></div>;
}
