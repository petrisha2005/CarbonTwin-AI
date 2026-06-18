import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/Card";
import { BadgesGrid } from "../components/badges/BadgesGrid";
import { NextBadgeCard } from "../components/badges/NextBadgeCard";
import { MissionCard } from "../components/missions/MissionCard";
import { MissionHeroCard } from "../components/missions/MissionHeroCard";
import { MoodMissionCard } from "../components/missions/MoodMissionCard";
import { MissionTabs, type MissionTab } from "../components/missions/MissionTabs";
import { RecommendedMissions } from "../components/missions/RecommendedMissions";
import { RewardModal } from "../components/missions/RewardModal";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import type { Mission } from "../lib/types";
import { getBadges, type Badge } from "../services/badgeService";
import {
  completeMission,
  claimMissionReward,
  getMissionSummary,
  getMissions,
  getRecommendedMissions,
  startMission,
  uploadMissionProof,
  updateMissionProgress,
  verifyMission,
  type MissionProofMethod,
  type MissionGroups,
  type MissionProofUploadResult,
  type MissionRewardResult,
  type MissionSummary
} from "../services/missionService";

export function MissionsPage() {
  const [groups, setGroups] = useState<MissionGroups>({ daily: [], weekly: [], special: [] });
  const [recommended, setRecommended] = useState<Mission[]>([]);
  const [summary, setSummary] = useState<MissionSummary | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [tab, setTab] = useState<MissionTab>("all");
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState<{ xp: number; leafCoins: number; co2Saved: number; badges?: string[] } | null>(null);
  const [message, setMessage] = useState("");
  const { setUser } = useAuth();

  async function load() {
    setLoading(true);
    const [missionData, recommendedData, summaryData, badgeData] = await Promise.all([
      getMissions(),
      getRecommendedMissions(),
      getMissionSummary(),
      getBadges()
    ]);
    setGroups(missionData);
    setRecommended(recommendedData.missions);
    setSummary(summaryData);
    setBadges(badgeData.badges);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function applyResult(result: MissionRewardResult) {
    if (result.user) setUser(result.user);
    if (result.message) setMessage(result.message);
    if (result.rewards) {
      setMessage("");
      setReward({
        xp: result.rewards.xp,
        leafCoins: result.rewards.leafCoins,
        co2Saved: result.rewards.co2Saved,
        badges: result.badges?.map((badge) => badge.title)
      });
    }
    await load();
  }

  function mergeUserMission(userMission: MissionRewardResult["userMission"]) {
    const apply = (mission: Mission): Mission => {
      if (mission.missionId !== userMission.missionId) return mission;
      return {
        ...mission,
        userMission,
        userStatus: userMission.status,
        status: userMission.status,
        progress: userMission.progress,
        targetCount: userMission.targetCount,
        rewardsClaimed: userMission.rewardsClaimed,
        verificationStatus: userMission.verificationStatus,
        trustScore: userMission.trustScore,
        rewardStatus: userMission.rewardStatus,
        xpAwarded: userMission.xpAwarded,
        leafCoinsAwarded: userMission.leafCoinsAwarded,
        co2SavedAwarded: userMission.co2SavedAwarded,
        proofs: userMission.proofs ?? mission.proofs,
        verificationDetails: userMission.verificationDetails ?? mission.verificationDetails
      };
    };
    setGroups((current) => ({
      daily: current.daily.map(apply),
      weekly: current.weekly.map(apply),
      special: current.special.map(apply)
    }));
    setRecommended((current) => current.map(apply));
  }

  async function start(id: string) {
    await startMission(id);
    setMessage("Mission started. Progress is saved.");
    await load();
  }

  async function progress(id: string) {
    await applyResult(await updateMissionProgress(id));
  }

  async function complete(id: string) {
    await applyResult(await completeMission(id));
  }

  async function verify(id: string) {
    await applyResult(await verifyMission(id));
  }

  async function claimReward(id: string) {
    await applyResult(await claimMissionReward(id));
  }

  async function uploadProof(id: string, proofMethod: MissionProofMethod, file?: File | null, note?: string): Promise<MissionProofUploadResult | void> {
    try {
      const result = await uploadMissionProof(id, proofMethod, file, note);
      if (result.user) setUser(result.user);
      if (result.userMission) mergeUserMission(result.userMission);
      setMessage(result.data?.verificationStatus === "verified" ? "Proof verified successfully." : result.message ?? "Proof uploaded.");
      getMissionSummary().then(setSummary).catch(() => undefined);
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        const payload = error.payload as MissionProofUploadResult | undefined;
        if (!payload?.userMission) {
          setMessage(error.message);
          throw error;
        }
        if (payload?.user) setUser(payload.user);
        if (payload?.userMission) mergeUserMission(payload.userMission);
        setMessage(payload?.data?.verificationStatus === "rejected" ? "Proof not accepted. See the mission card for what to upload next." : error.message);
        getMissionSummary().then(setSummary).catch(() => undefined);
        return payload;
      }
      setMessage("Proof could not be verified. Please try again.");
      throw error;
    }
  }

  const visibleMissions = useMemo(() => {
    const all = [...groups.daily, ...groups.weekly, ...groups.special];
    if (tab === "all") return all;
    if (tab === "completed") return all.filter((mission) => mission.userStatus === "completed");
    if (["daily", "weekly", "special"].includes(tab)) return groups[tab as "daily" | "weekly" | "special"];
    return all.filter((mission) => mission.category === tab);
  }, [groups, tab]);
  const unlocked = badges.filter((badge) => badge.unlocked);
  const nextBadge = badges.find((badge) => !badge.unlocked);

  return (
    <div className="space-y-6">
      <MissionHeroCard summary={summary} />

      {loading ? (
        <Card><p className="text-slate-300">Loading missions...</p></Card>
      ) : (
        <>
          <MoodMissionCard />
          {message && <Card><p className="text-amber-200">{message}</p></Card>}

          <RecommendedMissions missions={recommended} onStart={start} onProgress={progress} onComplete={complete} onVerify={verify} onClaimReward={claimReward} onUploadProof={uploadProof} />

          <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black">No guilt. Only better choices.</h2>
                <p className="mt-1 text-sm text-slate-400">Complete one mission to recharge your CarbonTwin.</p>
              </div>
              <MissionTabs active={tab} onChange={setTab} />
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleMissions.map((mission) => <MissionCard key={mission.missionId} mission={mission} onStart={start} onProgress={progress} onComplete={complete} onVerify={verify} onClaimReward={claimReward} onUploadProof={uploadProof} />)}
          </div>
          {!visibleMissions.length && <Card><p className="text-slate-400">No missions in this section yet.</p></Card>}

          <div className="grid gap-6 xl:grid-cols-[1fr_0.45fr]">
            <Card>
              <h2 className="text-xl font-bold">Badges Preview</h2>
              <p className="mt-1 text-sm text-slate-400">Your next badge is just a few missions away.</p>
              <div className="mt-4">
                <BadgesGrid badges={[...unlocked.slice(-3), ...badges.filter((badge) => !badge.unlocked).slice(0, 3)].slice(0, 6)} />
              </div>
            </Card>
            <NextBadgeCard badge={nextBadge} />
          </div>
        </>
      )}

      <RewardModal reward={reward} onClose={() => setReward(null)} />
    </div>
  );
}
