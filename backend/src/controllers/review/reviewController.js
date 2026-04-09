import mongoose from "mongoose";
import Booking from "../../models/Booking.js";
import Review from "../../models/Review.js";
import Technician from "../../models/Technician.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import { buildPaginationMeta, parsePagination } from "../../utils/pagination.js";

const recalculateTechnicianRating = async (technicianId) => {
  const stats = await Review.aggregate([
    { $match: { technician: new mongoose.Types.ObjectId(technicianId), isVisible: true } },
    {
      $group: {
        _id: "$technician",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const avgRating = stats.length > 0 ? Number(stats[0].avgRating.toFixed(2)) : 0;
  const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;

  await Technician.findByIdAndUpdate(technicianId, {
    avgRating,
    averageRating: avgRating,
    totalReviews,
  });
};

const validateReviewPayload = ({ rating, comment }) => {
  if (rating === undefined) {
    throw new AppError("Rating is required.", 400);
  }
  if (Number(rating) < 1 || Number(rating) > 5) {
    throw new AppError("Rating must be between 1 and 5.", 400);
  }
  if (!String(comment || "").trim()) {
    throw new AppError("Comment is required.", 400);
  }
};

export const addReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  if (!bookingId) {
    throw new AppError("bookingId is required.", 400);
  }
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid bookingId.", 400);
  }
  validateReviewPayload({ rating, comment });

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }
  if (String(booking.user) !== String(req.user._id)) {
    throw new AppError("You can only review your own booking.", 403);
  }
  if (booking.status !== "Completed") {
    throw new AppError("Review can only be added for completed bookings.", 400);
  }

  const existingReview = await Review.findOne({ booking: booking._id });
  if (existingReview) {
    throw new AppError("A review already exists for this booking.", 409);
  }

  const review = await Review.create({
    booking: booking._id,
    user: req.user._id,
    technician: booking.technician,
    rating: Number(rating),
    comment: String(comment).trim(),
  });

  await recalculateTechnicianRating(booking.technician);

  res.status(201).json({
    status: "success",
    message: "Review added successfully.",
    data: review,
  });
});

export const checkReviewByBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid bookingId.", 400);
  }

  const review = await Review.findOne({
    booking: bookingId,
    user: req.user._id,
  }).select("rating comment updatedAt");

  if (!review) {
    return res.status(200).json({
      success: true,
      exists: false,
    });
  }

  return res.status(200).json({
    success: true,
    exists: true,
    review: {
      id: review._id,
      rating: review.rating,
      comment: review.comment,
      updatedAt: review.updatedAt,
    },
  });
});

export const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new AppError("Invalid reviewId.", 400);
  }
  validateReviewPayload({ rating, comment });

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError("Review not found.", 404);
  }
  if (String(review.user) !== String(req.user._id)) {
    throw new AppError("You can only edit your own review.", 403);
  }

  review.rating = Number(rating);
  review.comment = String(comment).trim();
  await review.save();

  await recalculateTechnicianRating(review.technician);

  return res.status(200).json({
    success: true,
    message: "Review updated successfully",
    data: review,
  });
});

export const getReviews = asyncHandler(async (req, res) => {
  const { technicianId } = req.query;
  const { page, limit, skip, isPaginated } = parsePagination(req.query);
  const query = { isVisible: true };

  if (technicianId) {
    if (!mongoose.Types.ObjectId.isValid(technicianId)) {
      throw new AppError("Invalid technicianId query value.", 400);
    }
    query.technician = technicianId;
  }

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate("user", "fullName avatarUrl")
      .populate("technician", "user avgRating averageRating")
      .populate("booking", "scheduledDate startTime endTime")
      .sort({ createdAt: -1 })
      .skip(isPaginated ? skip : 0)
      .limit(isPaginated ? limit : 0),
    Review.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    status: "success",
    results: reviews.length,
    data: reviews,
    pagination: buildPaginationMeta({ total, page, limit, isPaginated }),
  });
});
