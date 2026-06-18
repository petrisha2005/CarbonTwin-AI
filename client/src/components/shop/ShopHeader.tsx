import { Coins, PackageCheck, Shirt, Trophy } from "lucide-react";
import type { User } from "../../lib/types";
import { Card } from "../Card";

export function ShopHeader({ user, inventoryCount, equippedCount }: { user?: User | null; inventoryCount: number; equippedCount: number }) {
  return (
    <Card>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-neon-green">Reward shop</p>
          <h1 className="mt-1 text-3xl font-black">CarbonTwin Shop</h1>
          <p className="mt-2 text-slate-400">Use LeafCoins to customize your CarbonTwin avatar and world.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-4 xl:min-w-[560px]">
          <Mini icon={Coins} label="LeafCoins" value={user?.leafCoins ?? 0} />
          <Mini icon={Trophy} label="Level" value={user?.level ?? 1} />
          <Mini icon={PackageCheck} label="Owned" value={inventoryCount} />
          <Mini icon={Shirt} label="Equipped" value={equippedCount} />
        </div>
      </div>
    </Card>
  );
}

function Mini({ icon: Icon, label, value }: { icon: typeof Coins; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-3">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400"><Icon size={14} /> {label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}
