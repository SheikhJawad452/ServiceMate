import { Router } from "express";
import {
  addPortfolioItem,
  createTechnicianProfile,
  deletePortfolioItem,
  getTechnicianById,
  getMyTechnicianProfile,
  getTechnicians,
  getTechniciansByCity,
  updatePortfolioItem,
} from "../controllers/technician/technicianController.js";
import { authorizeRoles, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/", getTechnicians);
router.get("/city/:city", getTechniciansByCity);
router.get("/me/profile", protect, authorizeRoles("technician"), getMyTechnicianProfile);
router.get("/:technicianId", getTechnicianById);
router.post("/profile", protect, authorizeRoles("technician"), createTechnicianProfile);
router.post(
  "/me/portfolio",
  protect,
  authorizeRoles("technician"),
  upload.single("image"),
  addPortfolioItem,
);
router.patch(
  "/me/portfolio/:itemId",
  protect,
  authorizeRoles("technician"),
  upload.single("image"),
  updatePortfolioItem,
);
router.delete("/me/portfolio/:itemId", protect, authorizeRoles("technician"), deletePortfolioItem);

export default router;
