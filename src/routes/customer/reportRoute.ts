import { Router } from "express";
import * as reportController from "../../controllers/customer/reportController";
import { requireRole } from "../../middlewares/roleMiddleware";
import { tryCatch } from "../../utils/tryCatch";

const router = Router();



// ----------------------------
// Routes
router.get(
  "/get-location-users/:locationId",
  requireRole("customer"),
  tryCatch(reportController.getUsersBaseLocation)
);
router.get(
  "/get-user-base-report/",
  requireRole("customer"),
  tryCatch(reportController.getUserBaseReport)
);
router.get(
  "/get-date-base-report/",
  requireRole("customer"),
  tryCatch(reportController.getDateBaseLocation)
);

// ----------------------------
export default router;
