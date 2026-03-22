import { Router } from "express";
import {
  createService,
  deleteService,
  getMyServices,
  getServiceById,
  getServices,
  updateService,
} from "../controllers/service/serviceController.js";
import { authorizeRoles, protect } from "../middleware/auth.js";

const router = Router();

router.get("/", getServices);
router.get("/mine", protect, authorizeRoles("technician"), getMyServices);
router.get("/:serviceId", getServiceById);
router.post("/", protect, authorizeRoles("technician"), createService);
router.patch("/:serviceId", protect, authorizeRoles("technician"), updateService);
router.delete("/:serviceId", protect, authorizeRoles("technician"), deleteService);

export default router;
