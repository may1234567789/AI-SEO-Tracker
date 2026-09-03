import mongoose from "mongoose";

const rankHistorySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now, required: true },
    position: { type: Number, required: true, default: null },
    title: { type: String, default: null },
    snippet: { type: String, default: null },
}, { _id: false });

const competitorSchema = new mongoose.Schema({
    position: { type: Number, default: null, required: true },
    url: { type: String, default: null, required: true },
    domain: { type: String, default: null, required: true },
    title: { type: String, default: null },
    snippet: { type: String, default: null },
}, { _id: false });

const keywordTrackingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    keyword: { type: String, required: true, trim: true, lowercase: true },
    url: { type: String, required: true, trim: true },
    domain: { type: String, required: true },
    currentPosition: { type: Number, default: null },
    bestPosition: { type: Number, default: null },
    positionChange: { type: Number, default: null },
    rankHistory: [rankHistorySchema],
    competitors: [competitorSchema],
    active: { type: Boolean, default: true },
    lastChecked: { type: Date, default: null },
    status: { type: String, enum: ["pending", "checking", "completed", 'failed'], default: "pending" },
}, { timestamps: true });

keywordTrackingSchema.index({ userId: 1, keyword: 1, url: 1 }, { unique: true });

const KeywordTracking = mongoose.model("KeywordTracking", keywordTrackingSchema);

export default KeywordTracking;