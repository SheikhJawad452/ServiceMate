import { Router } from "express";
import {
  forgotPassword,
  login,
  me,
  resetPassword,
  signup,
  verifyOtp,
  verifyResetOtp,
} from "../controllers/auth/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.get("/me", protect, me);

export default router;
