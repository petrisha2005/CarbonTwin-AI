import { motion } from "framer-motion";
import { steps } from "./landingData";

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="label text-neon-green">Simple flow</p>
        <h2 className="mt-3 text-3xl font-black sm:text-4xl">How It Works</h2>
      </div>
      <div className="mt-10 grid gap-4 lg:grid-cols-4">
        {steps.map(({ title, description, Icon }, index) => (
          <motion.div key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: index * 0.05 }} className="relative rounded-lg border border-white/10 bg-white/[0.045] p-5">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-neon-green text-sm font-black text-carbon-950">{index + 1}</span>
            <Icon className="mt-7 text-neon-green" size={26} />
            <h3 className="mt-4 font-black text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
