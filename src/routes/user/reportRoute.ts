import { Router } from "express";
import * as reportController from "../../controllers/user/reportController";
import { requireRole } from "../../middlewares/roleMiddleware";
import { tryCatch } from "../../utils/tryCatch";

const router = Router();

// ----------------------------
// Routes
router.get(
  "/reports/",
  requireRole("user"),
  tryCatch(reportController.getReport)
);

// ----------------------------
export default router;
