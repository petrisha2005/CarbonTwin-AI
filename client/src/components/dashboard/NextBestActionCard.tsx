import { Link } from "react-router-dom";
import { Button } from "../Button";
import { Card } from "../Card";

export function NextBestActionCard({ user, hasLogs, todayCompleted }: { user: any; hasLogs: boolean; todayCompleted: boolean }) {
  const onboarding = user?.onboarding ?? {};
  let title = "View your weekly progress";
  let message = "Your CarbonTwin is up to date. Check your trends and keep the streak going.";
  let to = "/dashboard";
  let button = "View Progress";

  if (!onboarding.hasCompletedBaselineCalculator) {
    title = "Complete your baseline calculator";
    message = "CarbonTwin needs your baseline footprint before it can personalize daily insights.";
    to = "/calculator";
    button = "Start Calculator";
  } else if (!hasLogs || !onboarding.hasCompletedFirstEcoQuest) {
    title = "Complete your first Eco Quest";
    message = "Your baseline is ready. Now track today’s actions to start your daily climate habit.";
    to = "/eco-quest";
    button = "Start First Eco Quest";
  } else if (!todayCompleted) {
    title = "Today’s Eco Quest is pending";
    message = "Log today’s choices to keep your streak alive and update your dashboard.";
    to = "/eco-quest";
    button = "Complete Today’s Eco Quest";
  } else if (!onboarding.hasSelectedGoal && !user?.climateGoal) {
    title = "Choose your climate goal";
    message = "Pick one focus area so your recommendations feel more personal.";
    to = "/goal-setup";
    button = "Choose Goal";
  } else if (!user?.city) {
    title = "Complete your profile";
    message = "Add your city to personalize local insights and leaderboard context.";
    to = "/profile-setup";
    button = "Complete Profile";
  } else {
    title = "Start your first mission";
    message = "Turn your tracking into a small action and earn rewards.";
    to = "/missions";
    button = "Explore Missions";
  }

  return (
    <Card className="border-neon-green/30 bg-neon-green/10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="label text-neon-green">Next best action</p>
          <h2 className="mt-1 text-2xl font-black">{title}</h2>
          <p className="mt-2 text-slate-300">{message}</p>
        </div>
        <Link to={to} className="shrink-0"><Button>{button}</Button></Link>
      </div>
    </Card>
  );
}
