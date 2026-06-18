import { Check, Coins, Lock, ShoppingBag, Sparkles, X } from "lucide-react";
import type { ShopItemStatus } from "../../lib/types";
import { Button } from "../Button";
import { Card } from "../Card";

const rarityClass = {
  common: "border-neon-green/35",
  rare: "border-cyan-300/45",
  epic: "border-purple-300/45",
  legendary: "border-amber-300/60 shadow-[0_0_26px_rgba(245,158,11,0.18)]"
};

export function ShopItemCard({
  item,
  busy,
  onPurchase,
  onEquip,
  onUnequip,
  onPreview
}: {
  item: ShopItemStatus;
  busy?: boolean;
  onPurchase: (id: string) => void;
  onEquip: (id: string) => void;
  onUnequip: (id: string) => void;
  onPreview: (item: ShopItemStatus) => void;
}) {
  const needCoins = Math.max(0, item.priceLeafCoins - (item.canAfford ? item.priceLeafCoins : 0));
  const disabledLabel = !item.levelUnlocked ? `Requires Level ${item.unlockLevelRequired}` : !item.canAfford ? item.lockedReason ?? `Need ${needCoins} more LeafCoins` : "";

  return (
    <Card className={`relative flex h-full flex-col border ${rarityClass[item.rarity]}`} onMouseEnter={() => onPreview(item)} onFocus={() => onPreview(item)}>
      {!item.levelUnlocked && <div className="absolute inset-0 z-10 rounded-lg bg-carbon-950/55 backdrop-blur-[1px]" />}
      <div className="relative z-20 flex items-start justify-between gap-3">
        <div>
          <p className="label">{labelCategory(item.category)}</p>
          <h3 className="mt-1 text-lg font-black">{item.name}</h3>
          <p className="mt-2 text-sm text-slate-400">{item.description}</p>
        </div>
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-2xl" style={{ color: item.previewStyle?.color }}>
          {item.previewStyle?.emoji ?? <Sparkles size={24} />}
        </span>
      </div>

      <div className="relative z-20 mt-5 flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-slate-200"><Coins size={14} /> {item.priceLeafCoins}</span>
        <span className="rounded-lg bg-white/10 px-3 py-2 text-slate-200">Level {item.unlockLevelRequired}+</span>
        <span className="rounded-lg bg-white/10 px-3 py-2 capitalize text-slate-200">{item.rarity}</span>
        {item.owned && <span className="rounded-lg bg-neon-green/10 px-3 py-2 text-neon-green">Owned</span>}
      </div>

      <div className="relative z-20 mt-auto space-y-2 pt-5">
        {!item.owned ? (
          <Button disabled={busy || !item.levelUnlocked || !item.canAfford} onClick={() => onPurchase(item.itemId)} className="w-full">
            {!item.levelUnlocked ? <Lock size={16} /> : <ShoppingBag size={16} />}
            {item.levelUnlocked && item.canAfford ? `Buy for ${item.priceLeafCoins} LeafCoins` : disabledLabel}
          </Button>
        ) : item.equipped ? (
          <>
            <Button disabled className="w-full" variant="secondary"><Check size={16} /> Equipped</Button>
            <Button disabled={busy} onClick={() => onUnequip(item.itemId)} className="w-full" variant="ghost"><X size={16} /> Unequip</Button>
          </>
        ) : (
          <Button disabled={busy} onClick={() => onEquip(item.itemId)} className="w-full">
            <Sparkles size={16} /> Equip
          </Button>
        )}
      </div>
    </Card>
  );
}

function labelCategory(category: string) {
  return category.replace(/_/g, " ");
}
