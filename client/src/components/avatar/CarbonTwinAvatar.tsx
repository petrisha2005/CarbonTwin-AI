import { motion } from "framer-motion";
import { Bot, Leaf, Sparkles } from "lucide-react";
import type { EquippedItems } from "../../lib/types";
import { moodMessages } from "../../lib/gamification";

type Mood = "glowing" | "happy" | "calm" | "tired" | "polluted";

const sizeClasses = {
  sm: { shell: "p-4", orb: "h-24 w-24", bot: 48 },
  md: { shell: "p-5", orb: "h-32 w-32", bot: 62 },
  lg: { shell: "p-6", orb: "h-44 w-44", bot: 88 }
};

export function CarbonTwinAvatar({
  mood = "tired",
  level,
  equippedItems = {},
  size = "md",
  showPet = true,
  showFrame = true,
  animated = true,
  message
}: {
  mood?: Mood;
  level?: number;
  equippedItems?: EquippedItems;
  size?: "sm" | "md" | "lg";
  showPet?: boolean;
  showFrame?: boolean;
  animated?: boolean;
  message?: string;
}) {
  const aura = equippedItems.avatar_aura;
  const outfit = equippedItems.outfit;
  const pet = equippedItems.pet;
  const frame = equippedItems.profile_frame;
  const background = equippedItems.background;
  const classes = sizeClasses[size];
  const auraGlow = aura?.previewStyle?.glow ?? (mood === "glowing" ? "0 0 34px rgba(34,197,94,0.5)" : undefined);
  const backgroundStyle = background?.previewStyle?.gradient ? { backgroundImage: background.previewStyle.gradient } : undefined;
  const botColor = outfit?.previewStyle?.color ?? aura?.previewStyle?.color ?? (mood === "polluted" ? "#fde68a" : "#22c55e");

  return (
    <div
      style={backgroundStyle}
      className={`relative overflow-hidden rounded-lg border text-center ${
        classes.shell
      } ${mood === "polluted" ? "border-amber-400/30 bg-amber-500/10" : "border-neon-green/25 bg-neon-green/10"}`}
    >
      {background?.slug === "aurora-forest-background" && <motion.div animate={{ x: ["-20%", "20%", "-20%"] }} transition={{ repeat: Infinity, duration: 8 }} className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-transparent via-purple-300/20 to-transparent blur-2xl" />}
      {(aura?.slug === "leaf-spark-aura" || mood === "glowing") && (
        <>
          <motion.span animate={animated ? { y: [-4, -18, -4], opacity: [0.3, 1, 0.3] } : undefined} transition={{ repeat: Infinity, duration: 2.4 }} className="absolute left-8 top-8 text-neon-green"><Leaf size={18} /></motion.span>
          <motion.span animate={animated ? { y: [0, -16, 0], opacity: [0.25, 0.9, 0.25] } : undefined} transition={{ repeat: Infinity, duration: 2.8 }} className="absolute right-10 top-16 text-neon-green"><Leaf size={16} /></motion.span>
        </>
      )}
      {mood === "polluted" && <motion.div animate={animated ? { opacity: [0.25, 0.55, 0.25] } : undefined} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-x-8 top-6 h-16 rounded-full bg-slate-400/20 blur-xl" />}
      {showFrame && frame?.slug === "solar-crown" && <div className="absolute inset-3 rounded-lg border border-amber-300/45 shadow-[0_0_28px_rgba(245,158,11,0.28)]" />}
      <motion.div
        animate={animated ? { scale: aura || mood === "glowing" ? [1, 1.04, 1] : 1, opacity: mood === "tired" ? 0.72 : 1 } : undefined}
        transition={{ repeat: aura || mood === "glowing" ? Infinity : 0, duration: 2 }}
        style={{ boxShadow: auraGlow }}
        className={`relative mx-auto grid ${classes.orb} place-items-center rounded-full border bg-carbon-950/80 ${aura || mood === "glowing" ? "border-neon-green" : "border-white/15"}`}
      >
        {showFrame && frame?.slug === "solar-crown" && <span className="absolute -top-5 text-3xl">👑</span>}
        <Bot size={classes.bot} style={{ color: botColor }} />
        {outfit && <span className="absolute bottom-4 rounded-full border border-white/15 px-3 py-1 text-xs font-black text-white" style={{ background: outfit.previewStyle?.gradient ?? outfit.previewStyle?.color }}>{outfit.slug === "climate-jacket" ? "ECO" : "HOOD"}</span>}
      </motion.div>
      {showPet && pet && <motion.span animate={animated ? { y: [0, -8, 0] } : undefined} transition={{ repeat: Infinity, duration: 2.2 }} className="absolute bottom-12 right-[22%] text-3xl">{pet.previewStyle?.emoji}</motion.span>}
      {aura?.slug === "golden-eco-aura" && <Sparkles className="absolute right-8 top-8 text-amber-200" size={22} />}
      <p className="mt-4 text-sm font-bold uppercase tracking-wide text-neon-green">{level ? `Level ${level}` : mood}</p>
      <p className="mt-2 text-sm text-slate-200">{message ?? moodMessages[mood]}</p>
    </div>
  );
}
