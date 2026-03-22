import { Router } from "express";
import adminRoutes from "./adminRoutes.js";
import authRoutes from "./authRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import healthRoutes from "./healthRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import serviceRoutes from "./serviceRoutes.js";
import technicianRoutes from "./technicianRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/technicians", technicianRoutes);
router.use("/user", userRoutes);
router.use("/services", serviceRoutes);
router.use("/bookings", bookingRoutes);
router.use("/reviews", reviewRoutes);

export default router;
