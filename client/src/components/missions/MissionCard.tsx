import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Coins, FileUp, Info, Leaf, Play, Plus, SearchCheck, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../Button";
import { Card } from "../Card";
import { CustomSelect } from "../ui/CustomSelect";
import { MissionProgressBar } from "./MissionProgressBar";
import type { Mission } from "../../lib/types";
import type { MissionProofMethod, MissionProofUploadResult } from "../../services/missionService";

const verificationLabels: Record<string, string> = {
  self_check: "Self-check",
  eco_quest_match: "Eco Quest verified",
  photo_proof: "Photo proof",
  bill_or_receipt: "Bill/receipt",
  qr_code: "QR code",
  friend_verification: "Friend verification",
  location_optional: "Location optional"
};

export function MissionCard({
  mission,
  onStart,
  onProgress,
  onComplete,
  onVerify,
  onClaimReward,
  onUploadProof
}: {
  mission: Mission;
  onStart: (id: string) => void;
  onProgress: (id: string) => void;
  onComplete: (id: string) => void;
  onVerify: (id: string) => void;
  onClaimReward: (id: string) => void;
  onUploadProof: (id: string, proofMethod: MissionProofMethod, file?: File | null, note?: string) => Promise<MissionProofUploadResult | void>;
}) {
  const [confirmSelfCheck, setConfirmSelfCheck] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [selectedProofType, setSelectedProofType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [modalResult, setModalResult] = useState<MissionProofUploadResult["data"] | null>(null);
  const [modalError, setModalError] = useState("");
  const status = mission.userStatus ?? "not_started";
  const completed = status === "completed";
  const verificationStatus = mission.verificationStatus ?? "not_required";
  const rewardStatus = mission.rewardStatus ?? "not_claimed";
  const canSelfCheck = mission.verificationType === "self_check" || mission.allowSelfCheckFallback;
  const needsProof = mission.verificationType === "photo_proof" || mission.verificationType === "bill_or_receipt";
  const proofOptions = proofOptionsForMission(mission);
  const selectedMethod = selectedProofType as MissionProofMethod | "";
  const requiresFile = selectedMethod !== "" && !["eco_quest_match", "self_check"].includes(selectedMethod);
  const latestProof = latestProofFor(mission);
  const proofStatus = latestProof?.validationStatus ?? latestProof?.verificationStatus ?? (latestProof?.validationResult as any) ?? (mission.proofs?.length ? verificationStatus : "not_uploaded");

  function selfCheck() {
    setConfirmSelfCheck(false);
    onComplete(mission.missionId);
  }

  function openUpload(method?: MissionProofMethod) {
    setSelectedProofType(method ?? "");
    setModalResult(null);
    setModalError("");
    setUploadOpen(true);
  }

  async function upload() {
    if (!selectedMethod || (requiresFile && !file)) return;
    setUploading(true);
    setModalError("");
    try {
      const result = await onUploadProof(mission.missionId, selectedMethod, file, note);
      setModalResult(result?.data ?? null);
      setFile(null);
      setNote("");
    } catch (error: any) {
      setModalError(error?.message ?? "Proof could not be uploaded. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className={completed ? "border-neon-green/40 bg-neon-green/10" : ""}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-neon-cyan">{mission.category.replace("_", " ")}</p>
          <h3 className="mt-1 text-lg font-bold">{mission.title}</h3>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{status.replace("_", " ")}</p>
        </div>
        {completed ? <CheckCircle2 className="text-neon-green" /> : <Sparkles className="text-slate-500" />}
      </div>
      <p className="mt-3 text-sm text-slate-300">{mission.description}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-lg bg-neon-green/15 px-2 py-1 text-neon-green"><Leaf size={13} /> {mission.estimatedCO2Saving} kg</span>
        <span className="rounded-lg bg-white/10 px-2 py-1">{mission.xpReward} XP</span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-300/10 px-2 py-1 text-amber-200"><Coins size={13} /> {mission.leafCoinReward}</span>
        <span className="rounded-lg bg-white/10 px-2 py-1 capitalize">{mission.difficulty}</span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-300/10 px-2 py-1 text-cyan-200"><ShieldCheck size={13} /> {verificationLabels[mission.verificationType] ?? "Verification"}</span>
        <span className={`rounded-lg px-2 py-1 ${verificationStatus === "verified" ? "bg-neon-green/15 text-neon-green" : verificationStatus === "pending" || verificationStatus === "needs_review" ? "bg-amber-300/10 text-amber-200" : verificationStatus === "rejected" ? "bg-red-400/10 text-red-200" : "bg-white/10"}`}>
          {verificationStatus.replace("_", " ")}
        </span>
        <span className="rounded-lg bg-white/10 px-2 py-1">Trust {mission.trustScore ?? 0}</span>
        <span className="rounded-lg bg-white/10 px-2 py-1">{rewardStatus.replace("_", " ")}</span>
      </div>
      <p className="mt-3 rounded-lg bg-white/[0.04] p-3 text-xs text-slate-300">
        <span className="font-semibold text-slate-100">Required proof: </span>{expectedProofForMission(mission)}
      </p>
      {mission.verificationDetails?.reason && <p className="mt-2 text-xs text-slate-400">{mission.verificationDetails.reason}</p>}
      <ProofStatusPanel
        mission={mission}
        proof={latestProof}
        proofStatus={proofStatus}
        trustScore={latestProof?.trustScore ?? mission.trustScore ?? 0}
        rewardStatus={rewardStatus}
        onClaimReward={() => onClaimReward(mission.missionId)}
        onUploadBetter={() => openUpload(proofStatus === "rejected" ? undefined : selectedMethod || undefined)}
        onVerifyEcoQuest={() => onVerify(mission.missionId)}
        onSelfCheck={canSelfCheck ? () => setConfirmSelfCheck(true) : undefined}
      />
      <div className="mt-4">
        <MissionProgressBar progress={mission.progress ?? 0} target={mission.targetCount} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {status === "not_started" && <Button variant="secondary" onClick={() => onStart(mission.missionId)}><Play size={16} /> Start Mission</Button>}
        {status === "in_progress" && <Button variant="secondary" onClick={() => onProgress(mission.missionId)}><Plus size={16} /> Update Progress</Button>}
        {mission.verificationType === "eco_quest_match" && !completed && <Button onClick={() => onVerify(mission.missionId)}><SearchCheck size={16} /> Verify from Eco Quest</Button>}
        {(needsProof || proofOptions.length > 1) && !completed && <Button onClick={() => openUpload()}><FileUp size={16} /> {latestProof ? "Upload Better Proof" : "Add Proof"}</Button>}
        {!completed && canSelfCheck && <Button variant="secondary" onClick={() => setConfirmSelfCheck(true)}><CheckCircle2 size={16} /> Mark Done</Button>}
        {completed && rewardStatus !== "full_claimed" && verificationStatus === "verified" && <Button onClick={() => onClaimReward(mission.missionId)}><Coins size={16} /> Claim Reward</Button>}
        {completed && rewardStatus === "full_claimed" && <Button disabled><CheckCircle2 size={16} /> Reward Claimed</Button>}
      </div>
      {confirmSelfCheck && (
        <div className="mt-4 rounded-lg border border-neon-green/20 bg-[#111c18] p-4">
          <h4 className="font-bold">Confirm Mission Completion</h4>
          <p className="mt-2 text-sm text-slate-300">This mission is based on trust. Verified proof earns higher rewards.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={selfCheck}>Mark Done</Button>
            {needsProof && <Button variant="secondary" onClick={() => { setConfirmSelfCheck(false); setUploadOpen(true); }}>Add Proof Instead</Button>}
            <Button variant="ghost" onClick={() => setConfirmSelfCheck(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {uploadOpen && (
        <div className="mt-4 rounded-lg border border-neon-green/20 bg-[#111c18] p-4">
          <h4 className="font-bold">Upload Proof for {mission.title}</h4>
          <p className="mt-2 rounded-lg bg-white/[0.05] p-3 text-sm text-slate-300">
            <span className="font-semibold text-slate-100">Required proof: </span>{expectedProofForMission(mission)}
          </p>
          <div className="mt-4">
            <CustomSelect
              label="Proof method"
              value={selectedProofType}
              placeholder="Choose proof method"
              options={proofOptions}
              onChange={setSelectedProofType}
            />
          </div>
          {selectedMethod === "eco_quest_match" && <p className="mt-3 rounded-lg bg-neon-green/10 p-3 text-sm text-neon-green">This checks your latest Eco Quest answers. No file upload needed.</p>}
          {selectedMethod === "self_check" && <p className="mt-3 rounded-lg bg-amber-300/10 p-3 text-sm text-amber-100">Self-check may earn partial rewards only. Verified Eco Quest or relevant proof is needed for full rewards.</p>}
          {requiresFile && (
            <label className="mt-4 block">
              <span className="label">Proof file</span>
              <input className="field mt-1" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setModalResult(null); setModalError(""); }} />
            </label>
          )}
          <textarea className="field mt-3 min-h-20 resize-none" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note" />
          {modalError && <p className="mt-3 rounded-lg border border-red-300/30 bg-red-950/30 p-3 text-sm text-red-100">{modalError}</p>}
          {modalResult && <UploadResultPanel result={modalResult} />}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button disabled={uploading || !selectedMethod || (requiresFile && !file)} onClick={upload}>{requiresFile ? <FileUp size={16} /> : <SearchCheck size={16} />} {uploading ? "Checking Proof..." : requiresFile ? "Upload Proof" : "Verify Proof"}</Button>
            {modalResult && <Button variant="secondary" onClick={() => { setModalResult(null); setFile(null); setNote(""); }}>Upload Another</Button>}
            <Link to="/eco-quest"><Button variant="secondary">Go to Eco Quest</Button></Link>
            <Button variant="ghost" onClick={() => setUploadOpen(false)}>{modalResult ? "Done" : "Cancel"}</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

type LatestProof = NonNullable<Mission["proofs"]>[number];

function latestProofFor(mission: Mission): LatestProof | null {
  const proofs = mission.proofs ?? [];
  return proofs.length ? proofs[proofs.length - 1] : null;
}

function expectedProofForMission(mission: Mission) {
  const id = mission.missionId;
  if (id === "plant-based-meal" || id === "three-plant-based-meals") return "Upload a clear meal photo, vegetarian/vegan food receipt, or log plant-based meal in Eco Quest.";
  if (id === "public-transport-choice" || id === "three-public-transport-days") return "Upload bus/metro/train ticket or verify with Eco Quest transport data.";
  if (mission.category === "electricity") return "Upload electricity bill, appliance proof, or verify through Eco Quest electricity data.";
  if (id === "no-online-shopping-today" || id === "no-shopping-week") return "This mission is verified through Eco Quest shopping data. File upload is not required.";
  if (id === "avoid-plastic-bottle") return "Upload reusable bottle/bag photo or select avoided plastic in Eco Quest.";
  return mission.proofInstructions || "Upload proof that clearly matches this mission, or verify with Eco Quest if available.";
}

function proofMethodLabel(value?: string) {
  if (!value) return "Proof";
  return verificationLabels[value] ?? value.replace(/_/g, " ");
}

function formatUploadedAt(value?: string) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function ProofStatusPanel({
  mission,
  proof,
  proofStatus,
  trustScore,
  rewardStatus,
  onClaimReward,
  onUploadBetter,
  onVerifyEcoQuest,
  onSelfCheck
}: {
  mission: Mission;
  proof: LatestProof | null;
  proofStatus: string;
  trustScore: number;
  rewardStatus: string;
  onClaimReward: () => void;
  onUploadBetter: () => void;
  onVerifyEcoQuest: () => void;
  onSelfCheck?: () => void;
}) {
  const config = proofConfig(proofStatus);
  const reason = proof?.validationMessage || proof?.rejectionReason || mission.verificationDetails?.reason;
  return (
    <section className={`mt-4 rounded-lg border p-4 ${config.className}`}>
      <div className="flex items-start gap-3">
        <config.Icon className={config.iconClassName} size={20} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">{config.title}</p>
          <p className="mt-1 text-sm text-slate-200">{config.message}</p>
          {proof && (
            <dl className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
              <Detail label="File" value={proof.fileName || "No file required"} />
              <Detail label="Proof method" value={proofMethodLabel(proof.proofMethod || proof.proofType)} />
              <Detail label="Uploaded" value={formatUploadedAt(proof.uploadedAt)} />
              <Detail label="Trust" value={String(proof.trustScore ?? trustScore ?? 0)} />
            </dl>
          )}
          {reason && <p className="mt-3 text-xs leading-5 text-slate-200"><span className="font-semibold">Reason: </span>{reason}</p>}
          {(proof?.expectedProof || proofStatus === "rejected" || proofStatus === "needs_review") && (
            <p className="mt-2 text-xs leading-5 text-slate-300"><span className="font-semibold text-slate-100">Expected proof: </span>{proof?.expectedProof || expectedProofForMission(mission)}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {proofStatus === "verified" && rewardStatus !== "full_claimed" && <Button onClick={onClaimReward}><Coins size={16} /> Claim Reward</Button>}
            {proofStatus === "needs_review" && <Button variant="secondary" onClick={onUploadBetter}><FileUp size={16} /> Upload Better Proof</Button>}
            {proofStatus === "needs_review" && <Button variant="secondary" onClick={onVerifyEcoQuest}><SearchCheck size={16} /> Verify with Eco Quest</Button>}
            {proofStatus === "needs_review" && onSelfCheck && <Button variant="ghost" onClick={onSelfCheck}>Mark as Self-Check</Button>}
            {proofStatus === "rejected" && <Button variant="secondary" onClick={onUploadBetter}><FileUp size={16} /> Upload Correct Proof</Button>}
            {proofStatus === "rejected" && <Button variant="ghost" onClick={onUploadBetter}><Info size={16} /> View Required Proof</Button>}
            {proofStatus === "rejected" && <Button variant="secondary" onClick={onVerifyEcoQuest}><SearchCheck size={16} /> Verify with Eco Quest</Button>}
            {proofStatus === "not_uploaded" && <Button variant="secondary" onClick={onUploadBetter}><FileUp size={16} /> Add Proof</Button>}
          </div>
        </div>
      </div>
    </section>
  );
}

function UploadResultPanel({ result }: { result: NonNullable<MissionProofUploadResult["data"]> }) {
  const config = proofConfig(result.verificationStatus);
  const message = result.verificationStatus === "verified"
    ? "Proof verified successfully."
    : result.verificationStatus === "needs_review"
      ? "Proof uploaded, but needs review."
      : result.verificationStatus === "rejected"
        ? "Proof not accepted. Please upload correct proof."
        : "Checking proof.";
  return (
    <div className={`mt-4 rounded-lg border p-4 ${config.className}`}>
      <p className="font-bold text-white">{message}</p>
      <dl className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
        <Detail label="File" value={result.proof.fileName || "No file required"} />
        <Detail label="Trust" value={String(result.trustScore)} />
        <Detail label="Verified using" value={proofMethodLabel(result.proof.proofMethod)} />
        <Detail label="Status" value={result.verificationStatus.replace("_", " ")} />
      </dl>
      {(result.validationMessage || result.rejectionReason) && <p className="mt-3 text-sm text-slate-200">{result.validationMessage || result.rejectionReason}</p>}
    </div>
  );
}

function proofConfig(status: string) {
  if (status === "verified") {
    return { title: "Proof Verified", message: "Your proof matches this mission. You can claim your reward.", Icon: CheckCircle2, className: "border-neon-green/30 bg-neon-green/10", iconClassName: "text-neon-green" };
  }
  if (status === "needs_review") {
    return { title: "Proof Needs Review", message: "We received your proof, but could not confidently verify it.", Icon: AlertTriangle, className: "border-amber-300/30 bg-amber-300/10", iconClassName: "text-amber-200" };
  }
  if (status === "rejected") {
    return { title: "Proof Not Accepted", message: "This file does not match the mission requirement.", Icon: XCircle, className: "border-red-300/30 bg-red-950/30", iconClassName: "text-red-200" };
  }
  if (status === "pending") {
    return { title: "Checking Proof", message: "We are validating your uploaded proof.", Icon: Clock, className: "border-cyan-300/25 bg-cyan-300/10", iconClassName: "text-cyan-200" };
  }
  return { title: "Proof Status", message: "No proof has been uploaded yet.", Icon: FileUp, className: "border-white/10 bg-white/[0.04]", iconClassName: "text-slate-300" };
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-white/[0.06] px-3 py-2"><dt className="uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 font-semibold capitalize text-slate-100">{value}</dd></div>;
}

function proofOptionsForMission(mission: Mission): Array<{ value: MissionProofMethod; label: string }> {
  const id = mission.missionId;
  if (id === "public-transport-choice" || id === "three-public-transport-days") {
    return [
      { value: "eco_quest_match", label: "Eco Quest match" },
      { value: "ticket_or_pass", label: "Ticket or pass" }
    ];
  }
  if (id === "plant-based-meal" || id === "three-plant-based-meals") {
    return [
      { value: "eco_quest_match", label: "Eco Quest match" },
      { value: "photo_proof", label: "Meal photo" },
      { value: "bill_or_receipt", label: "Food bill or receipt" }
    ];
  }
  if (id === "avoid-food-delivery" || id === "no-online-shopping-today" || id === "no-shopping-week") {
    return [{ value: "eco_quest_match", label: "Eco Quest match" }];
  }
  if (id === "avoid-plastic-bottle") {
    return [
      { value: "eco_quest_match", label: "Eco Quest match" },
      { value: "photo_proof", label: "Reusable item photo" },
      { value: "self_check", label: "Self-check" }
    ];
  }
  if (mission.category === "electricity") {
    return [
      { value: "eco_quest_match", label: "Eco Quest match" },
      { value: "bill_or_receipt", label: "Electricity bill" },
      { value: "photo_proof", label: "Appliance photo" }
    ];
  }
  return [
    { value: "eco_quest_match", label: "Eco Quest match" },
    { value: "photo_proof", label: "Photo proof" },
    { value: "self_check", label: "Self-check" }
  ];
}
