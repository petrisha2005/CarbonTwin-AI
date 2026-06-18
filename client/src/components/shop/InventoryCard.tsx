import { PackageCheck } from "lucide-react";
import { Card } from "../Card";

export function InventoryCard({ inventory }: { inventory: any[] }) {
  const owned = inventory.filter((item) => item.owned);

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-neon-green/10 text-neon-green">
          <PackageCheck size={20} />
        </span>
        <div>
          <p className="label">Inventory</p>
          <h3 className="text-xl font-black">{owned.length} owned</h3>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {owned.length ? (
          owned.slice(0, 6).map((item) => (
            <div key={item.itemId} className="flex items-center justify-between rounded-lg bg-white/[0.05] px-3 py-2 text-sm">
              <span>{item.name}</span>
              <span className={item.equipped ? "text-neon-green" : "text-slate-400"}>{item.equipped ? "Equipped" : "Owned"}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">No avatar items yet.</p>
        )}
      </div>
    </Card>
  );
}
