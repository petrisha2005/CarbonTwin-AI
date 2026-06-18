import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Car, Coins, Copy, Leaf, Save, ShoppingBag, Sparkles, Trophy, Utensils, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { CarbonTwinAvatar } from "../components/CarbonTwinAvatar";
import { Card } from "../components/Card";
import { TreeStage } from "../components/TreeStage";
import { CustomSelect } from "../components/ui/CustomSelect";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { calculateDailyPreview, calculateQuickPreview, dailyEcoActions } from "../lib/dailyCarbon";
import { moodSuggestions, treeStageForLevel } from "../lib/gamification";
import type { DailyLog, DailyLogInput, DailySummary, QuickTravelLevel, User } from "../lib/types";

const todayKey = () => new Date().toISOString().slice(0, 10);
const moods = ["Busy", "Lazy", "Broke", "Motivated", "Travelling", "College Day", "At Home"];
const isBlank = (value: unknown) => value === "" || value == null;

const emptyDetailed = (): DailyLogInput => ({
  date: todayKey(),
  transport: { mode: "" as DailyLogInput["transport"]["mode"], distanceKm: "" as any, numberOfTrips: "" as any },
  electricity: { electricityKwhToday: "" as any, acHours: "" as any, fanHours: "" as any },
  food: { dietToday: "" as DailyLogInput["food"]["dietToday"], foodDeliveryToday: false, packagedFoodToday: false },
  shoppingWaste: { onlineOrderToday: false, clothingPurchaseToday: false, plasticUsage: "" as DailyLogInput["shoppingWaste"]["plasticUsage"], recycledToday: false },
  ecoActionIds: []
});

type QuickState = {
  travelLevel: QuickTravelLevel | "";
  energyLevel: "low" | "medium" | "high" | "";
  foodChoice: "vegan" | "vegetarian" | "mixed" | "non_vegetarian" | "";
  shoppingToday: "none" | "small" | "high" | "";
  ecoActionDone: boolean;
};

