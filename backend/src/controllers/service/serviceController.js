import mongoose from "mongoose";
import Service from "../../models/Service.js";
import Technician from "../../models/Technician.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";

const getTechnicianForUser = async (userId) => {
  const technician = await Technician.findOne({ user: userId });
  if (!technician) {
    throw new AppError("Technician profile not found. Create a profile first.", 404);
  }
  return technician;
};

export const createService = asyncHandler(async (req, res) => {
  const { serviceName, description, price } = req.body;
  if (!serviceName || price === undefined) {
    throw new AppError("serviceName and price are required.", 400);
  }

  const technician = await getTechnicianForUser(req.user._id);

  const service = await Service.create({
    technician: technician._id,
    serviceName,
    description,
    price,
  });

  await Technician.findByIdAndUpdate(technician._id, { $addToSet: { services: service._id } });

  res.status(201).json({
    status: "success",
    message: "Service created successfully.",
    data: service,
  });
});

export const getMyServices = asyncHandler(async (req, res) => {
  const technician = await getTechnicianForUser(req.user._id);
  const services = await Service.find({ technician: technician._id }).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: services.length,
    data: services,
  });
});

export const getServices = asyncHandler(async (req, res) => {
  const { technicianId } = req.query;
  const query = {};

  if (technicianId) {
    if (!mongoose.Types.ObjectId.isValid(technicianId)) {
      throw new AppError("Invalid technicianId query value.", 400);
    }
    query.technician = technicianId;
  }

  const services = await Service.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: services.length,
    data: services,
  });
});

export const getServiceById = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new AppError("Service not found.", 404);
  }

  res.status(200).json({
    status: "success",
    data: service,
  });
});

export const updateService = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { serviceName, description, price, isActive } = req.body;
  const technician = await getTechnicianForUser(req.user._id);

  const service = await Service.findOne({ _id: serviceId, technician: technician._id });
  if (!service) {
    throw new AppError("Service not found for this technician.", 404);
  }

  if (serviceName !== undefined) service.serviceName = serviceName;
  if (description !== undefined) service.description = description;
  if (price !== undefined) service.price = price;
  if (isActive !== undefined) service.isActive = isActive;

  await service.save();

  res.status(200).json({
    status: "success",
    message: "Service updated successfully.",
    data: service,
  });
});

export const deleteService = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const technician = await getTechnicianForUser(req.user._id);

  const deleted = await Service.findOneAndDelete({ _id: serviceId, technician: technician._id });
  if (!deleted) {
    throw new AppError("Service not found for this technician.", 404);
  }

  await Technician.findByIdAndUpdate(technician._id, { $pull: { services: deleted._id } });

  res.status(200).json({
    status: "success",
    message: "Service deleted successfully.",
  });
});
