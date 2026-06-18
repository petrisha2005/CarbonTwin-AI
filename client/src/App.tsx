import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SmartRoot } from "./components/SmartRoot";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";

const BudgetPage = lazy(() => import("./pages/BudgetPage").then((module) => ({ default: module.BudgetPage })));
const BattlesPage = lazy(() => import("./pages/BattlesPage").then((module) => ({ default: module.BattlesPage })));
const BattleDetailPage = lazy(() => import("./pages/BattleDetailPage").then((module) => ({ default: module.BattleDetailPage })));
const CalculatorPage = lazy(() => import("./pages/CalculatorPage").then((module) => ({ default: module.CalculatorPage })));
const CoachPage = lazy(() => import("./pages/CoachPage").then((module) => ({ default: module.CoachPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const DailyTrackerPage = lazy(() => import("./pages/DailyTrackerPage").then((module) => ({ default: module.DailyTrackerPage })));
const EcoQuestPage = lazy(() => import("./pages/EcoQuestPage").then((module) => ({ default: module.EcoQuestPage })));
const CarbonWrappedPage = lazy(() => import("./pages/CarbonWrappedPage").then((module) => ({ default: module.CarbonWrappedPage })));
const FuturePage = lazy(() => import("./pages/FuturePage").then((module) => ({ default: module.FuturePage })));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage").then((module) => ({ default: module.LeaderboardPage })));
const MissionsPage = lazy(() => import("./pages/MissionsPage").then((module) => ({ default: module.MissionsPage })));
const GoalSetupPage = lazy(() => import("./pages/GoalSetupPage").then((module) => ({ default: module.GoalSetupPage })));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage").then((module) => ({ default: module.OnboardingPage })));
const ProfileSetupPage = lazy(() => import("./pages/ProfileSetupPage").then((module) => ({ default: module.ProfileSetupPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((module) => ({ default: module.ProfilePage })));
const ShopPage = lazy(() => import("./pages/ShopPage").then((module) => ({ default: module.ShopPage })));
const TwinPage = lazy(() => import("./pages/TwinPage").then((module) => ({ default: module.TwinPage })));
const WorldPage = lazy(() => import("./pages/WorldPage").then((module) => ({ default: module.WorldPage })));

function RouteLoading() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col gap-4 px-4 py-8">
      <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </main>
  );
}

function ProtectedPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteLoading />}>{children}</Suspense>;
}

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
        <Route path="/dashboard" element={<ProtectedPage><DashboardPage /></ProtectedPage>} />
        <Route path="/onboarding" element={<ProtectedPage><OnboardingPage /></ProtectedPage>} />
        <Route path="/profile-setup" element={<ProtectedPage><ProfileSetupPage /></ProtectedPage>} />
        <Route path="/goal-setup" element={<ProtectedPage><GoalSetupPage /></ProtectedPage>} />
        <Route path="/eco-quest" element={<ProtectedPage><EcoQuestPage /></ProtectedPage>} />
        <Route path="/carbon-wrapped" element={<ProtectedPage><CarbonWrappedPage /></ProtectedPage>} />
        <Route path="/daily-tracker" element={<ProtectedPage><DailyTrackerPage /></ProtectedPage>} />
        <Route path="/calculator" element={<ProtectedPage><CalculatorPage /></ProtectedPage>} />
        <Route path="/twin" element={<ProtectedPage><TwinPage /></ProtectedPage>} />
        <Route path="/world" element={<ProtectedPage><WorldPage /></ProtectedPage>} />
        <Route path="/shop" element={<ProtectedPage><ShopPage /></ProtectedPage>} />
        <Route path="/battles" element={<ProtectedPage><BattlesPage /></ProtectedPage>} />
        <Route path="/battles/:battleId" element={<ProtectedPage><BattleDetailPage /></ProtectedPage>} />
        <Route path="/future" element={<ProtectedPage><FuturePage /></ProtectedPage>} />
        <Route path="/budget" element={<ProtectedPage><BudgetPage /></ProtectedPage>} />
        <Route path="/ai-coach" element={<ProtectedPage><CoachPage /></ProtectedPage>} />
        <Route path="/coach" element={<ProtectedPage><CoachPage /></ProtectedPage>} />
        <Route path="/missions" element={<ProtectedPage><MissionsPage /></ProtectedPage>} />
        <Route path="/leaderboard" element={<ProtectedPage><LeaderboardPage /></ProtectedPage>} />
        <Route path="/profile" element={<ProtectedPage><ProfilePage /></ProtectedPage>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
