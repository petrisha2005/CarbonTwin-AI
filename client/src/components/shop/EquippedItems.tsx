import { Shirt } from "lucide-react";
import { Card } from "../Card";

export function EquippedItems({ items }: { items: any[] }) {
  const equipped = items.filter((item) => item.equipped);

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-neon-green/10 text-neon-green">
          <Shirt size={20} />
        </span>
        <div>
          <p className="label">Equipped</p>
          <h3 className="text-xl font-black">Avatar Style</h3>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {equipped.length ? (
          equipped.map((item) => (
            <span key={item.itemId} className="rounded-lg border border-neon-green/30 bg-neon-green/10 px-3 py-2 text-sm text-neon-green">
              {item.name}
            </span>
          ))
        ) : (
          <p className="text-sm text-slate-400">Equip one item from each category to personalize your CarbonTwin.</p>
        )}
      </div>
    </Card>
  );
}
