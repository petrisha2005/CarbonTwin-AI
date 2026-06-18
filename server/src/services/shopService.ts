import { ShopItem } from "../models/ShopItem.js";
import { UserInventory } from "../models/UserInventory.js";
import { defaultShopItems, gameMemory } from "./gameState.js";
import { isMongoEnabled, store } from "./store.js";

type ShopCategory = "avatar_aura" | "outfit" | "tree_style" | "pet" | "profile_frame" | "background" | "badge_effect";

function keyFor(item: any) {
  return item.slug ?? item.itemId;
}

function serializeItem(item: any) {
  const slug = item.slug ?? item.itemId;
  return {
    id: String(item._id ?? slug),
    itemId: slug,
    slug,
    name: item.name,
    category: item.category as ShopCategory,
    description: item.description,
    priceLeafCoins: item.priceLeafCoins,
    unlockLevelRequired: item.unlockLevelRequired ?? 1,
    rarity: item.rarity ?? "common",
    icon: item.icon ?? "Sparkles",
    previewStyle: item.previewStyle ?? {},
    active: item.active !== false,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

function serializeInventory(row: any) {
  return {
    id: String(row._id ?? `${row.userId}-${row.itemId}`),
    userId: String(row.userId),
    itemId: row.itemId,
    purchasedAt: row.purchasedAt,
    equipped: row.equipped ?? false,
    category: row.category
  };
}

async function activeItems() {
  const rows = isMongoEnabled() ? await ShopItem.find({ active: true }).sort({ unlockLevelRequired: 1, priceLeafCoins: 1 }) : gameMemory.shopItems.filter((item) => item.active);
  return rows.map(serializeItem);
}

async function inventoryRows(userId: string) {
  const rows = isMongoEnabled() ? await UserInventory.find({ userId }) : gameMemory.inventory.filter((row) => row.userId === userId);
  return rows.map(serializeInventory);
}

async function saveInventory(row: any) {
  const update = { ...row };
  delete update.id;
  delete update._id;
  if (isMongoEnabled()) {
    const saved = await UserInventory.findOneAndUpdate({ userId: row.userId, itemId: row.itemId }, update, { upsert: true, new: true, setDefaultsOnInsert: true });
    return serializeInventory(saved);
  }
  const index = gameMemory.inventory.findIndex((item) => item.userId === row.userId && item.itemId === row.itemId);
  if (index >= 0) gameMemory.inventory[index] = { ...gameMemory.inventory[index], ...row };
  else gameMemory.inventory.push(row);
  return serializeInventory(index >= 0 ? gameMemory.inventory[index] : row);
}

function itemStatus(item: any, user: any, ownedRows: any[]) {
  const owned = ownedRows.some((row) => row.itemId === item.itemId);
  const equipped = ownedRows.some((row) => row.itemId === item.itemId && row.equipped);
  const levelUnlocked = (user?.level ?? 1) >= item.unlockLevelRequired;
  const canAfford = (user?.leafCoins ?? 0) >= item.priceLeafCoins;
  const needed = Math.max(0, item.priceLeafCoins - (user?.leafCoins ?? 0));
  const lockedReason = !levelUnlocked ? `Requires Level ${item.unlockLevelRequired}` : !owned && !canAfford ? `Need ${needed} more LeafCoins` : null;
  return {
    item,
    ...item,
    owned,
    equipped,
    canAfford,
    levelUnlocked,
    lockedReason,
    locked: Boolean(lockedReason)
  };
}

function groupEquipped(shopItems: any[], rows: any[]) {
  const byId = new Map(shopItems.map((item) => [item.itemId, item]));
  return rows.reduce<Record<string, any>>((grouped, row) => {
    if (!row.equipped) return grouped;
    const item = byId.get(row.itemId);
    if (item) grouped[item.category] = { ...item, inventoryId: row.id, purchasedAt: row.purchasedAt, equipped: true };
    return grouped;
  }, {});
}

export const shopService = {
  async seed() {
    if (!isMongoEnabled()) {
      gameMemory.shopItems = defaultShopItems.map((item) => ({ ...item }));
      return;
    }
    for (const item of defaultShopItems) {
      await ShopItem.findOneAndUpdate(
        { slug: item.slug },
        { ...item, itemId: item.slug },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  },

  async items(userId: string) {
    const [user, shopItems, owned] = await Promise.all([store.findUser(userId), activeItems(), inventoryRows(userId)]);
    return {
      items: shopItems.map((item) => itemStatus(item, user, owned)),
      user,
      inventoryCount: owned.length,
      equippedCount: owned.filter((row) => row.equipped).length
    };
  },

  async inventory(userId: string) {
    const [shopItems, owned] = await Promise.all([activeItems(), inventoryRows(userId)]);
    const byId = new Map(shopItems.map((item) => [item.itemId, item]));
    const items = owned.map((row) => ({ ...row, item: byId.get(row.itemId), ...(byId.get(row.itemId) ?? {}) })).filter((row) => row.item);
    return { items, inventory: items };
  },

  async equipped(userId: string) {
    const [shopItems, owned] = await Promise.all([activeItems(), inventoryRows(userId)]);
    return { equippedItems: groupEquipped(shopItems, owned) };
  },

  async purchase(userId: string, itemId: string) {
    const [user, shopItems, owned] = await Promise.all([store.findUser(userId), activeItems(), inventoryRows(userId)]);
    if (!user) throw new Error("User not found");
    const item = shopItems.find((row) => row.itemId === itemId || row.slug === itemId || row.id === itemId);
    if (!item) throw new Error("Item not found");
    if (owned.some((row) => row.itemId === item.itemId)) throw new Error("You already own this item.");
    if ((user.level ?? 1) < item.unlockLevelRequired) throw new Error(`Reach Level ${item.unlockLevelRequired} to unlock ${item.name}.`);
    const remainingNeeded = item.priceLeafCoins - (user.leafCoins ?? 0);
    if (remainingNeeded > 0) throw new Error(`You need ${remainingNeeded} more LeafCoins to unlock this item.`);
    await store.updateUser(userId, { leafCoins: Math.max(0, (user.leafCoins ?? 0) - item.priceLeafCoins) });
    const inventory = await saveInventory({ userId, itemId: item.itemId, category: item.category, purchasedAt: new Date(), equipped: false });
    return { message: `Item unlocked! You bought ${item.name}.`, item, inventory, user: await store.findUser(userId) };
  },

  async equip(userId: string, itemId: string) {
    const [shopItems, owned] = await Promise.all([activeItems(), inventoryRows(userId)]);
    const item = shopItems.find((row) => row.itemId === itemId || row.slug === itemId || row.id === itemId);
    if (!item) throw new Error("Item not found");
    if (!owned.some((row) => row.itemId === item.itemId)) throw new Error("Purchase item before equipping.");
    for (const row of owned) {
      if (row.category === item.category) await saveInventory({ ...row, equipped: row.itemId === item.itemId });
    }
    return { message: `${item.name} equipped on your CarbonTwin.`, ...(await this.equipped(userId)), inventory: (await this.inventory(userId)).items };
  },

  async unequip(userId: string, itemId: string) {
    const [shopItems, owned] = await Promise.all([activeItems(), inventoryRows(userId)]);
    const item = shopItems.find((row) => row.itemId === itemId || row.slug === itemId || row.id === itemId);
    if (!item) throw new Error("Item not found");
    const row = owned.find((entry) => entry.itemId === item.itemId);
    if (!row) throw new Error("Purchase item before unequipping.");
    await saveInventory({ ...row, equipped: false });
    return { message: `${item.name} unequipped.`, ...(await this.equipped(userId)), inventory: (await this.inventory(userId)).items };
  }
};
