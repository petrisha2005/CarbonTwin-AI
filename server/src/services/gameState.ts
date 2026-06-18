export const monsterNames = ["Smog Beast", "Plastic Phantom", "Energy Ogre", "Waste Dragon", "Carbon Kraken"];

export const defaultShopItems = [
  { itemId: "green-aura", slug: "green-aura", name: "Green Aura", category: "avatar_aura", description: "A soft green glow around your CarbonTwin.", priceLeafCoins: 100, unlockLevelRequired: 1, rarity: "common", icon: "Sparkles", previewStyle: { color: "#22c55e", glow: "0 0 34px rgba(34,197,94,0.5)", emoji: "✨", effect: "soft green glow" }, active: true },
  { itemId: "leaf-spark-aura", slug: "leaf-spark-aura", name: "Leaf Spark Aura", category: "avatar_aura", description: "Floating leaf particles that orbit your CarbonTwin.", priceLeafCoins: 250, unlockLevelRequired: 3, rarity: "rare", icon: "Leaf", previewStyle: { color: "#86efac", glow: "0 0 42px rgba(134,239,172,0.55)", emoji: "🍃", effect: "floating leaf particles" }, active: true },
  { itemId: "golden-eco-aura", slug: "golden-eco-aura", name: "Golden Eco Aura", category: "avatar_aura", description: "A golden glow for consistent climate action.", priceLeafCoins: 700, unlockLevelRequired: 7, rarity: "epic", icon: "Sun", previewStyle: { color: "#facc15", glow: "0 0 46px rgba(250,204,21,0.55)", emoji: "☀️", effect: "golden glow" }, active: true },
  { itemId: "forest-hoodie", slug: "forest-hoodie", name: "Forest Hoodie", category: "outfit", description: "A cozy green hoodie avatar style.", priceLeafCoins: 150, unlockLevelRequired: 2, rarity: "common", icon: "Shirt", previewStyle: { color: "#16a34a", emoji: "🧥", effect: "green hoodie avatar style" }, active: true },
  { itemId: "climate-jacket", slug: "climate-jacket", name: "Climate Jacket", category: "outfit", description: "A futuristic eco jacket for your CarbonTwin.", priceLeafCoins: 350, unlockLevelRequired: 4, rarity: "rare", icon: "Shirt", previewStyle: { color: "#06b6d4", gradient: "linear-gradient(135deg,#0f766e,#06b6d4)", emoji: "🧬", effect: "futuristic eco jacket" }, active: true },
  { itemId: "solar-crown", slug: "solar-crown", name: "Solar Crown", category: "profile_frame", description: "A glowing crown and frame for high-impact players.", priceLeafCoins: 500, unlockLevelRequired: 5, rarity: "epic", icon: "Crown", previewStyle: { color: "#f59e0b", glow: "0 0 36px rgba(245,158,11,0.5)", emoji: "👑", effect: "glowing crown/frame" }, active: true },
  { itemId: "butterfly-companion", slug: "butterfly-companion", name: "Butterfly Companion", category: "pet", description: "A butterfly companion that floats near your avatar.", priceLeafCoins: 300, unlockLevelRequired: 3, rarity: "rare", icon: "Badge", previewStyle: { color: "#67e8f9", emoji: "🦋", effect: "butterfly near avatar" }, active: true },
  { itemId: "fox-companion", slug: "fox-companion", name: "Fox Companion", category: "pet", description: "A small fox companion beside your CarbonTwin.", priceLeafCoins: 600, unlockLevelRequired: 6, rarity: "epic", icon: "Badge", previewStyle: { color: "#fb923c", emoji: "🦊", effect: "small fox companion" }, active: true },
  { itemId: "rainforest-tree", slug: "rainforest-tree", name: "Rainforest Tree", category: "tree_style", description: "A lush rainforest style for your CarbonTwin world.", priceLeafCoins: 400, unlockLevelRequired: 4, rarity: "rare", icon: "TreePine", previewStyle: { color: "#22c55e", emoji: "🌳", effect: "lush tree style" }, active: true },
  { itemId: "crystal-tree", slug: "crystal-tree", name: "Crystal Tree", category: "tree_style", description: "A glowing crystal tree for legendary worlds.", priceLeafCoins: 1000, unlockLevelRequired: 10, rarity: "legendary", icon: "Gem", previewStyle: { color: "#a78bfa", glow: "0 0 42px rgba(167,139,250,0.55)", emoji: "💎", effect: "glowing crystal tree" }, active: true },
  { itemId: "clean-sky-background", slug: "clean-sky-background", name: "Clean Sky Background", category: "background", description: "A clear blue-green background for your avatar card.", priceLeafCoins: 120, unlockLevelRequired: 1, rarity: "common", icon: "CloudSun", previewStyle: { color: "#38bdf8", gradient: "linear-gradient(135deg,#0f766e,#38bdf8)", emoji: "🌤️", effect: "clean sky avatar background" }, active: true },
  { itemId: "aurora-forest-background", slug: "aurora-forest-background", name: "Aurora Forest Background", category: "background", description: "An animated aurora forest background.", priceLeafCoins: 1200, unlockLevelRequired: 12, rarity: "legendary", icon: "Stars", previewStyle: { color: "#c084fc", gradient: "linear-gradient(135deg,#052e16,#0e7490,#7e22ce)", emoji: "🌌", effect: "animated aurora forest background" }, active: true }
];

export const gameMemory = {
  bosses: [] as any[],
  shopItems: [...defaultShopItems],
  inventory: [] as any[],
  battles: [] as any[],
  battleActivities: [] as any[]
};
