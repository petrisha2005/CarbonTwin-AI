import { Bot, Coins, Gauge, HeartHandshake, Sparkles } from "lucide-react";
import { Button } from "../Button";
import { Card } from "../Card";
import { OptionCard } from "../ui/OptionCard";
import { CustomSelect } from "../ui/CustomSelect";
import type { CoachPreferences } from "../../services/coachService";

type Props = {
  preferences: CoachPreferences;
  onChange: (preferences: CoachPreferences) => void;
  onSubmit: () => void;
  loading: boolean;
};

const moods = [
  { value: "busy", label: "Busy" },
  { value: "tired", label: "Tired" },
  { value: "lazy", label: "Lazy" },
  { value: "broke", label: "Broke" },
  { value: "motivated", label: "Motivated" },
  { value: "travelling", label: "Travelling" },
  { value: "college_day", label: "College Day" },
  { value: "at_home", label: "At Home" }
];

const goals = [
  ["commute", "Reduce commute emissions", "Get suggestions for smarter travel and low-carbon commuting."],
  ["electricity", "Save electricity", "Find easy ways to reduce AC, fan, and appliance usage."],
  ["delivery", "Reduce food delivery impact", "Cut packaging and delivery footprint without changing everything."],
  ["meals", "Eat lower-carbon meals", "Try simple food swaps that fit your lifestyle."],
  ["plastic", "Reduce plastic use", "Use reusable items and avoid packaged waste."],
  ["shopping", "Avoid unnecessary shopping", "Control shopping-related carbon impact."],
  ["budget", "Stay under monthly budget", "Get a plan to stay within your carbon budget."],
  ["habit", "Build tracking habit", "Make Eco Quest a daily habit."],
  ["campus", "Prepare for campus leaderboard", "Improve your rank with smart actions."],
  ["custom", "Custom goal", "Write your own goal."]
];

export function CoachPreferenceForm({ preferences, onChange, onSubmit, loading }: Props) {
  const selectedGoal = preferences.goalKey ?? "";
  const custom = selectedGoal === "custom";

  function selectGoal(key: string, title: string) {
    onChange({ ...preferences, goalKey: key, goal: key === "custom" ? "" : title });
  }

  return (
    <Card>
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-neon-green/15 text-neon-green">
          <HeartHandshake size={22} />
        </span>
        <div>
          <h3 className="font-bold">Coach Preferences</h3>
          <p className="text-sm text-slate-400">Tune the plan to your day. Nothing is pre-selected.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <CustomSelect
          label="Mood"
          value={preferences.mood ?? ""}
          placeholder="How are you feeling today?"
          options={moods}
          onChange={(mood) => onChange({ ...preferences, mood: mood as CoachPreferences["mood"] })}
        />
        <CustomSelect
          label="Difficulty"
          value={preferences.difficultyPreference ?? ""}
          placeholder="Choose plan difficulty"
          options={[
            { value: "easy", label: "Easy" },
            { value: "medium", label: "Medium" },
            { value: "challenge", label: "Challenge" }
          ]}
          onChange={(difficultyPreference) => onChange({ ...preferences, difficultyPreference: difficultyPreference as CoachPreferences["difficultyPreference"] })}
        />
        <CustomSelect
          label="Budget"
          value={preferences.budgetPreference ?? ""}
          placeholder="Choose budget preference"
          options={[
            { value: "free_only", label: "Free only" },
            { value: "low_cost", label: "Low cost" },
            { value: "any", label: "Any budget" }
          ]}
          onChange={(budgetPreference) => onChange({ ...preferences, budgetPreference: budgetPreference as CoachPreferences["budgetPreference"] })}
        />
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-black">What do you want help with today?</h3>
        <p className="mt-1 text-sm text-slate-400">Choose a goal or write your own.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {goals.map(([key, title, description]) => (
            <OptionCard key={key} selected={selectedGoal === key} title={title} description={description} onClick={() => selectGoal(key, title)} />
          ))}
        </div>
      </div>

      {custom && (
        <label className="mt-4 block">
          <span className="label">Custom goal</span>
          <input
            className="field mt-1"
            value={preferences.goal ?? ""}
            onChange={(event) => onChange({ ...preferences, goal: event.target.value })}
            placeholder="Example: reduce commute emissions this week"
          />
        </label>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={onSubmit} disabled={loading || !preferences.mood || !preferences.difficultyPreference || !preferences.budgetPreference || !preferences.goal?.trim()}>
          {loading ? <Bot size={18} className="animate-pulse" /> : <Sparkles size={18} />}
          {loading ? "Generating..." : "Generate AI Plan"}
        </Button>
        <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-slate-300">
          <Gauge size={16} className="text-neon-cyan" />
          Real Eco Quest data
        </span>
        <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-slate-300">
          <Coins size={16} className="text-neon-green" />
          Cost-aware
        </span>
      </div>
    </Card>
  );
}
