import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: [true, "Slot start time is required"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Use 24h time format HH:mm"],
    },
    endTime: {
      type: String,
      required: [true, "Slot end time is required"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Use 24h time format HH:mm"],
    },
  },
  { _id: false },
);

const availabilitySchema = new mongoose.Schema(
  {
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Technician",
      required: [true, "Technician reference is required"],
      index: true,
    },
    dayOfWeek: {
      type: Number,
      required: [true, "Day of week is required"],
      min: 0,
      max: 6,
    },
    slots: {
      type: [slotSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one slot is required",
      },
    },
    timezone: { type: String, trim: true, default: "UTC" },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

availabilitySchema.index({ technician: 1, dayOfWeek: 1 }, { unique: true });
availabilitySchema.index({ dayOfWeek: 1, isActive: 1 });

const Availability =
  mongoose.models.Availability || mongoose.model("Availability", availabilitySchema);

export default Availability;
