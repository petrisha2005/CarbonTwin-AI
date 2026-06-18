import { motion } from "framer-motion";
import { differentiators } from "./landingData";

export function LandingWhyDifferent() {
  return (
    <section id="about" className="relative py-20">
      <div className="absolute inset-x-0 top-1/2 h-64 -translate-y-1/2 bg-neon-green/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-lg p-6 sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="label text-neon-green">Why it stands out</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Why CarbonTwin AI stands out</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {differentiators.map(({ title, description, Icon }, index) => (
              <motion.div key={title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: index * 0.04 }} className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                <Icon className="text-neon-green" size={24} />
                <h3 className="mt-4 font-black text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
