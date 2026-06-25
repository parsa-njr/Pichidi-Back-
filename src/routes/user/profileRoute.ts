import { Router } from "express";
import * as profileController from "../../controllers/user/ProfileController";
import { requireRole } from "../../middlewares/roleMiddleware";
import { tryCatch } from "../../utils/tryCatch";
import { uploadProfileImage } from "../../middlewares/multer";

const router = Router();

// ----------------------------
// Routes
router.put(
  "/profile",
  requireRole("user"),
  uploadProfileImage.single("profileImage"),
  tryCatch(profileController.editProfile)
);
router.get(
  "/profile",
  requireRole("user"),
  tryCatch(profileController.getProfile)
);

// ----------------------------
export default router;
