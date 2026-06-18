import { BarChart3, Bot, CalendarDays, Calculator, Gift, Globe2, Leaf, LogOut, Medal, ShoppingBag, Swords, Target, Trees, UserRound, Zap } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/eco-quest", label: "Eco Quest", icon: CalendarDays },
  { to: "/carbon-wrapped", label: "Carbon Wrapped", icon: Gift },
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/twin", label: "Twin", icon: Bot },
  { to: "/world", label: "World", icon: Trees },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
  { to: "/battles", label: "Battles", icon: Swords },
  { to: "/future", label: "Future", icon: Zap },
  { to: "/budget", label: "Budget", icon: Target },
  { to: "/ai-coach", label: "AI Coach", icon: Leaf },
  { to: "/missions", label: "Missions", icon: Medal },
  { to: "/leaderboard", label: "Leaderboard", icon: Globe2 },
  { to: "/profile", label: "Profile", icon: UserRound }
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 overflow-y-auto border-r border-white/10 bg-carbon-950/85 px-4 py-5 backdrop-blur-xl lg:block">
        <button onClick={() => navigate("/dashboard")} className="mb-8 flex items-center gap-3 text-left">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-neon-green text-carbon-950 shadow-glow">
            <Leaf size={22} />
          </span>
          <span>
            <span className="block font-bold">CarbonTwin AI</span>
            <span className="text-xs text-slate-400">Climate intelligence</span>
          </span>
        </button>
        <nav className="space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive ? "bg-neon-green/15 text-neon-green" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-carbon-950/70 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Your Personal Climate Intelligence Twin</p>
              <h1 className="truncate text-lg font-bold text-white">Welcome, {user?.name ?? "Explorer"}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-lg border border-neon-green/30 bg-neon-green/10 px-3 py-2 text-sm text-neon-green sm:inline-flex">
                {user?.ecoPoints ?? 0} pts
              </span>
              <Button variant="ghost" onClick={logout} title="Log out" aria-label="Log out">
                <LogOut size={18} />
              </Button>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                    isActive ? "bg-neon-green text-carbon-950" : "bg-white/10 text-slate-200"
                  }`
                }
              >
                <item.icon size={15} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
