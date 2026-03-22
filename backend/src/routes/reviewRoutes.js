import { Router } from "express";
import { addReview, checkReviewByBooking, getReviews, updateReview } from "../controllers/review/reviewController.js";
import { authorizeRoles, protect } from "../middleware/auth.js";

const router = Router();

router.get("/", getReviews);
router.get("/check/:bookingId", protect, authorizeRoles("user"), checkReviewByBooking);
router.post("/", protect, authorizeRoles("user"), addReview);
router.patch("/:reviewId", protect, authorizeRoles("user"), updateReview);

export default router;
