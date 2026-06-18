import { motion } from "framer-motion";
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bot, CalendarDays, Car, Coins, Flame, Gauge, Leaf, Medal, Smartphone, Sparkles, Target, TreePine, Trophy, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { CarbonTwinAvatar } from "../components/CarbonTwinAvatar";
import { Card } from "../components/Card";
import { StatCard } from "../components/StatCard";
import { NextBestActionCard } from "../components/dashboard/NextBestActionCard";
import { useAuth } from "../context/AuthContext";
import type { EquippedItems } from "../lib/types";
import { getDashboardSummary, type DashboardSummary } from "../services/dashboardService";
import { getEquippedItems } from "../services/shopService";

const tooltipStyle = {
  backgroundColor: "#111c18",
  border: "1px solid rgba(34,197,94,0.35)",
  borderRadius: 8,
  color: "#f8fafc"
};

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, setUser } = useAuth();

  useEffect(() => {
    getDashboardSummary()
      .then((data) => {
        setSummary(data);
        setUser(data.user);
      })
      .catch((err: any) => setError(err.message ?? "Could not load dashboard"))
      .finally(() => setLoading(false));
    getEquippedItems().then((data) => setEquippedItems(data.equippedItems ?? {})).catch(() => undefined);
  }, [setUser]);

  if (loading) return <p className="text-slate-300">Loading climate dashboard...</p>;

  if (error) {
    return (
      <Card>
        <h2 className="text-2xl font-black text-red-200">Dashboard could not load</h2>
        <p className="mt-2 text-slate-400">{error}</p>
      </Card>
    );
  }

  if (!summary?.hasBaseline) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Card className="max-w-2xl text-center">
          <Bot className="mx-auto text-neon-green" size={54} />
          <h2 className="mt-4 text-3xl font-black">Complete your baseline calculator first</h2>
          <p className="mt-3 text-slate-400">Your dashboard needs a baseline footprint to create personalized insights.</p>
          <Link to="/calculator" className="mt-6 inline-flex">
            <Button><Leaf size={18} /> Start Calculator</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!summary?.hasLogs) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Card className="max-w-2xl text-center">
          <Bot className="mx-auto text-neon-green" size={54} />
          <h2 className="mt-4 text-3xl font-black">Start your first Eco Quest</h2>
          <p className="mt-3 text-slate-400">Your baseline is ready. Complete today’s Eco Quest to begin tracking daily progress.</p>
          <Link to="/eco-quest" className="mt-6 inline-flex">
            <Button><Leaf size={18} /> Start Eco Quest</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-neon-green">Welcome back, {summary.user?.name ?? user?.name ?? "Explorer"}</p>
              <h1 className="mt-1 text-3xl font-black">Your CarbonTwin climate dashboard</h1>
              <p className="mt-2 text-slate-400">Your baseline and daily logs power these insights.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Badge icon={Trophy} label="Level" value={summary.rewards.level} />
              <Badge icon={Coins} label="LeafCoins" value={summary.rewards.leafCoins} />
              <Badge icon={Flame} label="Streak" value={`${summary.rewards.currentStreak}d`} />
            </div>
          </div>
        </Card>
      </motion.div>

      <NextBestActionCard user={summary.user ?? user} hasLogs={summary.hasLogs} todayCompleted={summary.today.completed} />

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <CarbonTwinAvatar mood={summary.today.avatarMood} message={summary.today.moodMessage} equippedItems={equippedItems} />
        <Card>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="label">Today's CarbonTwin Status</p>
              <h2 className="mt-2 text-2xl font-black">{summary.today.completed ? "Eco Quest complete" : "Your CarbonTwin is waiting"}</h2>
              <p className="mt-2 text-slate-400">Today net: {summary.today.netCO2} kg CO2 • Saved: {summary.today.co2Saved} kg</p>
            </div>
            <Link to="/eco-quest">
              <Button>{summary.today.completed ? "Edit Today's Eco Quest" : "Complete Today's Eco Quest"}</Button>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Today's CO2" value={`${summary.today.netCO2} kg`} note={summary.today.completed ? "Logged today" : "No log yet"} icon={Gauge} />
        <StatCard title="Weekly CO2" value={`${summary.week.netCO2} kg`} note={`${summary.week.logsCount} logged day(s)`} icon={CalendarDays} />
        <StatCard title="Monthly CO2" value={`${summary.month.netCO2} kg`} note={`${summary.month.averageDailyCO2} kg daily average`} icon={Target} />
        <StatCard title="Total CO2 Saved" value={`${summary.lifetime.totalCO2Saved} kg`} note={`${summary.lifetime.totalLoggedDays} total logged days`} icon={Sparkles} />
        <StatCard title="Current Streak" value={`${summary.rewards.currentStreak} days`} note={`Best: ${summary.rewards.longestStreak} days`} icon={Flame} />
        <StatCard title="LeafCoins" value={`${summary.rewards.leafCoins}`} note={`${summary.rewards.xp} XP • Level ${summary.rewards.level}`} icon={Coins} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Weekly Carbon Trend">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={summary.week.weeklyTrend}>
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="netCO2" name="Net CO2" fill="#22C55E" radius={[6, 6, 0, 0]} />
              <Bar dataKey="co2Saved" name="CO2 Saved" fill="#06B6D4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Category Breakdown">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={summary.categoryBreakdown} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={4}>
                {summary.categoryBreakdown.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Trend">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={summary.month.monthlyTrend}>
              <XAxis dataKey="date" stroke="#94a3b8" minTickGap={22} />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="netCO2" stroke="#06B6D4" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="CO2 Saved Progress">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={summary.month.monthlyTrend.filter((item) => item.completed)}>
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="co2Saved" fill="#06B6D4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <h3 className="text-xl font-black">Your impact in real life</h3>
          <div className="mt-5 grid gap-3">
            <Equivalent icon={Smartphone} label="Phone charges avoided" value={summary.carbonEquivalents.phoneCharges} />
            <Equivalent icon={Car} label="Petrol km equivalent" value={summary.carbonEquivalents.petrolKm} />
            <Equivalent icon={TreePine} label="Tree days equivalent" value={summary.carbonEquivalents.treeDays} />
          </div>
        </Card>
        <Card>
          <h3 className="text-xl font-black">Personalized insights</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {summary.insights.map((item) => (
              <div key={`${item.type}-${item.title}`} className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                <span className={`rounded-md px-2 py-1 text-xs font-bold uppercase ${item.severity === "positive" ? "bg-neon-green/15 text-neon-green" : item.severity === "warning" ? "bg-amber-400/15 text-amber-200" : "bg-neon-cyan/15 text-neon-cyan"}`}>{item.severity}</span>
                <h4 className="mt-3 font-bold">{item.title}</h4>
                <p className="mt-2 text-sm text-slate-400">{item.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-black">Quick actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/eco-quest"><Button><Leaf size={18} /> Complete Eco Quest</Button></Link>
          <Link to="/carbon-wrapped"><Button variant="secondary"><Medal size={18} /> View Carbon Wrapped</Button></Link>
          <Link to="/ai-coach"><Button variant="secondary"><Zap size={18} /> Open AI Coach</Button></Link>
          <Link to="/leaderboard"><Button variant="secondary"><Trophy size={18} /> View Leaderboard</Button></Link>
        </div>
      </Card>
    </div>
  );
}

function Badge({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string | number }) {
  return <div className="rounded-lg border border-neon-green/25 bg-neon-green/10 px-4 py-3"><p className="flex items-center gap-2 text-xs uppercase tracking-wide text-neon-green"><Icon size={14} /> {label}</p><p className="mt-1 text-lg font-black">{value}</p></div>;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card className="min-h-[340px]"><h3 className="mb-4 font-bold">{title}</h3>{children}</Card>;
}

function Equivalent({ icon: Icon, label, value }: { icon: typeof Smartphone; label: string; value: string | number }) {
  return <div className="flex items-center justify-between rounded-lg bg-white/[0.05] p-4"><span className="flex items-center gap-3 text-sm text-slate-300"><Icon className="text-neon-green" size={20} /> {label}</span><span className="font-black text-white">{value}</span></div>;
}
