import Booking from "../../models/Booking.js";
import Report from "../../models/Report.js";
import User from "../../models/User.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import { buildPaginationMeta, parsePagination } from "../../utils/pagination.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isVerified, isActive } = req.query;
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
  const query = {};

  if (role) query.role = role;
  if (isVerified !== undefined) query.isVerified = String(isVerified) === "true";
  if (isActive !== undefined) query.isActive = String(isActive) === "true";

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    status: "success",
    page,
    limit,
    total,
    results: users.length,
    data: users,
    pagination: buildPaginationMeta({ total, page, limit, isPaginated: true }),
  });
});

export const blockUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true, runValidators: true }).select(
    "-password",
  );

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  res.status(200).json({
    status: "success",
    message: "User blocked successfully.",
    data: user,
  });
});

export const activateUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(id, { isActive: true }, { new: true, runValidators: true }).select(
    "-password",
  );

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  res.status(200).json({
    status: "success",
    message: "User activated successfully.",
    data: user,
  });
});

export const getAllBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
  const query = {};

  if (status) query.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate("user", "fullName email")
      .populate("technician", "user location")
      .populate("service", "serviceName price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    status: "success",
    page,
    limit,
    total,
    results: bookings.length,
    data: bookings,
    pagination: buildPaginationMeta({ total, page, limit, isPaginated: true }),
  });
});

export const getReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
  const query = {};

  if (status) query.status = status;

  const [reports, total] = await Promise.all([
    Report.find(query)
      .populate("reporter", "fullName email role")
      .populate("reportedUser", "fullName email role")
      .populate("booking", "status scheduledDate")
      .populate("review", "rating")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    status: "success",
    page,
    limit,
    total,
    results: reports.length,
    data: reports,
    pagination: buildPaginationMeta({ total, page, limit, isPaginated: true }),
  });
});

export const updateReportByAdmin = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status, resolutionNote } = req.body;
  const allowedStatuses = ["open", "under_review", "resolved", "dismissed"];

  if (!allowedStatuses.includes(status)) {
    throw new AppError("Invalid report status.", 400);
  }

  const report = await Report.findById(reportId);
  if (!report) {
    throw new AppError("Report not found.", 404);
  }

  report.status = status;
  if (resolutionNote !== undefined) {
    report.resolutionNote = resolutionNote;
  }

  if (status === "resolved" || status === "dismissed") {
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
  } else {
    report.resolvedBy = undefined;
    report.resolvedAt = undefined;
  }

  await report.save();

  res.status(200).json({
    status: "success",
    message: "Report updated successfully.",
    data: report,
  });
});
