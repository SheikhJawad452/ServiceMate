import { Router } from "express";
import { getUserProfile, upsertUserProfile } from "../controllers/user/userController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/profile", protect, getUserProfile);
router.post("/profile", protect, upsertUserProfile);

export default router;
