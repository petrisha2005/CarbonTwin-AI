import express from "express";
import { mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { expectedProofForMission, validateMissionProof } from "../services/missionProofValidationService.js";
import { missionService } from "../services/missionService.js";
import { store } from "../services/store.js";

export const missionsRouter = express.Router();
missionsRouter.use(requireAuth);

const proofDir = join(tmpdir(), "carbontwin-mission-proofs");
mkdirSync(proofDir, { recursive: true });

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, proofDir),
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) cb(null, true);
    else cb(new Error("Unsupported proof file type"));
  }
});

function nextActionsFor(status: string, proofMethod: string) {
  if (status === "verified") return ["claim_reward"];
  if (status === "needs_review") {
    return proofMethod === "self_check"
      ? ["verify_with_eco_quest", "upload_better_proof"]
      : ["upload_better_proof", "verify_with_eco_quest", "mark_as_self_check"];
  }
  if (status === "rejected") return ["upload_correct_proof", "view_required_proof", "verify_with_eco_quest"];
  return ["wait_for_review"];
}

function canClaimRewardFor(status: string) {
  return status === "verified";
}

missionsRouter.get("/", async (req: AuthedRequest, res, next) => {
  try {
    res.json(await missionService.list(req.user!.id));
  } catch (error) {
    next(error);
  } finally {
    if (req.file?.path) await unlink(req.file.path).catch(() => undefined);
  }
});

missionsRouter.get("/recommended", async (req: AuthedRequest, res, next) => {
  try {
    res.json({ missions: await missionService.recommended(req.user!.id) });
  } catch (error) {
    next(error);
  }
});

missionsRouter.get("/my", async (req: AuthedRequest, res, next) => {
  try {
    res.json(await missionService.my(req.user!.id));
  } catch (error) {
    next(error);
  }
});

missionsRouter.get("/summary", async (req: AuthedRequest, res, next) => {
  try {
    res.json(await missionService.summary(req.user!.id));
  } catch (error) {
    next(error);
  }
});

missionsRouter.post("/:missionId/start", async (req: AuthedRequest, res, next) => {
  try {
    res.json({ userMission: await missionService.start(req.user!.id, String(req.params.missionId)) });
  } catch (error) {
    next(error);
  }
});

missionsRouter.post("/:missionId/progress", async (req: AuthedRequest, res, next) => {
  try {
    const { amount } = z.object({ amount: z.coerce.number().min(1).max(20).default(1) }).parse(req.body ?? {});
    const result = await missionService.progress(req.user!.id, String(req.params.missionId), amount);
    res.json({ ...result, user: await store.findUser(req.user!.id) });
  } catch (error) {
    next(error);
  }
});

missionsRouter.post("/:missionId/complete", async (req: AuthedRequest, res, next) => {
  try {
    const result = await missionService.complete(req.user!.id, String(req.params.missionId));
    res.json({ ...result, user: await store.findUser(req.user!.id) });
  } catch (error) {
    next(error);
  }
});

missionsRouter.post("/:missionId/verify", async (req: AuthedRequest, res, next) => {
  try {
    const { date } = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() }).parse(req.body ?? {});
    const result = await missionService.verify(req.user!.id, String(req.params.missionId), date);
    res.json({ ...result, rewards: null, badges: [], user: await store.findUser(req.user!.id) });
  } catch (error) {
    next(error);
  }
});

missionsRouter.get("/:missionId/verification-status", async (req: AuthedRequest, res, next) => {
  try {
    res.json(await missionService.verificationStatus(req.user!.id, String(req.params.missionId)));
  } catch (error) {
    next(error);
  }
});

missionsRouter.post("/:missionId/claim-reward", async (req: AuthedRequest, res, next) => {
  try {
    const result = await missionService.claimReward(req.user!.id, String(req.params.missionId));
    res.json({ ...result, user: await store.findUser(req.user!.id) });
  } catch (error) {
    next(error);
  }
});

missionsRouter.post("/:missionId/upload-proof", (req: AuthedRequest, res, next) => {
  upload.single("proof")(req, res, (error: any) => {
    if (!error) return next();
    if (error.code === "LIMIT_FILE_SIZE") return res.status(400).json({ success: false, code: "FILE_TOO_LARGE", message: "File size must be below 5MB." });
    if (error.message === "Unsupported proof file type") return res.status(400).json({ success: false, code: "INVALID_FILE_TYPE", message: "Please upload a valid image or PDF proof." });
    return next(error);
  });
}, async (req: AuthedRequest, res, next) => {
  try {
    const input = z.object({
      proofMethod: z.enum(["eco_quest_match", "photo_proof", "bill_or_receipt", "ticket_or_pass", "self_check"], { required_error: "Choose proof method" }),
      proofType: z.string().optional(),
      optionalNote: z.string().max(500).optional(),
      note: z.string().max(500).optional()
    }).parse(req.body ?? {});
    if (!req.file && !["eco_quest_match", "self_check"].includes(input.proofMethod)) {
      return res.status(400).json({ success: false, code: "MISSING_FILE", message: "Proof file is required" });
    }
    const status = await missionService.verificationStatus(req.user!.id, String(req.params.missionId));
    const analysis = await validateMissionProof({
      mission: status.mission,
      userMission: status.userMission,
      userId: req.user!.id,
      file: req.file,
      proofMethod: input.proofMethod,
      optionalNote: input.optionalNote ?? input.note
    });
    const proof = {
      proofType: input.proofType ?? input.proofMethod,
      proofMethod: input.proofMethod,
      fileName: req.file?.originalname,
      fileMimeType: req.file?.mimetype,
      fileSize: req.file?.size,
      uploadedAt: new Date(),
      extractedTextPreview: analysis.extractedTextPreview,
      extractedText: analysis.extractedText,
      validationStatus: analysis.verificationStatus,
      validationResult: analysis.verificationStatus,
      trustScore: analysis.trustScore,
      matchedEvidence: analysis.matchedEvidence,
      validationMessage: analysis.validationMessage,
      rejectionReason: analysis.rejectionReason,
      expectedProof: analysis.expectedProof || expectedProofForMission(status.mission),
      reviewerNote: input.optionalNote || input.note || analysis.validationMessage,
      matchedFields: analysis.matchedEvidence ?? []
    };
    const result = await missionService.recordProof(req.user!.id, String(req.params.missionId), proof);
    const canClaimReward = canClaimRewardFor(analysis.verificationStatus);
    const responseData = {
      missionId: String(req.params.missionId),
      userMissionId: result.userMission.id,
      proof: {
        fileName: proof.fileName,
        proofMethod: proof.proofMethod,
        uploadedAt: proof.uploadedAt
      },
      verificationStatus: analysis.verificationStatus,
      trustScore: analysis.trustScore,
      validationMessage: analysis.validationMessage,
      rejectionReason: analysis.rejectionReason,
      matchedEvidence: analysis.matchedEvidence,
      expectedProof: proof.expectedProof,
      canClaimReward,
      nextActions: nextActionsFor(analysis.verificationStatus, input.proofMethod)
    };
    if (analysis.verificationStatus === "rejected") {
      return res.status(400).json({
        success: false,
        code: "PROOF_NOT_RELEVANT",
        message: "Proof does not match this mission.",
        data: responseData,
        ...result,
        proof,
        rewards: null,
        badges: [],
        user: await store.findUser(req.user!.id)
      });
    }
    res.json({
      success: true,
      data: responseData,
      message: analysis.validationMessage,
      ...result,
      proof,
      rewards: null,
      badges: [],
      user: await store.findUser(req.user!.id)
    });
  } catch (error) {
    next(error);
  }
});
