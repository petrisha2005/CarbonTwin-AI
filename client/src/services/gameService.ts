import { api } from "../lib/api";

export const getWorld = () => api<any>("/world");
export const getBoss = () => api<any>("/boss/current");
export const claimBossReward = () => api<any>("/boss/claim-reward", { method: "POST" });

export const getShopItems = () => api<any>("/shop/items");
export const getInventory = () => api<any>("/shop/inventory");
export const purchaseItem = (itemId: string) => api<any>(`/shop/purchase/${itemId}`, { method: "POST" });
export const equipItem = (itemId: string) => api<any>(`/shop/equip/${itemId}`, { method: "POST" });

export const createBattle = (body: any) => api<any>("/battles/create", { method: "POST", body: JSON.stringify(body) });
export const getMyBattles = () => api<any>("/battles/my");
export const joinBattle = (code: string) => api<any>("/battles/join", { method: "POST", body: JSON.stringify({ battleCode: code }) });
export const leaveBattle = (id: string) => api<any>(`/battles/${id}/leave`, { method: "POST" });
export const getBattleLeaderboard = (id: string) => api<any>(`/battles/${id}/leaderboard`);
