import mongoose from "mongoose";
import Service from "../../models/Service.js";
import Technician from "../../models/Technician.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import { uploadImageBufferToCloudinary } from "../../utils/uploadToCloudinary.js";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFilterQuery = async ({ city, state, country, service, minRating, minExperience }) => {
  const query = {};

  const normalizedCity = typeof city === "string" ? city.trim() : "";
  const normalizedState = typeof state === "string" ? state.trim() : "";
  const normalizedCountry = typeof country === "string" ? country.trim() : "";
  const normalizedService = typeof service === "string" ? service.trim() : "";

  if (normalizedCity) {
    query["location.city"] = { $regex: `^${escapeRegExp(normalizedCity)}$`, $options: "i" };
  }
  if (normalizedState) query["location.state"] = normalizedState;
  if (normalizedCountry) query["location.country"] = normalizedCountry;

  if (normalizedService) {
    let serviceIds = [];
    if (mongoose.Types.ObjectId.isValid(normalizedService)) {
      serviceIds = [normalizedService];
    } else {
      const matchedServices = await Service.find({
        serviceName: { $regex: escapeRegExp(normalizedService), $options: "i" },
      }).select("_id");
      serviceIds = matchedServices.map((item) => item._id);
    }

    if (serviceIds.length === 0) {
      return { _id: null };
    }
    query.services = { $in: serviceIds };
  }

  if (minRating !== undefined) {
    query.averageRating = { $gte: Number(minRating) || 0 };
  }

  if (minExperience !== undefined) {
    query.experienceYears = { $gte: Number(minExperience) || 0 };
  }

  return query;
};

export const createTechnicianProfile = asyncHandler(async (req, res) => {
  const { bio, portfolio, experienceYears, services, location, hourlyRate, geoLocation } = req.body;

  if (!location?.country || !location?.state || !location?.city) {
    throw new AppError("Location must include country, state, and city.", 400);
  }

  const existingProfile = await Technician.findOne({ user: req.user._id });
  if (existingProfile) {
    throw new AppError("Technician profile already exists for this user.", 409);
  }

  let linkedServices = [];
  if (Array.isArray(services) && services.length > 0) {
    const hasInvalidServiceId = services.some((serviceId) => !mongoose.Types.ObjectId.isValid(serviceId));
    if (hasInvalidServiceId) {
      throw new AppError("One or more selected services are invalid.", 400);
    }

    const validServiceCount = await Service.countDocuments({ _id: { $in: services } });
    if (validServiceCount !== services.length) {
      throw new AppError("One or more selected services are invalid.", 400);
    }
    linkedServices = services;
  }

  const technician = await Technician.create({
    user: req.user._id,
    bio,
    portfolio: Array.isArray(portfolio) ? portfolio : [],
    experienceYears,
    services: linkedServices,
    location: {
      country: location.country,
      state: location.state,
      city: location.city,
    },
    hourlyRate,
    ...(geoLocation ? { geoLocation } : {}),
  });

  const populated = await Technician.findById(technician._id)
    .populate("user", "fullName email role")
    .populate("services", "serviceName description price");

  res.status(201).json({
    status: "success",
    message: "Technician profile created successfully.",
    data: populated,
  });
});

export const getTechnicians = asyncHandler(async (req, res) => {
  const { city, state, country, service, minRating, minExperience } = req.query;
  const query = await buildFilterQuery({ city, state, country, service, minRating, minExperience });

  const technicians = await Technician.find(query)
    .populate("user", "fullName avatarUrl")
    .populate("services", "serviceName description price")
    .sort({ averageRating: -1, experienceYears: -1, createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: technicians.length,
    data: technicians,
  });
});

