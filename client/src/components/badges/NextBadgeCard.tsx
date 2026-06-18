import { Award } from "lucide-react";
import { Card } from "../Card";
import type { Badge } from "../../services/badgeService";

export function NextBadgeCard({ badge }: { badge?: Badge }) {
  return (
    <Card>
      <h3 className="flex items-center gap-2 font-bold"><Award className="text-neon-green" /> Next Badge</h3>
      {badge ? (
        <p className="mt-2 text-sm text-slate-300">{badge.title}: {badge.description}</p>
      ) : (
        <p className="mt-2 text-sm text-slate-300">All visible badges unlocked. Small choice unlocked big progress.</p>
      )}
    </Card>
  );
}
