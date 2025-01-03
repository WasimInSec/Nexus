import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    bio: { type: String, default: "" },
    gender: { type: String, enum: ["male", "female"] },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    likeHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    isMFAEnabled: { type: Boolean, default: true },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    emailVerified: { type: Boolean, default: false },
    otpVerified: { type: Boolean, default: false },
    lastLoginIP: { type: String },
    isFlag: { type: Boolean, default: false },
    flagAddedAt: { type: Date, default: null },
    lastLoginLocation: {
      latitude: String,
      longitude: String,
      place: String,
    },
    flagged: { type: mongoose.Schema.Types.ObjectId, ref: "Flag" },
    IPReputation: { risk: String, score: Number },
    deviceFingerPrint: { type: String, default: "" },
    vpnHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        isVpn: { type: Boolean, required: true },
        vpnProvider: String,
        confidenceScore: Number,
        ip: String,
        location: {
          city: String,
          region: String,
          country: String,
        },
      },
    ],
    currentVpnStatus: {
      isVpn: { type: Boolean, default: false },
      vpnProvider: String,
      detectedAt: Date,
      confidenceScore: Number,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
