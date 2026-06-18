import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Save } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CarbonTargetCard } from "../components/coach/CarbonTargetCard";
import { CoachMessageCard } from "../components/coach/CoachMessageCard";
import { CoachPreferenceForm } from "../components/coach/CoachPreferenceForm";
import { HabitSwapCard } from "../components/coach/HabitSwapCard";
import { QuickActionCard } from "../components/coach/QuickActionCard";
import { WeeklyPlanCard } from "../components/coach/WeeklyPlanCard";
import {
  getCoachRecommendations,
  getLatestCoachPlan,
  saveCoachPlan,
  type CoachPreferences,
  type CoachRecommendation,
  type SavedCoachPlan
} from "../services/coachService";

const loadingMessages = [
  "Reading your recent Eco Quests...",
  "Finding the highest-impact category...",
  "Checking your CarbonTwin mood...",
  "Building a practical weekly plan..."
];

export function CoachPage() {
  const [preferences, setPreferences] = useState<CoachPreferences>({});
  const [recommendation, setRecommendation] = useState<CoachRecommendation | null>(null);
  const [latestPlan, setLatestPlan] = useState<SavedCoachPlan | null>(null);
  const [needsData, setNeedsData] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const loadingMessage = useMemo(() => loadingMessages[Math.floor(Date.now() / 1400) % loadingMessages.length], [loading]);

  useEffect(() => {
    getLatestCoachPlan()
      .then((data) => {
        setLatestPlan(data.plan);
        if (data.plan?.recommendations) setRecommendation(data.plan.recommendations);
      })
      .catch(() => undefined);
  }, []);

  async function generate() {
    const goal = preferences.goal?.trim() ?? "";
    if (!preferences.mood || !preferences.difficultyPreference || !preferences.budgetPreference || !goal) {
      setError("Please choose your mood, difficulty, budget, and goal first.");
      return;
    }
    setLoading(true);
    setError("");
    setNeedsData(false);
    setMessage("");
    try {
      const data = await getCoachRecommendations(preferences);
      if ("needsData" in data) {
        setNeedsData(true);
        setMessage(data.detail);
        setRecommendation(null);
      } else {
        setRecommendation(data.recommendations);
        setLatestPlan(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not generate coach recommendations");
    } finally {
      setLoading(false);
    }
  }

  async function savePlan() {
    if (!recommendation) return;
    setSaving(true);
    setError("");
    try {
      const data = await saveCoachPlan(preferences, recommendation);
      setLatestPlan(data.plan);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save coach plan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-neon-green">AI Coach</p>
        <h1 className="mt-1 text-3xl font-black text-white">AI Eco Coach</h1>
        <p className="mt-2 max-w-3xl text-slate-400">Personalized climate-friendly suggestions based on your real lifestyle data.</p>
      </div>

      <CoachPreferenceForm preferences={preferences} onChange={setPreferences} onSubmit={generate} loading={loading} />

      {loading && (
        <Card>
          <div className="flex items-center gap-3 text-slate-200">
            <span className="h-3 w-3 animate-pulse rounded-full bg-neon-green shadow-glow" />
            {loadingMessage}
          </div>
        </Card>
      )}

      {error && (
        <Card className="border-red-300/30 bg-red-950/25">
          <p className="flex items-center gap-2 text-sm text-red-100">
            <AlertCircle size={18} />
            {error}
          </p>
        </Card>
      )}

      {needsData && (
        <Card>
          <h2 className="text-xl font-black">Your AI Coach needs a little data first</h2>
          <p className="mt-2 text-slate-300">{message}</p>
          <Link
            to="/eco-quest"
            className="focus-ring mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-neon-green px-4 py-2.5 text-sm font-semibold text-carbon-950 shadow-glow transition hover:bg-green-300"
          >
            Start Eco Quest
          </Link>
        </Card>
      )}

      {recommendation && (
        <>
          <CoachMessageCard recommendation={recommendation} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-400">
              {latestPlan ? `Loaded saved plan from ${new Date(latestPlan.generatedAt).toLocaleString()}` : "Generated plan is ready to save."}
            </p>
            <Button onClick={savePlan} disabled={saving}>
              <Save size={18} />
              {saving ? "Saving..." : "Save Plan"}
            </Button>
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <WeeklyPlanCard plan={recommendation.weeklyPlan} />
            <div className="space-y-6">
              <CarbonTargetCard recommendation={recommendation} />
              <HabitSwapCard swap={recommendation.habitSwap} />
            </div>
          </div>
          <QuickActionCard actions={recommendation.quickActions} />
        </>
      )}
    </div>
  );
}
