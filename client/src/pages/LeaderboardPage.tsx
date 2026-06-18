import { useEffect, useState } from "react";
import { CommunityImpactCard } from "../components/leaderboard/CommunityImpactCard";
import { LeaderboardTable } from "../components/leaderboard/LeaderboardTable";
import { LeaderboardTabs } from "../components/leaderboard/LeaderboardTabs";
import { TopThreePodium } from "../components/leaderboard/TopThreePodium";
import { MyRankCard } from "../components/leaderboard/MyRankCard";
import { CampusLeagueCard } from "../components/leaderboard/CampusLeagueCard";
import { ProfilePromptCard } from "../components/leaderboard/ProfilePromptCard";
import { Card } from "../components/Card";
import { useAuth } from "../context/AuthContext";
import {
  getCityLeaderboard,
  getCollegeLeaderboard,
  getCommunityImpact,
  getDepartmentLeaderboard,
  getGlobalLeaderboard,
  getMonthlyLeaderboard,
  getMyRanks,
  getWeeklyLeaderboard,
  type CommunityImpact,
  type LeaderboardResponse,
  type LeaderboardType,
  type MyRanks
} from "../services/leaderboardService";

const loaders = {
  global: getGlobalLeaderboard,
  city: getCityLeaderboard,
  college: getCollegeLeaderboard,
  department: getDepartmentLeaderboard,
  weekly: getWeeklyLeaderboard,
  monthly: getMonthlyLeaderboard
};

export function LeaderboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<LeaderboardType>("global");
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [impact, setImpact] = useState<CommunityImpact | null>(null);
  const [ranks, setRanks] = useState<MyRanks | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCommunityImpact().then(setImpact).catch(() => undefined);
    getMyRanks().then(setRanks).catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    loaders[tab]()
      .then(setData)
      .finally(() => setLoading(false));
  }, [tab]);

  const promptMessage =
    data?.needsProfileUpdate ? data.message :
    !user?.city || !user?.collegeName || !user?.department ? "Complete your profile to unlock local leaderboards." :
    "";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-neon-green">Leaderboard</p>
        <h1 className="mt-1 text-3xl font-black text-white">Campus Carbon League</h1>
        <p className="mt-2 text-slate-400">See how your eco actions compare with your community.</p>
      </div>

      <CommunityImpactCard impact={impact} />

      {promptMessage && <ProfilePromptCard message={promptMessage} />}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <MyRankCard ranks={ranks} />
        <CampusLeagueCard user={user} impact={impact} ranks={ranks} />
      </div>

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-black">Tiny actions. Big leaderboard moves.</h2>
            <p className="mt-1 text-sm text-slate-400">Switch tabs to compare global, local, campus, and period rankings.</p>
          </div>
          <LeaderboardTabs active={tab} onChange={setTab} />
        </div>
      </Card>

      {loading ? (
        <Card><p className="text-slate-300">Loading league standings...</p></Card>
      ) : data?.needsProfileUpdate ? (
        <ProfilePromptCard message={data.message} />
      ) : (
        <>
          <TopThreePodium users={data?.topUsers ?? []} currentUserId={data?.currentUser?.userId} />
          <LeaderboardTable data={data} type={tab} />
        </>
      )}
    </div>
  );
}
