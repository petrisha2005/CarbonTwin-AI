import mongoose, { Schema } from "mongoose";

const userMissionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    missionId: { type: String, required: true },
    status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
    progress: { type: Number, default: 0 },
    targetCount: { type: Number, default: 1 },
    startedAt: Date,
    completedAt: Date,
    dateKey: String,
    weekKey: String,
    rewardsClaimed: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ["not_required", "pending", "verified", "rejected", "needs_review"], default: "not_required" },
    trustScore: { type: Number, default: 0 },
    proofs: {
      type: [
        {
          proofType: String,
          proofMethod: String,
          fileUrl: String,
          fileName: String,
          fileMimeType: String,
          fileSize: Number,
          uploadedAt: Date,
          extractedText: String,
          extractedTextPreview: String,
          validationResult: String,
          validationStatus: String,
          trustScore: Number,
          matchedEvidence: [String],
          validationMessage: String,
          rejectionReason: String,
          expectedProof: String,
          reviewerNote: String
        }
      ],
      default: []
    },
    verifiedAt: Date,
    rejectedAt: Date,
    verificationMessage: String,
    verificationDetails: {
      matchedEcoQuest: Boolean,
      matchedFields: [String],
      reason: String,
      verifiedAt: Date
    },
    rewardStatus: { type: String, enum: ["not_claimed", "partial_claimed", "full_claimed"], default: "not_claimed" },
    xpReward: { type: Number, default: 0 },
    leafCoinReward: { type: Number, default: 0 },
    co2SavedReward: { type: Number, default: 0 },
    progressEvents: { type: [String], default: [] }
  },
  { timestamps: true }
);

userMissionSchema.index({ userId: 1, missionId: 1, dateKey: 1, weekKey: 1 }, { unique: true });

export const UserMission = mongoose.model("UserMission", userMissionSchema);
