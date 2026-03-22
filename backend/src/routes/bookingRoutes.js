import { Router } from "express";
import {
  cancelBookingByUser,
  completeBookingWithBill,
  createBooking,
  downloadBookingPdf,
  getTechnicianBookings,
  getUserBookings,
  getMyBookings,
  updateBookingStatus,
} from "../controllers/booking/bookingController.js";
import { authorizeRoles, protect } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, authorizeRoles("user"), createBooking);
router.patch(
  "/cancel/:bookingId",
  protect,
  authorizeRoles("user"),
  cancelBookingByUser,
);
router.patch(
  "/complete/:bookingId",
  protect,
  authorizeRoles("technician"),
  completeBookingWithBill,
);
router.patch(
  "/:bookingId/status",
  protect,
  authorizeRoles("user", "technician", "admin"),
  updateBookingStatus,
);
router.get("/user", protect, authorizeRoles("user"), getUserBookings);
router.get("/:bookingId/pdf", protect, authorizeRoles("user", "technician", "admin"), downloadBookingPdf);
router.get("/technician", protect, authorizeRoles("technician"), getTechnicianBookings);
router.get("/my", protect, authorizeRoles("user", "technician", "admin"), getMyBookings);

export default router;
