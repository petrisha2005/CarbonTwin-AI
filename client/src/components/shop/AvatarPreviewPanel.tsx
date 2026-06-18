import type { EquippedItems, ShopItemStatus } from "../../lib/types";
import { CarbonTwinAvatar } from "../avatar/CarbonTwinAvatar";
import { Card } from "../Card";

export function AvatarPreviewPanel({ equippedItems, previewItem, level }: { equippedItems: EquippedItems; previewItem?: ShopItemStatus | null; level: number }) {
  const previewEquipped = previewItem ? { ...equippedItems, [previewItem.category]: previewItem } : equippedItems;

  return (
    <Card className="xl:sticky xl:top-28">
      <p className="label">Your CarbonTwin Preview</p>
      <h2 className="mt-1 text-2xl font-black">{previewItem ? previewItem.name : "Current style"}</h2>
      <p className="mt-2 text-sm text-slate-400">{previewItem ? previewItem.previewStyle?.effect ?? previewItem.description : "Hover an item to preview how it looks before equipping."}</p>
      <div className="mt-5">
        <CarbonTwinAvatar mood="happy" level={level} equippedItems={previewEquipped} size="lg" message={previewItem ? "Previewing item" : "Equipped style"} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {Object.values(equippedItems).length ? Object.values(equippedItems).map((item) => item && (
          <span key={item.itemId} className="rounded-lg border border-neon-green/30 bg-neon-green/10 px-3 py-2 text-xs text-neon-green">{item.name}</span>
        )) : <p className="text-sm text-slate-400">No items equipped yet.</p>}
      </div>
    </Card>
  );
}
