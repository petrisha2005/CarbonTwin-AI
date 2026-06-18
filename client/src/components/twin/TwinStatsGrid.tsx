import { CalendarDays, Coins, Flame, Gauge, Leaf, TrendingDown } from "lucide-react";
import { StatCard } from "../StatCard";

export function TwinStatsGrid({ stats, user }: { stats: any; user: any }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard title="Today Net CO2" value={`${stats.todayNetCO2} kg`} note="From today's Eco Quest" icon={Gauge} />
      <StatCard title="Weekly CO2 Saved" value={`${stats.weeklyCO2Saved} kg`} note={`${stats.weeklyNetCO2} kg net this week`} icon={Leaf} />
      <StatCard title="Monthly CO2 Saved" value={`${stats.monthlyCO2Saved} kg`} note={`${stats.monthlyNetCO2} kg net this month`} icon={TrendingDown} />
      <StatCard title="Logged Days" value={user.totalLoggedDays} note="Total Eco Quest days" icon={CalendarDays} />
      <StatCard title="Current Streak" value={`${user.currentStreak} days`} note={`Best: ${user.longestStreak} days`} icon={Flame} />
      <StatCard title="Total LeafCoins" value={user.leafCoins} note={`${user.ecoPoints} eco points`} icon={Coins} />
    </div>
  );
}
