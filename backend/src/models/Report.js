import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter is required"],
      index: true,
    },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", index: true },
    review: { type: mongoose.Schema.Types.ObjectId, ref: "Review", index: true },
    category: {
      type: String,
      required: [true, "Report category is required"],
      enum: ["abuse", "fraud", "spam", "fake_profile", "payment_issue", "other"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Report description is required"],
      trim: true,
      minlength: 10,
      maxlength: 2500,
    },
    status: {
      type: String,
      enum: ["open", "under_review", "resolved", "dismissed"],
      default: "open",
      index: true,
    },
    resolutionNote: { type: String, trim: true, maxlength: 1500 },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ reportedUser: 1, createdAt: -1 });

const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);

export default Report;
