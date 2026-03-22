import Technician from "../../models/Technician.js";
import User from "../../models/User.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";

const NAME_UPDATE_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  let technicianProfile = null;
  if (user.role === "technician") {
    technicianProfile = await Technician.findOne({ user: user._id }).select(
      "experienceYears bio hourlyRate location",
    );
  }

  res.status(200).json({
    success: true,
    message: "Profile fetched successfully.",
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        nameUpdatedAt: user.nameUpdatedAt || null,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        location: user.location || {},
      },
      technicianProfile,
    },
  });
});

export const upsertUserProfile = asyncHandler(async (req, res) => {
  const { fullName, state, city, country = "India", phone, experienceYears, bio, hourlyRate } = req.body;

  if (!state || !city) {
    throw new AppError("State and city are required.", 400);
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  if (fullName !== undefined) {
    const nextFullName = String(fullName).trim();
    if (!nextFullName) {
      throw new AppError("Full name is required.", 400);
    }

    if (nextFullName !== user.fullName) {
      if (user.nameUpdatedAt && Date.now() - new Date(user.nameUpdatedAt).getTime() < NAME_UPDATE_COOLDOWN_MS) {
        throw new AppError("You can update your name only once in 24 hours", 400);
      }
      user.fullName = nextFullName;
      user.nameUpdatedAt = new Date();
    }
  }

  user.location = { country, state, city };
  if (phone !== undefined) {
    user.phone = phone;
  }
  await user.save();

  let technicianProfile = null;
  if (user.role === "technician") {
    technicianProfile = await Technician.findOne({ user: user._id });

    if (!technicianProfile) {
      technicianProfile = await Technician.create({
        user: user._id,
        location: { country, state, city },
        experienceYears: experienceYears ?? 0,
        bio,
        hourlyRate: hourlyRate ?? 0,
      });
    } else {
      technicianProfile.location = { country, state, city };
      if (experienceYears !== undefined) technicianProfile.experienceYears = experienceYears;
      if (bio !== undefined) technicianProfile.bio = bio;
      if (hourlyRate !== undefined) technicianProfile.hourlyRate = hourlyRate;
      await technicianProfile.save();
    }
  }

  res.status(200).json({
    success: true,
    status: "success",
    message: "Profile updated successfully.",
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        nameUpdatedAt: user.nameUpdatedAt || null,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
      },
      technicianProfile,
    },
  });
});
