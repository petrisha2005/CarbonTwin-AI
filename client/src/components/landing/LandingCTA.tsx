import { motion } from "framer-motion";
import { ArrowRight, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../Button";

export function LandingCTA() {
  const { user } = useAuth();
  const startRoute = user ? "/" : "/signup";
  const accountRoute = user ? "/dashboard" : "/login";
  const accountLabel = user ? "Dashboard" : "Login";

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} className="relative overflow-hidden rounded-lg border border-neon-green/30 bg-neon-green/10 p-8 text-center shadow-glow sm:p-12">
        <div className="absolute inset-0 landing-cta-sheen" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-neon-green text-carbon-950 shadow-glow">
            <Leaf size={24} />
          </span>
          <h2 className="mt-6 text-3xl font-black sm:text-4xl">Start building better climate habits today</h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">Turn awareness into action with a smarter, more engaging way to understand your carbon footprint.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={startRoute}>
              <Button className="px-5 py-3">
                Get Started <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to={accountRoute}>
              <Button variant="secondary" className="px-5 py-3">{accountLabel}</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
