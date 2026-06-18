import { api } from "../lib/api";
import type { EquippedItems, ShopItemStatus, User } from "../lib/types";

export type ShopItemsResponse = {
  items: ShopItemStatus[];
  user: User;
  inventoryCount: number;
  equippedCount: number;
};

export const getShopItems = () => api<ShopItemsResponse>("/shop/items");
export const getInventory = () => api<{ items: ShopItemStatus[]; inventory: ShopItemStatus[] }>("/shop/inventory");
export const getEquippedItems = () => api<{ equippedItems: EquippedItems }>("/shop/equipped");
export const purchaseItem = (itemId: string) => api<{ message: string; user: User }>(`/shop/purchase/${itemId}`, { method: "POST" });
export const equipItem = (itemId: string) => api<{ message: string; equippedItems: EquippedItems; inventory: ShopItemStatus[] }>(`/shop/equip/${itemId}`, { method: "POST" });
export const unequipItem = (itemId: string) => api<{ message: string; equippedItems: EquippedItems; inventory: ShopItemStatus[] }>(`/shop/unequip/${itemId}`, { method: "POST" });
