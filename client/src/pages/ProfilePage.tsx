import { useEffect, useState } from "react";
import { Award, Bike, CalendarCheck, Coins, Flame, GraduationCap, Mail, MapPin, PlugZap, Save, ShoppingBag, Star, Target, Trophy, Utensils } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CarbonTwinAvatar } from "../components/avatar/CarbonTwinAvatar";
import { BadgesGrid } from "../components/badges/BadgesGrid";
import { OptionCard } from "../components/ui/OptionCard";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { useSummary } from "../lib/useSummary";
import { getBadges, type Badge } from "../services/badgeService";
import { getEquippedItems } from "../services/shopService";
import type { EquippedItems, User } from "../lib/types";

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const { summary } = useSummary();
  const [form, setForm] = useState({
    displayName: "",
    city: "",
    collegeName: "",
    department: "",
    batch: "",
    climateGoal: ""
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({});

  useEffect(() => {
    if (!user) return;
    setForm({
      displayName: user.displayName || user.name || "",
      city: user.city || "",
      collegeName: user.collegeName || "",
      department: user.department || "",
      batch: user.batch || "",
      climateGoal: user.climateGoal || ""
    });
  }, [user]);

  useEffect(() => {
    getBadges().then((data) => setBadges(data.badges)).catch(() => undefined);
    getEquippedItems().then((data) => setEquippedItems(data.equippedItems ?? {})).catch(() => undefined);
  }, []);

  async function saveProfile() {
    setSaving(true);
    setSaved(false);
    try {
      const data = await api<{ user: User }>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(form)
      });
      setUser(data.user);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="w-full max-w-xs">
            <CarbonTwinAvatar mood="happy" level={user?.level ?? 1} equippedItems={equippedItems} size="sm" message="Profile style" />
          </div>
          <div>
            <h2 className="text-3xl font-black">{user?.displayName || user?.name}</h2>
            <p className="mt-2 flex items-center gap-2 text-slate-300"><Mail size={16} /> {user?.email}</p>
            <p className="mt-1 flex items-center gap-2 text-slate-300"><MapPin size={16} /> {user?.city || "City not set"}</p>
          </div>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Carbon personality" value={summary?.personality.type ?? "Eco Explorer"} />
        <Metric label="XP Level" value={`Level ${user?.level ?? 1}`} icon={Star} />
        <Metric label="LeafCoins" value={user?.leafCoins ?? 0} icon={Coins} />
        <Metric label="Eco Streak" value={`${user?.currentStreak ?? 0} days`} icon={Flame} />
      </div>
      <Card>
        <h3 className="flex items-center gap-2 text-xl font-bold"><Target className="text-neon-green" /> Choose your climate goal</h3>
        <p className="mt-1 text-sm text-slate-400">Not sure what to focus on? Pick one goal and CarbonTwin will guide you.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {profileGoals.map((goal) => (
            <OptionCard
              key={goal.id}
              selected={form.climateGoal === goal.id}
              icon={<goal.icon className="text-neon-green" size={24} />}
              title={goal.title}
              description={`${goal.description} Difficulty: ${goal.difficulty}. Impact: ${goal.impact}.`}
              impact={goal.recommended ? "Recommended for you" : goal.badge}
              onClick={() => setForm({ ...form, climateGoal: goal.id })}
            />
          ))}
        </div>
      </Card>
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold"><GraduationCap className="text-neon-green" /> Campus League Profile</h3>
            <p className="mt-1 text-sm text-slate-400">Add these details to unlock city, college, and department leaderboards.</p>
          </div>
          {saved && <span className="rounded-lg bg-neon-green/10 px-3 py-2 text-sm text-neon-green">Profile updated</span>}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Display name" value={form.displayName} onChange={(displayName) => setForm({ ...form, displayName })} />
          <Field label="City" value={form.city} onChange={(city) => setForm({ ...form, city })} />
          <Field label="College name" value={form.collegeName} onChange={(collegeName) => setForm({ ...form, collegeName })} />
          <Field label="Department" value={form.department} onChange={(department) => setForm({ ...form, department })} />
          <Field label="Batch / Year" value={form.batch} onChange={(batch) => setForm({ ...form, batch })} />
        </div>
        <Button onClick={saveProfile} disabled={saving} className="mt-5">
          <Save size={18} />
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </Card>
      <Card>
        <h3 className="flex items-center gap-2 text-xl font-bold"><Award className="text-neon-green" /> Badges and Rewards</h3>
        <p className="mt-1 text-sm text-slate-400">Badges unlock from real missions, streaks, profile completion, and carbon savings.</p>
        <div className="mt-5">
          <BadgesGrid badges={badges} />
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="field mt-1" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string | number; icon?: typeof Star }) {
  return <Card><p className="label">{label}</p><p className="mt-2 flex items-center gap-2 text-xl font-black">{Icon && <Icon className="text-neon-green" size={20} />}{value}</p></Card>;
}

const profileGoals = [
  { id: "tracking_habit", title: "Build Daily Tracking Habit", description: "Complete Eco Quest 5 days per week.", difficulty: "Easy", impact: "High habit impact", badge: "Starter", icon: CalendarCheck, recommended: true },
  { id: "reduce_10", title: "Reduce Monthly Footprint by 10%", description: "Beginner-friendly carbon reduction target.", difficulty: "Easy", impact: "Medium", badge: "Recommended", icon: Target },
  { id: "reduce_20", title: "Reduce Monthly Footprint by 20%", description: "Stronger improvement challenge.", difficulty: "Challenge", impact: "High", badge: "Challenge", icon: Trophy },
  { id: "under_budget", title: "Stay Under Monthly Carbon Budget", description: "Set and track a monthly kg CO2 limit.", difficulty: "Medium", impact: "High", badge: "Budget", icon: Coins },
  { id: "electricity", title: "Save Electricity", description: "Reduce AC, fan, and appliance usage.", difficulty: "Easy", impact: "Medium", badge: "Energy", icon: PlugZap },
  { id: "travel", title: "Travel Smarter", description: "Reduce commute and transport emissions.", difficulty: "Medium", impact: "High", badge: "Transport", icon: Bike },
  { id: "food_delivery", title: "Reduce Food Delivery", description: "Cut packaging and delivery impact.", difficulty: "Easy", impact: "Medium", badge: "Food", icon: Utensils },
  { id: "plastic", title: "Less Plastic Lifestyle", description: "Reduce bottled drinks and single-use plastic.", difficulty: "Easy", impact: "Medium", badge: "Waste", icon: ShoppingBag },
  { id: "shopping", title: "No Unnecessary Shopping", description: "Reduce online orders and fast fashion impact.", difficulty: "Medium", impact: "Medium", badge: "Shopping", icon: ShoppingBag },
  { id: "campus", title: "Campus Carbon League", description: "Improve your department/community ranking.", difficulty: "Challenge", impact: "Community", badge: "Campus", icon: GraduationCap },
  { id: "custom", title: "Custom Goal", description: "Create your own goal.", difficulty: "Custom", impact: "Personal", badge: "Custom", icon: Star }
];
