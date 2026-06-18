import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SmartRoot } from "./components/SmartRoot";
import { BudgetPage } from "./pages/BudgetPage";
import { BattlesPage } from "./pages/BattlesPage";
import { BattleDetailPage } from "./pages/BattleDetailPage";
import { CalculatorPage } from "./pages/CalculatorPage";
import { CoachPage } from "./pages/CoachPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DailyTrackerPage } from "./pages/DailyTrackerPage";
import { EcoQuestPage } from "./pages/EcoQuestPage";
import { CarbonWrappedPage } from "./pages/CarbonWrappedPage";
import { FuturePage } from "./pages/FuturePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { LoginPage } from "./pages/LoginPage";
import { MissionsPage } from "./pages/MissionsPage";
import { GoalSetupPage } from "./pages/GoalSetupPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { ProfileSetupPage } from "./pages/ProfileSetupPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ShopPage } from "./pages/ShopPage";
import { SignupPage } from "./pages/SignupPage";
import { TwinPage } from "./pages/TwinPage";
import { WorldPage } from "./pages/WorldPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SmartRoot />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/profile-setup" element={<ProfileSetupPage />} />
        <Route path="/goal-setup" element={<GoalSetupPage />} />
        <Route path="/eco-quest" element={<EcoQuestPage />} />
        <Route path="/carbon-wrapped" element={<CarbonWrappedPage />} />
        <Route path="/daily-tracker" element={<DailyTrackerPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/twin" element={<TwinPage />} />
        <Route path="/world" element={<WorldPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/battles" element={<BattlesPage />} />
        <Route path="/battles/:battleId" element={<BattleDetailPage />} />
        <Route path="/future" element={<FuturePage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/ai-coach" element={<CoachPage />} />
        <Route path="/coach" element={<CoachPage />} />
        <Route path="/missions" element={<MissionsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