const emptyQuick = (): QuickState => ({ travelLevel: "", energyLevel: "", foodChoice: "", shoppingToday: "", ecoActionDone: false });
const travelLevelOptions = [
  { value: "no_travel", label: "No Travel / Stayed Home" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" }
];

type Reward = {
  xpEarned: number;
  leafCoinsEarned: number;
  levelAfterLog: number;
  treeStage: string;
  message: string;
};

export function EcoQuestPage() {
  const [mode, setMode] = useState<"quick" | "detailed">("quick");
  const [moodSelected, setMoodSelected] = useState("");
  const [quick, setQuick] = useState<QuickState>(emptyQuick);
  const [form, setForm] = useState<DailyLogInput>(emptyDetailed);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [reward, setReward] = useState<Reward | null>(null);
  const [firstQuestSuccess, setFirstQuestSuccess] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const firstQuestPending = !user?.onboarding?.hasCompletedFirstEcoQuest;
  const detailedPreview = useMemo(() => calculateDailyPreview(form), [form]);
  const quickPreview = useMemo(() => calculateQuickPreview(quick), [quick]);
  const preview = mode === "quick" ? quickPreview : detailedPreview;
  const level = user?.level ?? 1;

  useEffect(() => {
    api<{ log: DailyLog | null; summary: DailySummary }>("/eco-quest/today").then((data) => {
      setTodayLog(data.log);
      setSelectedLog(data.log);
      setSummary(data.summary);
      if (data.log) applyExistingLog(data.log);
    });
  }, []);

  useEffect(() => {
    setForm((current) => ({ ...current, date: selectedDate }));
    api<{ log: DailyLog | null }>(`/eco-quest/date/${selectedDate}`).then((data) => {
      setSelectedLog(data.log);
      if (selectedDate === todayKey()) setTodayLog(data.log);
      if (data.log) applyExistingLog(data.log);
      else {
        setForm((current) => ({ ...emptyDetailed(), date: selectedDate, ecoActionIds: current.ecoActionIds }));
        setQuick(emptyQuick());
      }
    });
  }, [selectedDate]);

  function patch<K extends keyof DailyLogInput>(section: K, value: Partial<DailyLogInput[K]>) {
    setForm((current) => ({ ...current, [section]: { ...(current[section] as object), ...value } as DailyLogInput[K] }));
  }

  function toggleAction(actionId: string) {
    setForm((current) => ({
      ...current,
      ecoActionIds: current.ecoActionIds.includes(actionId) ? current.ecoActionIds.filter((id) => id !== actionId) : [...current.ecoActionIds, actionId]
    }));
  }

  function applyExistingLog(log: DailyLog) {
    setForm(formFromLog(log));
    if (log.quickLog) {
      setQuick(log.quickLog);
      setMode("quick");
    } else {
      setMode("detailed");
    }
  }

  async function saveQuest() {
    setSaving(true);
    setError("");
    try {
      if (mode === "quick" && (!quick.travelLevel || !quick.energyLevel || !quick.foodChoice || !quick.shoppingToday)) {
        throw new Error("Please select travel, energy, food, and shopping choices before saving.");
      }
      const distanceAnswered = !isBlank(form.transport.distanceKm);
      const tripsAnswered = !isBlank(form.transport.numberOfTrips);
      const noDetailedTravel = distanceAnswered && tripsAnswered && (Number(form.transport.distanceKm) === 0 || Number(form.transport.numberOfTrips) === 0);
      const noShoppingWaste = !form.shoppingWaste.onlineOrderToday && !form.shoppingWaste.clothingPurchaseToday;
      if (mode === "detailed" && (!distanceAnswered || !tripsAnswered)) {
        throw new Error("Please enter travel distance and trips. No travel today is okay: enter 0.");
      }
      if (mode === "detailed" && !noDetailedTravel && !form.transport.mode) {
        throw new Error("Please select transport mode or enter 0 distance/trips for no travel.");
      }
      if (mode === "detailed" && (isBlank(form.electricity.electricityKwhToday) || isBlank(form.electricity.acHours) || isBlank(form.electricity.fanHours))) {
        throw new Error("Please answer the electricity questions. Zero is okay when something was not used.");
      }
      if (mode === "detailed" && !form.food.dietToday) {
        throw new Error("Please select diet before saving.");
      }
      if (mode === "detailed" && !noShoppingWaste && !form.shoppingWaste.plasticUsage) {
        throw new Error("Please choose plastic usage, or mark no shopping/waste activity.");
      }
      const detailedLog = {
        ...form,
        date: selectedDate,
        transport: { ...form.transport, mode: noDetailedTravel ? "walking" : form.transport.mode },
        food: { ...form.food, packagedFoodToday: Boolean(form.food.packagedFoodToday) },
        shoppingWaste: { ...form.shoppingWaste, plasticUsage: form.shoppingWaste.plasticUsage || "low", recycledToday: Boolean(form.shoppingWaste.recycledToday) }
      };
      const payload =
        mode === "quick"
          ? { trackingMode: "quick", quickLog: { ...quick, date: selectedDate }, moodSelected }
          : { trackingMode: selectedLog ? selectedLog.trackingMode === "same_as_yesterday" ? "same_as_yesterday" : "detailed" : "detailed", detailedLog, moodSelected };
      const data = await api<{ log: DailyLog; user: User; summary: DailySummary; rewards: Reward; updated: boolean }>("/eco-quest/save", { method: "POST", body: JSON.stringify(payload) });
      if (selectedDate === todayKey()) setTodayLog(data.log);
      setSelectedLog(data.log);
      setSummary(data.summary);
      setUser(data.user);
      setReward(data.rewards);
      if (!data.user.onboarding?.hasCompletedBaselineCalculator) {
        navigate("/calculator", { replace: true, state: { message: "Great! Now complete your baseline calculator so CarbonTwin can personalize your insights." } });
        return;
      }
      if (firstQuestPending && !data.updated) {
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(err.message ?? "Quest save failed");
    } finally {
      setSaving(false);
    }
  }

  async function sameAsYesterday() {
    setSaving(true);
    setError("");
    try {
      const data = await api<{ log: DailyLog; form: DailyLogInput }>("/eco-quest/yesterday");
      setSelectedDate(todayKey());
      setForm({ ...data.form, date: todayKey() });
      setSelectedLog(null);
      setMode("detailed");
    } catch (err: any) {
      setError(err.message ?? "No log found for yesterday. Try Quick Log instead.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-neon-green">No guilt. Just one better choice.</p>
            <h2 className="mt-1 text-3xl font-black">Today's Eco Quest</h2>
            <p className="mt-2 text-slate-400">Track your daily lifestyle in under 60 seconds and help your CarbonTwin grow.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Streak" value={`${summary?.currentStreak ?? user?.currentStreak ?? 0} days`} />
              <MiniStat label="Level" value={`Level ${user?.level ?? 1}`} />
              <MiniStat label="LeafCoins" value={user?.leafCoins ?? 0} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant={mode === "quick" ? "primary" : "secondary"} onClick={() => setMode("quick")}>Quick Log</Button>
            <Button variant={mode === "detailed" ? "primary" : "secondary"} onClick={() => setMode("detailed")}>Detailed Log</Button>
            <Button variant="secondary" onClick={sameAsYesterday} disabled={saving}><Copy size={17} /> Same as Yesterday</Button>
          </div>
        </div>
      </Card>

      {firstQuestPending && (
        <Card className="border-neon-green/35 bg-neon-green/10">
          <p className="label text-neon-green">Step 6 of 7: First Eco Quest</p>
          <h2 className="mt-2 text-2xl font-black">Step 6: Start Your First Eco Quest</h2>
          <p className="mt-2 text-slate-300">Now that your baseline is ready, track today’s actions and start building your daily climate habit.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <MiniStat label="Step 1" value="Choose tracking mode" />
            <MiniStat label="Step 2" value="Answer simple questions" />
            <MiniStat label="Step 3" value="Save your first log" />
          </div>
        </Card>
      )}

      {error && <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
      {selectedLog && <p className="rounded-lg border border-neon-green/30 bg-neon-green/10 px-4 py-3 text-sm text-neon-green">You already completed Eco Quest for this date. Editing will update the saved log.</p>}

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-bold"><Calendar className="text-neon-green" /> Date & mood</h3>
            <label className="mb-4 block max-w-xs">
              <span className="label">Quest date</span>
              <input className="field mt-1" type="date" max={todayKey()} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
            </label>
            <p className="mb-3 text-sm font-semibold text-slate-200">How are you today?</p>
            <div className="grid gap-2 sm:grid-cols-4">
              {moods.map((mood) => (
                <button key={mood} onClick={() => setMoodSelected(mood)} className={`rounded-lg border px-3 py-2 text-sm ${moodSelected === mood ? "border-neon-green bg-neon-green/15 text-neon-green" : "border-white/10 bg-white/[0.04]"}`}>
                  {mood}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-300">{moodSelected ? moodSuggestions[moodSelected] : "Select a mood if you want a more personal suggestion."}</p>
          </Card>

          {mode === "quick" ? (
            <Card>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><Sparkles className="text-neon-green" /> Quick Log</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <QuickQuestion title="How much did you travel today?" helper="Choose No Travel if you stayed home or did not travel today.">
                  <Select label="Travel level" value={quick.travelLevel} placeholder="Select travel level" options={travelLevelOptions} onChange={(value) => setQuick((current) => ({ ...current, travelLevel: value as QuickState["travelLevel"] }))} />
                  {quick.travelLevel === "no_travel" && <p className="mt-3 rounded-lg border border-neon-green/25 bg-neon-green/10 px-3 py-2 text-sm text-neon-green">No travel today. Your transport footprint is zero.</p>}
                </QuickQuestion>
                <QuickQuestion title="How much electricity did you use today?" helper="Estimate the overall energy level for today. No need to know exact kWh here.">
                  <Select label="Energy level" value={quick.energyLevel} placeholder="Select energy level" options={["low", "medium", "high"]} onChange={(value) => setQuick((current) => ({ ...current, energyLevel: value as QuickState["energyLevel"] }))} />
                </QuickQuestion>
                <QuickQuestion title="What best describes your food today?" helper="Choose the closest food pattern. This helps estimate meal emissions.">
                  <Select label="Food choice" value={quick.foodChoice} placeholder="Select food choice" options={["vegan", "vegetarian", "mixed", "non_vegetarian"]} onChange={(value) => setQuick((current) => ({ ...current, foodChoice: value as QuickState["foodChoice"] }))} />
                </QuickQuestion>
                <QuickQuestion title="Did you shop today?" helper="Select none if you did not shop. That is a complete valid answer.">
                  <Select label="Shopping today" value={quick.shoppingToday} placeholder="Select shopping today" options={["none", "small", "high"]} onChange={(value) => setQuick((current) => ({ ...current, shoppingToday: value as QuickState["shoppingToday"] }))} />
                </QuickQuestion>
                <QuickQuestion title="Did you complete an eco-positive action today?" helper="Optional. Leave this off if nothing extra happened today.">
                  <Toggle label="Eco action done" checked={quick.ecoActionDone} onChange={(value) => setQuick((current) => ({ ...current, ecoActionDone: value }))} />
                </QuickQuestion>
              </div>
            </Card>
          ) : (
            <DetailedQuest form={form} patch={patch} toggleAction={toggleAction} />
          )}
        </div>

        <div className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <CarbonTwinAvatar mood={todayLog?.avatarMood ?? "tired"} />
          <TreeStage stage={todayLog?.treeStage ?? treeStageForLevel(level)} level={level} />
          <Card>
            <h3 className="mb-4 flex items-center gap-2 text-xl font-black"><Trophy className="text-neon-green" /> Quest Summary</h3>
            <SummaryRow label="Net carbon impact" value={preview.netCO2} />
            <SummaryRow label="Transport CO2" value={preview.transportCO2} />
            <SummaryRow label="Electricity CO2" value={preview.electricityCO2} />
            <SummaryRow label="Food CO2" value={preview.foodCO2} />
            <SummaryRow label="Shopping/Waste CO2" value={preview.shoppingWasteCO2} />
            <SummaryRow label="Total CO2" value={preview.totalCO2} />
            <SummaryRow label="CO2 saved" value={preview.co2Saved} />
            <SummaryRow label="XP to earn" value={preview.pointsEarned} suffix="XP" />
            <SummaryRow label="LeafCoins to earn" value={preview.leafCoinsEarned} suffix="coins" />
            <SummaryRow label={`${summary?.currentStreak ?? user?.currentStreak ?? 0}-day Eco Streak`} value={Math.max(0, 5 - ((summary?.totalLoggedDays ?? 0) % 5))} suffix="quests to freeze" />
            <Button className="mt-5 w-full" onClick={saveQuest} disabled={saving}><Save size={18} /> {saving ? "Saving..." : "Save Today's Eco Quest"}</Button>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {reward && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }} className="glass max-w-md rounded-lg p-6 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-neon-green text-carbon-950"><Coins size={32} /></div>
              <h3 className="mt-4 text-3xl font-black">{firstQuestSuccess ? "Your first Eco Quest is complete!" : "Eco Quest Complete!"}</h3>
              <p className="mt-2 text-slate-300">{firstQuestSuccess ? "Your dashboard is now ready." : reward.message}</p>
              <p className="mt-4 rounded-lg bg-neon-green/10 px-4 py-3 text-neon-green">Your tree just leveled up: {reward.treeStage}</p>
              <Button className="mt-5 w-full" onClick={() => firstQuestSuccess ? navigate("/dashboard", { replace: true }) : setReward(null)}>{firstQuestSuccess ? "View Dashboard" : "Planet-friendly choice unlocked"}</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailedQuest({ form, patch, toggleAction }: { form: DailyLogInput; patch: <K extends keyof DailyLogInput>(section: K, value: Partial<DailyLogInput[K]>) => void; toggleAction: (actionId: string) => void }) {
  return (
    <div className="space-y-5">
      <Card><h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><Car className="text-neon-green" /> Transport</h3><div className="grid gap-4 md:grid-cols-3"><Select label="Mode" value={form.transport.mode} placeholder="Select transport mode" options={["walking", "bicycle", "bus", "metro", "train", "two_wheeler_petrol", "car_petrol", "car_diesel", "ev"]} onChange={(value) => patch("transport", { mode: value as DailyLogInput["transport"]["mode"] })} /><NumberField label="Distance km" value={form.transport.distanceKm} onChange={(value) => patch("transport", { distanceKm: value as any })} /><NumberField label="Trips" value={form.transport.numberOfTrips} onChange={(value) => patch("transport", { numberOfTrips: value as any })} /></div><p className="mt-3 text-xs text-slate-400">No travel today? Set distance or trips to 0 and continue.</p></Card>
      <Card><h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><Zap className="text-neon-green" /> Energy</h3><div className="grid gap-4 md:grid-cols-3"><NumberField label="kWh today" value={form.electricity.electricityKwhToday} onChange={(value) => patch("electricity", { electricityKwhToday: value as any })} /><NumberField label="AC hours" value={form.electricity.acHours} onChange={(value) => patch("electricity", { acHours: value as any })} /><NumberField label="Fan hours" value={form.electricity.fanHours} onChange={(value) => patch("electricity", { fanHours: value as any })} /></div></Card>
      <Card><h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><Utensils className="text-neon-green" /> Food</h3><div className="grid gap-4 md:grid-cols-3"><Select label="Diet" value={form.food.dietToday} placeholder="Select diet" options={["vegan", "vegetarian", "mixed", "non_vegetarian"]} onChange={(value) => patch("food", { dietToday: value as DailyLogInput["food"]["dietToday"] })} /><Toggle label="Food delivery" checked={form.food.foodDeliveryToday} onChange={(value) => patch("food", { foodDeliveryToday: value })} /><Toggle label="Packaged food" checked={form.food.packagedFoodToday} onChange={(value) => patch("food", { packagedFoodToday: value })} /></div></Card>
      <Card><h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><ShoppingBag className="text-neon-green" /> Shopping & Waste</h3><div className="grid gap-4 md:grid-cols-4"><Toggle label="Online order" checked={form.shoppingWaste.onlineOrderToday} onChange={(value) => patch("shoppingWaste", { onlineOrderToday: value })} /><Toggle label="Clothing" checked={form.shoppingWaste.clothingPurchaseToday} onChange={(value) => patch("shoppingWaste", { clothingPurchaseToday: value })} /><Select label="Plastic" value={form.shoppingWaste.plasticUsage} placeholder="Select plastic usage" options={["low", "medium", "high"]} onChange={(value) => patch("shoppingWaste", { plasticUsage: value as DailyLogInput["shoppingWaste"]["plasticUsage"] })} /><Toggle label="Recycled" checked={form.shoppingWaste.recycledToday} onChange={(value) => patch("shoppingWaste", { recycledToday: value })} /></div></Card>
      <Card><h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><Leaf className="text-neon-green" /> Eco Actions</h3><div className="grid gap-3 md:grid-cols-2">{dailyEcoActions.map((action) => <button key={action.actionId} onClick={() => toggleAction(action.actionId)} className={`rounded-lg border p-4 text-left ${form.ecoActionIds.includes(action.actionId) ? "border-neon-green/50 bg-neon-green/15" : "border-white/10 bg-white/[0.04]"}`}><span className="font-semibold">{action.title}</span><span className="mt-1 block text-xs text-slate-400">{action.co2Saved} kg saved • {action.points} XP</span></button>)}</div></Card>
    </div>
  );
}

function formFromLog(log: DailyLog): DailyLogInput {
  return {
    date: log.date,
    transport: {
      mode: ["walking", "bicycle", "bus", "metro", "train", "two_wheeler_petrol", "car_petrol", "car_diesel", "ev"].includes(log.transport.mode)
        ? log.transport.mode
        : "" as DailyLogInput["transport"]["mode"],
      distanceKm: log.transport.distanceKm,
      numberOfTrips: log.transport.numberOfTrips
    },
    electricity: log.electricity,
    food: log.food,
    shoppingWaste: log.shoppingWaste,
    ecoActionIds: log.ecoActions.map((action) => action.actionId).filter((id) => id !== "quick-eco-action")
  };
}

function NumberField({ label, value, onChange }: { label: string; value: number | string; onChange: (value: number | "") => void }) {
  return <label className="block"><span className="label">{label}</span><input className="field mt-1" type="number" min={0} placeholder="Enter 0 if none" value={value} onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))} /></label>;
}

function Select({ label, value, options, onChange, placeholder }: { label: string; value: string; options: Array<string | { label: string; value: string }>; onChange: (value: string) => void; placeholder?: string }) {
  return <CustomSelect label={label} value={value} options={options} onChange={onChange} placeholder={placeholder} />;
}

function QuickQuestion({ title, helper, children }: { title: string; helper: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <h4 className="font-bold text-white">{title}</h4>
      <p className="mt-1 text-sm text-slate-400">{helper}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex min-h-[70px] cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3"><span className="text-sm font-medium">{label}</span><input className="h-5 w-5 accent-neon-green" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>;
}

function SummaryRow({ label, value, suffix = "kg" }: { label: string; value: number; suffix?: string }) {
  return <div className="mb-3 flex items-center justify-between gap-3 text-sm"><span className="text-slate-300">{label}</span><span className="font-bold text-white">{value} {suffix}</span></div>;
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2"><p className="text-xs uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 font-bold text-white">{value}</p></div>;
}
