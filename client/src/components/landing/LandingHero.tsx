import { motion } from "framer-motion";
import { ArrowRight, Globe2, Leaf, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../Button";
import { heroChips } from "./landingData";

export function LandingHero() {
  const { user } = useAuth();
  const startRoute = user ? "/" : "/signup";

  return (
    <section id="home" className="relative min-h-screen overflow-hidden pt-24">
      <div className="absolute inset-0 landing-hero-scene" />
      <div className="absolute inset-0 bg-gradient-to-b from-carbon-950/30 via-carbon-950/65 to-carbon-950" />
      <div className="absolute inset-0 landing-grid opacity-40" />
      <div className="landing-particle left-[12%] top-[22%]" />
      <div className="landing-particle left-[78%] top-[18%] animation-delay-700" />
      <div className="landing-particle left-[64%] top-[72%] animation-delay-1000" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.78fr] lg:px-8">
        <div>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-lg border border-neon-green/30 bg-neon-green/10 px-3 py-2 text-sm font-semibold text-neon-green">
            <Sparkles size={16} /> Your Personal Climate Intelligence Twin
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="mt-6 max-w-4xl text-5xl font-black leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            Meet Your Digital Carbon Twin
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Understand, track, and reduce your carbon footprint with AI-powered insights, daily eco tracking, and smarter sustainable habits.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-8 flex flex-wrap gap-3">
            <Link to={startRoute}>
              <Button className="px-5 py-3">
                Get Started <ArrowRight size={18} />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="secondary" className="px-5 py-3">Explore Features</Button>
            </a>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.26 }} className="mt-5 text-sm text-slate-400">
            Track your impact. Build better habits. Grow your CarbonTwin.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="mt-7 flex flex-wrap gap-2">
            {heroChips.map(({ label, Icon }) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.07] px-3 py-2 text-sm text-slate-100 backdrop-blur">
                <Icon size={16} className="text-neon-green" /> {label}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.16 }} className="relative mx-auto w-full max-w-[520px]">
          <div className="absolute -inset-10 rounded-full bg-neon-green/15 blur-3xl" />
          <div className="relative aspect-square overflow-hidden rounded-full border border-white/15 bg-[radial-gradient(circle_at_50%_45%,rgba(34,197,94,0.24),rgba(6,182,212,0.08)_42%,rgba(7,26,18,0.92)_72%)] shadow-2xl shadow-black/40">
            <div className="absolute inset-[12%] rounded-full border border-neon-green/25" />
            <div className="absolute inset-[22%] rounded-full border border-cyan-300/15" />
            <div className="absolute inset-[32%] rounded-full bg-carbon-950/55 shadow-inner shadow-neon-green/20" />
            <div className="absolute inset-[18%] rounded-full border border-dashed border-white/20 landing-slow-spin" />
            <div className="absolute inset-[8%] rounded-full border border-neon-green/15 landing-reverse-spin" />
            <span className="absolute left-[20%] top-[26%] grid h-12 w-12 place-items-center rounded-lg border border-neon-green/30 bg-carbon-950/75 text-neon-green backdrop-blur">
              <Leaf size={22} />
            </span>
            <span className="absolute right-[18%] top-[36%] grid h-12 w-12 place-items-center rounded-lg border border-cyan-300/25 bg-carbon-950/75 text-cyan-200 backdrop-blur">
              <Globe2 size={22} />
            </span>
            <span className="absolute bottom-[20%] left-[43%] grid h-12 w-12 place-items-center rounded-lg border border-neon-green/30 bg-carbon-950/75 text-neon-green backdrop-blur">
              <Zap size={22} />
            </span>
            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.08)_46%,transparent_62%)] opacity-60" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
