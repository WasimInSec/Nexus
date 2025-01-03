import mongoose from "mongoose";

const flagSchema = new mongoose.Schema({
  flaggedWords: [{ type: String }],
  positiveCount: { type: Number, default: 0 },
  negativeCount: { type: Number, default: 0 },
});

export const Flag = mongoose.model("Flag", flagSchema);
