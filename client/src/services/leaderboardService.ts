import { api } from "../lib/api";

export type LeaderboardType = "global" | "city" | "college" | "department" | "weekly" | "monthly";

export type LeaderboardUser = {
  rank: number;
  userId: string;
  displayName: string;
  city: string;
  collegeName: string;
  department: string;
  batch: string;
  avatarColor: string;
  level: number;
  ecoTitle: string;
  totalCO2Saved: number;
  xp: number;
  leafCoins: number;
  currentStreak: number;
  totalLoggedDays: number;
  ecoScore: number;
  weeklyCO2Saved?: number;
  weeklyLogsCount?: number;
  weeklyXPEarned?: number;
  weeklyScore?: number;
  monthlyCO2Saved?: number;
  monthlyLogsCount?: number;
  monthlyXPEarned?: number;
  monthlyScore?: number;
};

export type LeaderboardResponse = {
  leaderboardType: LeaderboardType;
  currentUserRank: number | null;
  currentUser: LeaderboardUser | null;
  topUsers: LeaderboardUser[];
  needsProfileUpdate?: boolean;
  message?: string;
};

export type CommunityImpact = {
  global: ImpactScope;
  city: ImpactScope | null;
  college: ImpactScope | null;
  department: ImpactScope | null;
};

export type ImpactScope = {
  totalUsers: number;
  totalCO2Saved: number;
  totalEcoQuests: number;
  totalLeafCoins: number;
  equivalentTrees: number;
  equivalentPetrolKm: number;
};

export type RankInfo = {
  rank?: number | null;
  usersAhead?: number;
  pointsToNextRank?: number;
  nextRankUser?: LeaderboardUser | null;
  message?: string;
};

export type MyRanks = Record<"global" | "city" | "college" | "department" | "weekly" | "monthly", RankInfo>;

const get = (type: LeaderboardType) => api<LeaderboardResponse>(`/leaderboard/${type}`);

export const getGlobalLeaderboard = () => get("global");
export const getCityLeaderboard = () => get("city");
export const getCollegeLeaderboard = () => get("college");
export const getDepartmentLeaderboard = () => get("department");
export const getWeeklyLeaderboard = () => get("weekly");
export const getMonthlyLeaderboard = () => get("monthly");
export const getMyRanks = () => api<MyRanks>("/leaderboard/me");
export const getCommunityImpact = () => api<CommunityImpact>("/leaderboard/community-impact");
