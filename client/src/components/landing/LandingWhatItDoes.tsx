import { motion } from "framer-motion";
import { whatItDoes } from "./landingData";

export function LandingWhatItDoes() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="label text-neon-green">What CarbonTwin AI does</p>
        <h2 className="mt-3 text-3xl font-black sm:text-4xl">A smarter way to understand your lifestyle impact</h2>
        <p className="mt-4 text-lg leading-8 text-slate-300">
          CarbonTwin AI turns everyday choices like travel, electricity, food, and shopping into simple carbon insights. It helps users track patterns, receive personalized suggestions, and take small actions that lead to real environmental impact.
        </p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {whatItDoes.map(({ title, description, Icon }, index) => (
          <motion.div key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: index * 0.04 }} className="glass rounded-lg p-5 transition hover:-translate-y-1 hover:border-neon-green/40">
            <Icon className="text-neon-green" size={26} />
            <h3 className="mt-5 font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
