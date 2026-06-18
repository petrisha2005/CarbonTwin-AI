import { api } from "../lib/api";

export const createBattle = (data: any) => api<any>("/battles/create", { method: "POST", body: JSON.stringify(data) });
export const joinBattle = (battleCode: string) => api<any>("/battles/join", { method: "POST", body: JSON.stringify({ battleCode }) });
export const getMyBattles = () => api<any>("/battles/my");
export const getBattleById = (id: string) => api<any>(`/battles/${id}`);
export const getBattleByCode = (code: string) => api<any>(`/battles/code/${code}`);
export const getBattleLeaderboard = (id: string) => api<any>(`/battles/${id}/leaderboard`);
export const getBattleActivity = (id: string) => api<any>(`/battles/${id}/activity`);
export const leaveBattle = (id: string) => api<any>(`/battles/${id}/leave`, { method: "POST" });
export const cancelBattle = (id: string) => api<any>(`/battles/${id}/cancel`, { method: "POST" });
export const finalizeBattle = (id: string) => api<any>(`/battles/${id}/finalize`, { method: "POST" });
