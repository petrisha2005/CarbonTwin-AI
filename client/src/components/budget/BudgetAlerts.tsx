import { AlertTriangle } from "lucide-react";
import { Card } from "../Card";

export function BudgetAlerts({ alerts }: { alerts: { type: string; message: string }[] }) {
  return (
    <Card>
      <h3 className="flex items-center gap-2 text-xl font-black"><AlertTriangle className="text-amber-200" /> Budget Alerts</h3>
      <div className="mt-4 space-y-2">
        {alerts.length ? alerts.map((alert) => (
          <p key={alert.message} className={`rounded-lg px-3 py-2 text-sm ${alert.type === "warning" ? "bg-red-400/10 text-red-200" : "bg-neon-green/10 text-neon-green"}`}>{alert.message}</p>
        )) : <p className="text-sm text-slate-400">Your categories are under control this month.</p>}
      </div>
    </Card>
  );
}
