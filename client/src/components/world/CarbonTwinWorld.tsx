import { Cloud, Home, Sparkles, Sun, Trees, Waves } from "lucide-react";

export function CarbonTwinWorld({ world }: { world: any }) {
  const behavior = world?.behavior ?? {};
  const stage = world?.stage ?? { name: "Seed Land" };
  const equipped = world?.equippedItems ?? {};
  const tree = equipped.tree_style;
  const background = equipped.background;
  const pet = equipped.pet;
  const worldBackground = background?.previewStyle?.gradient ?? "linear-gradient(to bottom, rgb(6 78 59), #10251d, #06140f)";
  const treeColor = tree?.slug === "crystal-tree" ? "text-purple-200" : "text-neon-green";
  return (
    <div style={{ backgroundImage: worldBackground }} className={`relative min-h-[360px] overflow-hidden rounded-lg border border-white/10 p-6 ${behavior.loggedToday ? "shadow-glow" : "opacity-85"}`}>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-green-800/50 to-transparent" />
      {background?.slug === "aurora-forest-background" && <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-transparent via-purple-300/20 to-cyan-200/20 blur-2xl" />}
      <Sun className={`absolute right-8 top-8 ${behavior.goldenAura ? "text-amber-200" : "text-neon-green"}`} size={54} />
      {behavior.highCarbonDay && <Cloud className="absolute left-8 top-10 text-slate-400/70" size={72} />}
      <Waves className="absolute bottom-20 left-10 text-neon-cyan/70" size={88} />
      <Home className="absolute bottom-24 right-16 text-neon-green/80" size={stage.name.includes("Village") || stage.name.includes("Forest") ? 72 : 44} />
      <Trees className={`absolute bottom-14 left-1/2 -translate-x-1/2 ${treeColor}`} size={tree?.slug === "rainforest-tree" ? 160 : tree?.slug === "crystal-tree" ? 145 : stage.name === "Seed Land" ? 70 : stage.name === "CarbonTwin Forest" ? 150 : 110} />
      {tree?.slug === "crystal-tree" && <div className="absolute bottom-16 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-purple-300/20 blur-2xl" />}
      {(behavior.animalsAppear || pet) && <Sparkles className="absolute bottom-16 right-1/3 text-amber-200" size={36} />}
      {pet && <span className="absolute bottom-24 right-1/4 text-4xl">{pet.previewStyle?.emoji}</span>}
      {behavior.goldenAura && <div className="absolute inset-4 rounded-full border border-amber-200/30" />}
      <div className="relative z-10 max-w-md">
        <p className="text-xs uppercase tracking-wide text-neon-green">CarbonTwin World</p>
        <h2 className="mt-1 text-3xl font-black">{stage.name}</h2>
        <p className="mt-2 text-slate-300">{stage.description}</p>
        {tree && <p className="mt-2 text-sm text-neon-green">{tree.name} equipped</p>}
        <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-slate-100"><Sparkles size={16} /> {behavior.loggedToday ? "World glowing from today's Eco Quest" : "Complete Eco Quest to brighten your world"}</p>
      </div>
    </div>
  );
}
