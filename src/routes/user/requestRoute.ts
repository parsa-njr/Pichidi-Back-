import { Router } from "express";
import * as requestController from "../../controllers/user/requestController";
import { requireRole } from "../../middlewares/roleMiddleware";
import { tryCatch } from "../../utils/tryCatch";

const router = Router();

// ----------------------------
// Routes
router.post(
  "/requests",
  requireRole("user"),
  tryCatch(requestController.createRequest)
);
router.get(
  "/requests",
  requireRole("user"),
  tryCatch(requestController.getRequest)
);

// ----------------------------
export default router;
