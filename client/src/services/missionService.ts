import { api } from "../lib/api";
import type { Mission, User, UserMission } from "../lib/types";

export type MissionGroups = {
  daily: Mission[];
  weekly: Mission[];
  special: Mission[];
};

export type MissionSummary = {
  completedToday: number;
  completedThisWeek: number;
  totalCompleted: number;
  activeMissions: number;
  recommendedCount: number;
  xpEarnedFromMissions: number;
  leafCoinsEarnedFromMissions: number;
  co2SavedFromMissions: number;
};

export type MissionRewardResult = {
  userMission: UserMission;
  rewards: { xp: number; leafCoins: number; co2Saved: number } | null;
  badges: Array<{ badgeId: string; title: string }>;
  user?: User;
  message?: string;
};

export type MissionProofMethod = "eco_quest_match" | "photo_proof" | "bill_or_receipt" | "ticket_or_pass" | "self_check";
export type MissionProofUploadData = {
  missionId: string;
  userMissionId: string;
  proof: {
    fileName?: string;
    proofMethod: MissionProofMethod;
    uploadedAt: string;
  };
  verificationStatus: "verified" | "pending" | "needs_review" | "rejected";
  trustScore: number;
  validationMessage?: string;
  rejectionReason?: string;
  matchedEvidence?: string[];
  expectedProof?: string;
  canClaimReward: boolean;
  nextActions: string[];
};
export type MissionProofUploadResult = MissionRewardResult & {
  success?: boolean;
  data?: MissionProofUploadData;
  proof?: unknown;
};

export const getMissions = () => api<MissionGroups>("/missions");
export const getRecommendedMissions = () => api<{ missions: Mission[] }>("/missions/recommended");
export const startMission = (missionId: string) => api<{ userMission: UserMission }>(`/missions/${missionId}/start`, { method: "POST" });
export const updateMissionProgress = (missionId: string, amount = 1) =>
  api<MissionRewardResult>(`/missions/${missionId}/progress`, { method: "POST", body: JSON.stringify({ amount }) });
export const completeMission = (missionId: string) => api<MissionRewardResult>(`/missions/${missionId}/complete`, { method: "POST" });
export const verifyMission = (missionId: string, date?: string) =>
  api<MissionRewardResult & { verification: { verified: boolean; trustScore: number; matchedFields: string[]; reason: string } }>(`/missions/${missionId}/verify`, {
    method: "POST",
    body: JSON.stringify(date ? { date } : {})
  });
export const claimMissionReward = (missionId: string) => api<MissionRewardResult & { message?: string }>(`/missions/${missionId}/claim-reward`, { method: "POST" });
export const uploadMissionProof = (missionId: string, proofMethod: MissionProofMethod, file?: File | null, note?: string) => {
  const body = new FormData();
  if (file) body.append("proof", file);
  body.append("proofMethod", proofMethod);
  body.append("proofType", proofMethod);
  if (note) body.append("optionalNote", note);
  return api<MissionProofUploadResult>(`/missions/${missionId}/upload-proof`, { method: "POST", body });
};
export const getMyMissions = () => api<{ active: UserMission[]; completed: UserMission[]; dailyCompletedToday: UserMission[]; weeklyProgress: UserMission[] }>("/missions/my");
export const getMissionSummary = () => api<MissionSummary>("/missions/summary");
