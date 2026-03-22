import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Technician",
      required: [true, "Technician reference is required"],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },
    isVisible: { type: Boolean, default: true, index: true },
    adminReply: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

reviewSchema.index({ technician: 1, createdAt: -1 });
reviewSchema.index({ user: 1, technician: 1 });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
