import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/Card";
import { AvatarPreviewPanel } from "../components/shop/AvatarPreviewPanel";
import { InventorySummary } from "../components/shop/InventorySummary";
import { ShopFilters } from "../components/shop/ShopFilters";
import { ShopHeader } from "../components/shop/ShopHeader";
import { ShopItemCard } from "../components/shop/ShopItemCard";
import { useAuth } from "../context/AuthContext";
import type { EquippedItems, ShopCategory, ShopItemStatus, User } from "../lib/types";
import { equipItem, getEquippedItems, getInventory, getShopItems, purchaseItem, unequipItem } from "../services/shopService";

export function ShopPage() {
  const { user, setUser } = useAuth();
  const [items, setItems] = useState<ShopItemStatus[]>([]);
  const [inventory, setInventory] = useState<ShopItemStatus[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({});
  const [shopUser, setShopUser] = useState<User | null>(user);
  const [activeFilter, setActiveFilter] = useState<ShopCategory | "all">("all");
  const [previewItem, setPreviewItem] = useState<ShopItemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const [shop, inv, equipped] = await Promise.all([getShopItems(), getInventory(), getEquippedItems()]);
    setItems(shop.items);
    setInventory(inv.items ?? inv.inventory ?? []);
    setEquippedItems(equipped.equippedItems ?? {});
    setShopUser(shop.user);
    setUser(shop.user);
    setLoading(false);
  }

  useEffect(() => {
    load().catch((error: any) => {
      setMessage(error.message ?? "Could not load shop.");
      setLoading(false);
    });
  }, []);

  const filteredItems = useMemo(() => (activeFilter === "all" ? items : items.filter((item) => item.category === activeFilter)), [activeFilter, items]);

  async function act(fn: () => Promise<any>) {
    setBusy(true);
    setMessage("");
    try {
      const result = await fn();
      if (result.user) {
        setShopUser(result.user);
        setUser(result.user);
      }
      setMessage(result.message ?? "Shop updated.");
      await load();
    } catch (error: any) {
      setMessage(error.message ?? "Shop action failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Card><p className="text-slate-300">Loading CarbonTwin Shop...</p></Card>;

  return (
    <div className="space-y-6">
      <ShopHeader user={shopUser} inventoryCount={inventory.length} equippedCount={Object.values(equippedItems).filter(Boolean).length} />
      {message && <Card><p className={message.toLowerCase().includes("need") || message.toLowerCase().includes("reach") || message.toLowerCase().includes("already") ? "text-amber-200" : "text-neon-green"}>{message}</p></Card>}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <ShopFilters active={activeFilter} onChange={setActiveFilter} />
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredItems.map((item) => (
              <ShopItemCard
                key={item.itemId}
                item={item}
                busy={busy}
                onPreview={setPreviewItem}
                onPurchase={(id) => act(() => purchaseItem(id))}
                onEquip={(id) => act(() => equipItem(id))}
                onUnequip={(id) => act(() => unequipItem(id))}
              />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <AvatarPreviewPanel equippedItems={equippedItems} previewItem={previewItem} level={shopUser?.level ?? 1} />
          <InventorySummary inventory={inventory} />
        </div>
      </div>
    </div>
  );
}
