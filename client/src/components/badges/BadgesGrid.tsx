import { BadgeCard } from "./BadgeCard";
import type { Badge } from "../../services/badgeService";

export function BadgesGrid({ badges }: { badges: Badge[] }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{badges.map((badge) => <BadgeCard key={badge.badgeId} badge={badge} />)}</div>;
}
