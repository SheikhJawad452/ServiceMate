import mongoose from "mongoose";

const bookingLocationSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      maxlength: 80,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: 80,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: 80,
    },
    addressLine: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: 200,
    },
    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true,
      maxlength: 20,
    },
  },
  { _id: false },
);

const billItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Bill item name is required"],
      trim: true,
      maxlength: 150,
    },
    price: {
      type: Number,
      required: [true, "Bill item price is required"],
      min: 0,
    },
  },
  { _id: false },
);

const bookingSchema = new mongoose.Schema(
  {
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
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service reference is required"],
      index: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, "Scheduled date is required"],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Use 24h time format HH:mm"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Use 24h time format HH:mm"],
    },
    location: {
      type: bookingLocationSchema,
      required: [true, "Service location is required"],
    },
    phone: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
      match: [/^\+?[0-9]{10,15}$/, "Please provide a valid contact number"],
    },
    mapUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/i, "Please provide a valid map URL"],
    },
    notes: {
      type: String,
      required: [true, "Booking note is required"],
      trim: true,
      maxlength: 1000,
    },
    totalPrice: { type: Number, required: true, min: 0 },
    serviceCharge: { type: Number, min: 0 },
    finalAmount: { type: Number, min: 0 },
    billItems: { type: [billItemSchema], default: [] },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Completed", "Cancelled"],
      default: "Pending",
      index: true,
    },
    cancellationReason: { type: String, trim: true, maxlength: 500 },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

bookingSchema.index({ technician: 1, scheduledDate: 1, startTime: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ technician: 1, status: 1, scheduledDate: 1 });

bookingSchema.pre("validate", function validateTimeRange(next) {
  if (this.startTime && this.endTime && this.startTime >= this.endTime) {
    return next(new Error("endTime must be later than startTime"));
  }
  return next();
});

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;
