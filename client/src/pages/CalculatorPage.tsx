import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CarbonLivePreview } from "../components/calculator/CarbonLivePreview";
import { ElectricityEstimator } from "../components/calculator/ElectricityEstimator";
import { FoodInteractiveStep } from "../components/calculator/FoodInteractiveStep";
import { ShoppingWasteInteractiveStep } from "../components/calculator/ShoppingWasteInteractiveStep";
import { TransportInteractiveStep } from "../components/calculator/TransportInteractiveStep";
import { StepProgress } from "../components/ui/StepProgress";
import { useAuth } from "../context/AuthContext";
import { ApiError, api } from "../lib/api";
import type { Summary, User } from "../lib/types";
import { getPostLoginRedirect, type OnboardingStatus } from "../services/onboardingService";

const defaults: Record<string, any> = {
  dailyDistanceKm: "",
  transportMode: "",
  weeklyTravelDays: "",
  monthlyElectricityKwh: 0,
  acHoursPerDay: 0,
  fanHoursPerDay: 0,
  applianceUsageLevel: "",
  electricityEstimationMethod: "",
  electricityData: { householdMembers: 1 },
  dietType: "",
  foodDeliveryPerWeek: "",
  packagedFoodLevel: "",
  onlineOrdersPerMonth: "",
  clothingPurchasesPerMonth: "",
  plasticUsageLevel: "",
  recyclingHabit: ""
};

const steps = ["Transport", "Electricity", "Food", "Shopping & Waste"];

function isBlank(value: unknown) {
  return value === "" || value == null;
}

function cleanPayload(data: any): any {
  if (Array.isArray(data)) return data.map(cleanPayload);
  if (!data || typeof data !== "object") return data;
  return Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== "")
      .map(([key, value]) => [key, cleanPayload(value)])
  );
}

