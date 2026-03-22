import mongoose from "mongoose";

const technicianActivitySchema = new mongoose.Schema(
  {
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Technician",
      required: [true, "Technician reference is required"],
      index: true,
    },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", index: true },
    activityType: {
      type: String,
      required: [true, "Activity type is required"],
      enum: [
        "login",
        "profile_updated",
        "availability_updated",
        "booking_requested",
        "booking_confirmed",
        "booking_completed",
        "booking_cancelled",
        "review_received",
      ],
      index: true,
    },
    description: { type: String, trim: true, maxlength: 500 },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

technicianActivitySchema.index({ technician: 1, createdAt: -1 });
technicianActivitySchema.index({ technician: 1, activityType: 1, createdAt: -1 });

const TechnicianActivity =
  mongoose.models.TechnicianActivity ||
  mongoose.model("TechnicianActivity", technicianActivitySchema);

export default TechnicianActivity;
