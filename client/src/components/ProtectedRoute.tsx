import { Navigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./Button";
import { Card } from "./Card";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="grid min-h-screen place-items-center text-neon-green">Syncing CarbonTwin...</div>;
  if (!user) return <Navigate to="/login" replace />;
  const onboarding = user.onboarding ?? {};
  const allowed = ["/onboarding", "/profile-setup", "/calculator", "/goal-setup", "/budget", "/eco-quest", "/dashboard"];
  const guardedBeforeBaseline = ["/ai-coach", "/coach", "/missions", "/leaderboard", "/shop", "/battles", "/carbon-wrapped", "/future", "/twin", "/world"];
  if (!onboarding.hasCompletedBaselineCalculator && guardedBeforeBaseline.includes(location.pathname)) {
    return (
      <div className="grid min-h-screen place-items-center bg-carbon-950 p-4">
        <Card className="max-w-xl text-center">
          <h1 className="text-3xl font-black">Complete your baseline first</h1>
          <p className="mt-3 text-slate-300">CarbonTwin needs your baseline calculator to personalize this feature.</p>
          <p className="mt-3 rounded-lg border border-amber-300/25 bg-amber-300/10 p-3 text-sm text-amber-100">Skipping may reduce personalization.</p>
          <Link to="/calculator" className="mt-5 inline-flex"><Button>Go to Calculator</Button></Link>
        </Card>
      </div>
    );
  }
  if (!allowed.includes(location.pathname)) {
    if (!onboarding.hasSeenWelcome) return <Navigate to="/onboarding" replace />;
    if (!onboarding.hasCompletedProfileSetup) return <Navigate to="/profile-setup" replace />;
    if (!onboarding.hasCompletedBaselineCalculator) return <Navigate to="/calculator" replace />;
    if (!onboarding.hasSelectedGoal) return <Navigate to="/goal-setup" replace />;
    if (!onboarding.hasSetBudget) return <Navigate to="/budget" replace />;
    if (!onboarding.hasCompletedFirstEcoQuest) return <Navigate to="/eco-quest" replace />;
  }
  return <>{children}</>;
}
