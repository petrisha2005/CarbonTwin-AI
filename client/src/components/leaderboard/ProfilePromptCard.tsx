import { UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../Card";

export function ProfilePromptCard({ message }: { message?: string }) {
  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-neon-green/15 text-neon-green"><UserRound /></span>
          <div>
            <h3 className="font-bold">Want to compete with your college or city?</h3>
            <p className="mt-1 text-sm text-slate-300">{message ?? "Complete your profile to unlock local leaderboards."}</p>
          </div>
        </div>
        <Link to="/profile" className="focus-ring inline-flex rounded-lg bg-neon-green px-4 py-2 text-sm font-semibold text-carbon-950">Complete Profile</Link>
      </div>
    </Card>
  );
}