export function CalculatorPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, any>>(defaults);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectMessage = (location.state as { message?: string } | null)?.message;

  function update(name: string, value: any) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validateCurrentStep() {
    return validateStep(step);
  }

  function validateStep(stepToValidate: number) {
    const noTravel = form.transportMode === "no_travel";
    const noShopping = form.onlineOrdersPerMonth !== "" && form.clothingPurchasesPerMonth !== "" && Number(form.onlineOrdersPerMonth) === 0 && Number(form.clothingPurchasesPerMonth) === 0;
    if (stepToValidate === 0 && !form.transportMode && !noTravel) return "Please select a transport mode or choose no travel.";
    if (stepToValidate === 0 && !noTravel && Number(form.dailyDistanceKm) <= 0) return "Please enter how far you traveled, or choose no travel.";
    if (stepToValidate === 1 && !form.electricityEstimationMethod) return "Please choose how you want to enter electricity usage.";
    if (stepToValidate === 1 && form.electricityEstimationMethod === "smart_estimate" && !form.electricityData?.smartEstimateComplete) return "Please answer all electricity estimate questions to continue.";
    if (stepToValidate === 1 && form.electricityEstimationMethod === "manual_units" && Number(form.monthlyElectricityKwh) <= 0) return "Please enter your monthly electricity units.";
    if (stepToValidate === 1 && form.electricityEstimationMethod === "bill_upload" && Number(form.monthlyElectricityKwh) <= 0) return "Please confirm the units from your electricity bill.";
    if (stepToValidate === 1 && form.electricityEstimationMethod === "payment_screenshot" && Number(form.monthlyElectricityKwh) <= 0) return "Please confirm the estimate from your payment screenshot.";
    if (stepToValidate === 2 && !form.dietType) return "Please select your food choice.";
    if (stepToValidate === 2 && !form.packagedFoodLevel) return "Please choose a packaged food/drinks option.";
    if (stepToValidate === 3 && form.onlineOrdersPerMonth === "") return "Please select a shopping option.";
    if (stepToValidate === 3 && !noShopping && !form.plasticUsageLevel) return "Please select plastic usage.";
    return "";
  }

  function validateAllSteps() {
    for (let index = 0; index < steps.length; index += 1) {
      const message = validateStep(index);
      if (message) return { message, step: index };
    }
    return { message: "", step };
  }

  function normalizedForm() {
    const noTravel = form.transportMode === "no_travel";
    const noShopping = form.onlineOrdersPerMonth !== "" && form.clothingPurchasesPerMonth !== "" && Number(form.onlineOrdersPerMonth) === 0 && Number(form.clothingPurchasesPerMonth) === 0;
    const electricityData = form.electricityData ?? {};
    const overallUsage = electricityData.overallUsage;
    const applianceUsageLevel = form.applianceUsageLevel || (overallUsage === "high" ? "high" : overallUsage === "normal" ? "medium" : overallUsage === "low" ? "low" : "");
    return cleanPayload({
      ...form,
      transportMode: noTravel ? "walking" : form.transportMode,
      dailyDistanceKm: noTravel ? 0 : form.dailyDistanceKm,
      weeklyTravelDays: noTravel ? 0 : form.weeklyTravelDays,
      packagedFoodLevel: form.packagedFoodLevel || "low",
      applianceUsageLevel,
      electricityData,
      onlineOrdersPerMonth: form.onlineOrdersPerMonth === "" ? 0 : form.onlineOrdersPerMonth,
      clothingPurchasesPerMonth: form.clothingPurchasesPerMonth === "" ? 0 : form.clothingPurchasesPerMonth,
      plasticUsageLevel: noShopping ? "low" : form.plasticUsageLevel,
      recyclingHabit: form.recyclingHabit || "never"
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    if (step < steps.length - 1) {
      setStep((value) => value + 1);
      return;
    }
    const fullValidation = validateAllSteps();
    if (fullValidation.message) {
      setStep(fullValidation.step);
      setError(fullValidation.message);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api<Summary & { user: User; onboarding?: OnboardingStatus }>("/carbon/calculate", { method: "POST", body: JSON.stringify(normalizedForm()) });
      setUser(data.user);
      navigate(getPostLoginRedirect(data.onboarding ?? data.user.onboarding as OnboardingStatus), { replace: true });
    } catch (err: any) {
      const firstFieldError = err instanceof ApiError ? err.errors?.[0]?.message : "";
      const message = firstFieldError || err.message;
      setError(message && !message.includes("Invalid enum value") ? message : "Please complete all required calculator fields before calculating.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {redirectMessage && <Card><p className="text-neon-green">{redirectMessage}</p></Card>}
      {!user?.onboarding?.hasCompletedBaselineCalculator && (
        <Card className="border-neon-green/30 bg-neon-green/10">
          <p className="label text-neon-green">Step 3 of 7</p>
          <h2 className="mt-2 text-2xl font-black">Step 3: Calculate Your Baseline Footprint</h2>
          <p className="mt-2 text-slate-300">This one-time calculator helps CarbonTwin understand your usual lifestyle impact. After this, your daily Eco Quests will track improvements.</p>
          <p className="mt-3 text-sm font-semibold text-neon-green">Complete baseline assessment</p>
        </Card>
      )}
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-neon-green">No guilt. No technical confusion.</p>
        <h1 className="mt-1 text-3xl font-black">First, let’s calculate your baseline footprint.</h1>
        <p className="mt-2 text-slate-400">Simple choices are enough. CO2 values are estimates to help you understand patterns.</p>
        <div className="mt-6">
          <StepProgress steps={steps} active={step} />
        </div>
      </Card>

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            {step === 0 && <TransportInteractiveStep form={form} update={update} />}
            {step === 1 && <ElectricityEstimator form={form} update={update} />}
            {step === 2 && <FoodInteractiveStep form={form} update={update} />}
            {step === 3 && <ShoppingWasteInteractiveStep form={form} update={update} />}
            {error && <p className="mt-5 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
            <div className="mt-7 flex justify-between gap-3">
              <Button type="button" variant="secondary" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>Back</Button>
              <Button disabled={loading}>{step === steps.length - 1 ? (loading ? "Calculating..." : "Calculate Footprint") : "Next"}</Button>
            </div>
          </Card>
        </motion.div>
        <CarbonLivePreview form={form} />
      </form>
    </div>
  );
}
