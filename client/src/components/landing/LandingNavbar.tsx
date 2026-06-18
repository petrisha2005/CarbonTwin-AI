import { Menu, X, Leaf } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../Button";
import { navItems } from "./landingData";

export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const startRoute = user ? "/" : "/signup";
  const accountRoute = user ? "/dashboard" : "/login";
  const accountLabel = user ? "Dashboard" : "Login";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-carbon-950/55 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-neon-green text-carbon-950 shadow-glow">
            <Leaf size={22} />
          </span>
          <span>
            <span className="block text-sm font-black tracking-wide text-white">CarbonTwin AI</span>
            <span className="hidden text-xs text-slate-400 sm:block">Personal Climate Intelligence</span>
          </span>
        </a>

        <div className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium text-slate-300 transition hover:text-white">
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to={accountRoute} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white">
            {accountLabel}
          </Link>
          <Link to={startRoute}>
            <Button>Get Started</Button>
          </Link>
        </div>

        <button className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-carbon-950/95 px-4 py-4 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10">
                {item.label}
              </a>
            ))}
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <Link to={accountRoute} className="rounded-lg border border-white/10 px-4 py-3 text-center text-sm font-semibold text-slate-200">
                {accountLabel}
              </Link>
              <Link to={startRoute}>
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
