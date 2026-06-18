import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { navItems } from "./landingData";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-carbon-950/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-neon-green text-carbon-950">
              <Leaf size={22} />
            </span>
            <span className="font-black text-white">CarbonTwin AI</span>
          </div>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">Your Personal Climate Intelligence Twin for daily carbon tracking, AI insights, and better sustainable habits.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-white">{item.label}</a>
          ))}
          <Link to="/login" className="hover:text-white">Login</Link>
          <Link to="/signup" className="text-neon-green hover:text-green-300">Get Started</Link>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500">
        Copyright {new Date().getFullYear()} CarbonTwin AI. All rights reserved.
      </div>
    </footer>
  );
}
