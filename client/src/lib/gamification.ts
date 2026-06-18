export function treeStageForLevel(level = 1) {
  if (level >= 10) return "Forest Guardian Tree";
  if (level >= 8) return "Big Tree";
  if (level >= 6) return "Young Tree";
  if (level >= 4) return "Small Plant";
  if (level >= 2) return "Sprout";
  return "Seed";
}

export function carbonEquivalents(co2Kg: number) {
  return {
    phoneCharges: Math.round(co2Kg * 120),
    petrolKm: Math.round((co2Kg / 0.19) * 10) / 10,
    treeDays: Math.round(((co2Kg / 21) * 365) * 10) / 10
  };
}

export const moodMessages = {
  glowing: "Your CarbonTwin is glowing today because you made a planet-friendly choice.",
  happy: "Your CarbonTwin feels balanced today.",
  calm: "Low-impact day! Your CarbonTwin is peaceful.",
  tired: "Your CarbonTwin is waiting for today's Eco Quest.",
  polluted: "High-impact day, but no guilt. Let's balance it with one small action."
};

export const moodSuggestions: Record<string, string> = {
  Busy: "Just switch off unused appliances today. Small action, real impact.",
  Lazy: "Keep it tiny: avoid one plastic bottle and call it a win.",
  Broke: "Save money and carbon: avoid one food delivery today.",
  Motivated: "Go for a full low-carbon day challenge.",
  Travelling: "Pick public transport for one leg if it fits your route.",
  "College Day": "Try walking one short distance on campus today.",
  "At Home": "Switch off idle devices and let your CarbonTwin chill."
};
