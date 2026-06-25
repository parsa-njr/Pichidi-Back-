import { Router } from "express";
import * as profileController from "../../controllers/customer/profileController";
import { requireRole } from "../../middlewares/roleMiddleware";
import { tryCatch } from "../../utils/tryCatch";
import { uploadProfileImage } from "../../middlewares/multer";

const router = Router();


// ----------------------------
// Routes
router.put(
  "/profile",
  requireRole("customer"),
  uploadProfileImage.single("profileImage"),
  tryCatch(profileController.editProfile)
);
router.get(
  "/profile",
  requireRole("customer"),
  tryCatch(profileController.getProfile)
);

// ----------------------------
export default router;
