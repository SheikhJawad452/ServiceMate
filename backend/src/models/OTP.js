import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      index: true,
    },
    code: {
      type: String,
      required: [true, "OTP code is required"],
      trim: true,
      minlength: 4,
      maxlength: 10,
    },
    purpose: {
      type: String,
      enum: ["email_verification", "password_reset", "login"],
      default: "email_verification",
      index: true,
    },
    attempts: { type: Number, min: 0, max: 10, default: 0 },
    isUsed: { type: Boolean, default: false, index: true },
    expiresAt: {
      type: Date,
      required: [true, "OTP expiry is required"],
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true },
);

otpSchema.index({ email: 1, purpose: 1, isUsed: 1 });
otpSchema.index({ user: 1, purpose: 1, createdAt: -1 });

const OTP = mongoose.models.OTP || mongoose.model("OTP", otpSchema);

export default OTP;
