import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Technician",
      required: [true, "Technician reference is required"],
      index: true,
    },
    serviceName: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

serviceSchema.index({ technician: 1, serviceName: 1 }, { unique: true });
serviceSchema.index({ serviceName: "text", description: "text" });

const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);

export default Service;
