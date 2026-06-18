import type { EquippedItems } from "../lib/types";
import { CarbonTwinAvatar as EquippedCarbonTwinAvatar } from "./avatar/CarbonTwinAvatar";

type Mood = "glowing" | "happy" | "calm" | "tired" | "polluted";

export function CarbonTwinAvatar({ mood = "tired", message, equippedItems }: { mood?: Mood; message?: string; equippedItems?: EquippedItems }) {
  return <EquippedCarbonTwinAvatar mood={mood} message={message} equippedItems={equippedItems} size="md" />;
}
