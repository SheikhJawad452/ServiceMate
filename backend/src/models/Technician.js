import mongoose from "mongoose";

const technicianLocationSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      maxlength: 80,
      index: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: 80,
      index: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: 80,
      index: true,
    },
  },
  { _id: false },
);

const technicianSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
      index: true,
    },
    bio: { type: String, trim: true, maxlength: 2000 },
    portfolio: [
      {
        title: { type: String, trim: true, maxlength: 120 },
        imageUrl: { type: String, trim: true, maxlength: 500 },
        description: { type: String, trim: true, maxlength: 500 },
      },
    ],
    experienceYears: { type: Number, min: 0, max: 70, default: 0 },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    location: {
      type: technicianLocationSchema,
      required: true,
    },
    geoLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: (value) => !value || value.length === 2,
          message: "GeoJSON coordinates must include [longitude, latitude]",
        },
      },
    },
    hourlyRate: { type: Number, min: 0, default: 0 },
    avgRating: { type: Number, min: 0, max: 5, default: 0, index: true },
    averageRating: { type: Number, min: 0, max: 5, default: 0, index: true },
    totalReviews: { type: Number, min: 0, default: 0 },
    completedBookings: { type: Number, min: 0, default: 0 },
    isAvailableForBooking: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

technicianSchema.index({ services: 1 });
technicianSchema.index({ "location.country": 1, "location.state": 1, "location.city": 1 });
technicianSchema.index({ geoLocation: "2dsphere" });

const Technician = mongoose.models.Technician || mongoose.model("Technician", technicianSchema);

export default Technician;
