import { motion } from "framer-motion";
import { features } from "./landingData";

export function LandingFeatures() {
  return (
    <section id="features" className="relative border-y border-white/10 bg-white/[0.025] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label text-neon-green">Product system</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Core Features</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">The most important tools for understanding, improving, and staying motivated around your carbon footprint.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map(({ title, description, Icon }, index) => (
            <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: index * 0.035 }} className="group rounded-lg border border-white/10 bg-carbon-950/55 p-5 backdrop-blur transition hover:-translate-y-1 hover:border-neon-green/45 hover:bg-neon-green/10">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-neon-green/10 text-neon-green transition group-hover:bg-neon-green group-hover:text-carbon-950">
                <Icon size={22} />
              </span>
              <h3 className="mt-5 text-lg font-black text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
