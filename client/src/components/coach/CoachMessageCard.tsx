import { Bot, DatabaseZap } from "lucide-react";
import { Card } from "../Card";
import type { CoachRecommendation } from "../../services/coachService";

export function CoachMessageCard({ recommendation }: { recommendation: CoachRecommendation }) {
  return (
    <Card>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-neon-green/15 text-neon-green">
            <Bot size={24} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neon-green">AI Eco Coach</p>
            <h2 className="mt-1 text-2xl font-black">AI Eco Coach</h2>
            <p className="mt-2 max-w-3xl text-slate-300">{recommendation.coachMessage}</p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-neon-green/30 bg-neon-green/10 px-3 py-2 text-sm text-neon-green">
          <DatabaseZap size={16} />
          {recommendation.source === "gemini" ? "Gemini" : "Fallback"}
        </span>
      </div>
      <p className="mt-5 rounded-lg border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-200">{recommendation.summary}</p>
    </Card>
  );
}