export const getTechniciansByCity = asyncHandler(async (req, res) => {
  const { city } = req.params;
  const { service, minRating, minExperience, state, country } = req.query;
  const query = await buildFilterQuery({ city, state, country, service, minRating, minExperience });

  const technicians = await Technician.find(query)
    .populate("user", "fullName avatarUrl")
    .populate("services", "serviceName description price")
    .sort({ averageRating: -1, experienceYears: -1, createdAt: -1 });

  res.status(200).json({
    status: "success",
    city,
    results: technicians.length,
    data: technicians,
  });
});

export const getTechnicianById = asyncHandler(async (req, res) => {
  const { technicianId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(technicianId)) {
    throw new AppError("Invalid technician id.", 400);
  }

  const technician = await Technician.findOne({ _id: technicianId })
    .populate("user", "fullName avatarUrl")
    .populate("services", "serviceName description price");

  if (!technician) {
    throw new AppError("Technician not found.", 404);
  }

  res.status(200).json({
    status: "success",
    data: technician,
  });
});

export const getMyTechnicianProfile = asyncHandler(async (req, res) => {
  const technician = await Technician.findOne({ user: req.user._id })
    .populate("user", "fullName avatarUrl email")
    .populate("services", "serviceName description price");

  if (!technician) {
    throw new AppError("Technician profile not found.", 404);
  }

  res.status(200).json({
    status: "success",
    data: technician,
  });
});

export const addPortfolioItem = asyncHandler(async (req, res) => {
  const { title, imageUrl, description } = req.body;
  if (!title) {
    throw new AppError("Portfolio title is required.", 400);
  }

  const technician = await Technician.findOne({ user: req.user._id });
  if (!technician) {
    throw new AppError("Technician profile not found.", 404);
  }

  let resolvedImageUrl = imageUrl;
  if (req.file?.buffer) {
    const uploaded = await uploadImageBufferToCloudinary(req.file.buffer);
    resolvedImageUrl = uploaded.secure_url;
  }

  if (!resolvedImageUrl) {
    throw new AppError("Portfolio image is required.", 400);
  }

  technician.portfolio.push({ title, imageUrl: resolvedImageUrl, description });
  await technician.save();

  res.status(200).json({
    status: "success",
    message: "Portfolio item added successfully.",
    data: technician,
  });
});

export const updatePortfolioItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { title, description } = req.body;

  const technician = await Technician.findOne({ user: req.user._id });
  if (!technician) {
    throw new AppError("Technician profile not found.", 404);
  }

  const portfolioItem = technician.portfolio.id(itemId);
  if (!portfolioItem) {
    throw new AppError("Portfolio item not found.", 404);
  }

  const hasTitle = Object.prototype.hasOwnProperty.call(req.body, "title");
  const hasDescription = Object.prototype.hasOwnProperty.call(req.body, "description");
  const hasImage = Boolean(req.file?.buffer);

  if (!hasTitle && !hasDescription && !hasImage) {
    throw new AppError("At least one field is required to update portfolio item.", 400);
  }

  if (hasTitle) {
    const normalizedTitle = String(title || "").trim();
    if (!normalizedTitle) {
      throw new AppError("Portfolio title is required.", 400);
    }
    portfolioItem.title = normalizedTitle;
  }

  if (hasDescription) {
    portfolioItem.description = String(description || "").trim();
  }

  if (hasImage) {
    const uploaded = await uploadImageBufferToCloudinary(req.file.buffer);
    portfolioItem.imageUrl = uploaded.secure_url;
  }

  await technician.save();

  res.status(200).json({
    status: "success",
    message: "Portfolio item updated successfully.",
    data: technician,
  });
});

export const deletePortfolioItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const technician = await Technician.findOne({ user: req.user._id });

  if (!technician) {
    throw new AppError("Technician profile not found.", 404);
  }

  const portfolioItem = technician.portfolio.id(itemId);
  if (!portfolioItem) {
    throw new AppError("Portfolio item not found.", 404);
  }

  portfolioItem.deleteOne();
  await technician.save();

  res.status(200).json({
    status: "success",
    message: "Portfolio item deleted successfully.",
    data: technician,
  });
});
