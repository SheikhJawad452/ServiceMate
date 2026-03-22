import { Router } from "express";
import {
  activateUserByAdmin,
  blockUserByAdmin,
  getAllBookings,
  getAllUsers,
  getReports,
  updateReportByAdmin,
} from "../controllers/admin/adminController.js";
import { authorizeRoles, protect } from "../middleware/auth.js";

const router = Router();

router.use(protect, authorizeRoles("admin"));

router.patch("/users/:id/block", blockUserByAdmin);
router.patch("/users/:id/activate", activateUserByAdmin);
router.get("/users", getAllUsers);
router.get("/bookings", getAllBookings);
router.get("/reports", getReports);
router.patch("/reports/:reportId", updateReportByAdmin);

export default router;
