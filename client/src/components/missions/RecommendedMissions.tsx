import { Sparkles } from "lucide-react";
import { MissionCard } from "./MissionCard";
import type { Mission } from "../../lib/types";
import type { MissionProofMethod, MissionProofUploadResult } from "../../services/missionService";

export function RecommendedMissions({
  missions,
  onStart,
  onProgress,
  onComplete,
  onVerify,
  onClaimReward,
  onUploadProof
}: {
  missions: Mission[];
  onStart: (id: string) => void;
  onProgress: (id: string) => void;
  onComplete: (id: string) => void;
  onVerify: (id: string) => void;
  onClaimReward: (id: string) => void;
  onUploadProof: (id: string, proofMethod: MissionProofMethod, file?: File | null, note?: string) => Promise<MissionProofUploadResult | void>;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><Sparkles className="text-neon-green" /> Recommended for your CarbonTwin</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {missions.map((mission) => <MissionCard key={mission.missionId} mission={mission} onStart={onStart} onProgress={onProgress} onComplete={onComplete} onVerify={onVerify} onClaimReward={onClaimReward} onUploadProof={onUploadProof} />)}
      </div>
      {!missions.length && <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">Complete an Eco Quest to unlock personalized recommendations.</p>}
    </section>
  );
}
