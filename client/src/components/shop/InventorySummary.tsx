import type { ShopItemStatus } from "../../lib/types";
import { Card } from "../Card";

export function InventorySummary({ inventory }: { inventory: ShopItemStatus[] }) {
  const owned = inventory;
  return (
    <Card>
      <p className="label">Inventory</p>
      <h3 className="mt-1 text-xl font-black">{owned.length} items owned</h3>
      <div className="mt-4 space-y-2">
        {owned.length ? owned.slice(0, 6).map((item) => (
          <div key={item.itemId} className="flex items-center justify-between rounded-lg bg-white/[0.05] px-3 py-2 text-sm">
            <span>{item.name}</span>
            <span className={item.equipped ? "text-neon-green" : "text-slate-400"}>{item.equipped ? "Equipped" : "Owned"}</span>
          </div>
        )) : <p className="text-sm text-slate-400">Buy your first cosmetic item to start customizing.</p>}
      </div>
    </Card>
  );
}
